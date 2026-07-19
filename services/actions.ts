import { AppData, DayOfWeek, Habit, ModuleKey, RoutineItem, Task } from '../types';

type ActionPriorityInput = 'low' | 'medium' | 'high';

export type CreateTaskInput = {
  title: string;
  notes?: string;
  type?: Task['type'];
  moduleId?: ModuleKey;
  projectId?: string;
  habitId?: string;
  scheduledTime?: string;
  dueDate?: string;
  durationMinutes?: number;
  priority?: ActionPriorityInput;
};

export type RepeatingActionInput = CreateTaskInput & {
  timesPerWeek: number;
  daysOfWeek?: DayOfWeek[];
  minimum?: string;
};

export type NextAction = {
  id: string;
  title: string;
  time?: string;
  detail?: string;
  source: 'task' | 'routine' | 'habit';
  habitId?: string;
};

export type TodoAlignment = {
  aligned: boolean;
  score: number;
  reason: string;
  suggestedRewrite?: string;
  identityLink?: string;
  category: 'aligned' | 'maintenance' | 'maybeLater';
};

export function parseBulkActions(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .map(line => line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '').trim())
    .filter(Boolean);
}

export function createTaskFromInput(input: CreateTaskInput, now = Date.now()): Task {
  const scheduledTime = normalizeTime(input.scheduledTime);
  return {
    id: `task-${now}-${Math.floor(Math.random() * 10000)}`,
    title: input.title.trim(),
    notes: input.notes?.trim() || '',
    type: scheduledTime ? 'scheduled' : input.type ?? 'todo',
    moduleId: input.moduleId,
    projectId: input.projectId,
    habitId: input.habitId,
    scheduledTime,
    dueDate: input.dueDate?.trim() || undefined,
    durationMinutes: input.durationMinutes,
    estimatedMinutes: input.durationMinutes,
    repeat: { frequency: 'none' },
    area: areaFromModule(input.moduleId),
    priority: input.priority ?? 'medium',
    status: 'open',
    createdAt: new Date(now).toISOString(),
    alignmentNote: ''
  };
}

export function evaluateTodoAlignment(task: Pick<Task, 'title' | 'notes' | 'area' | 'moduleId' | 'projectId'>, appData: AppData): TodoAlignment {
  const active = appData.characters.find(character => character.id === appData.activeCharacterId) ?? appData.characters[0];
  const text = `${task.title} ${task.notes ?? ''} ${task.area ?? ''} ${task.moduleId ?? ''}`.toLowerCase();
  const values = active?.values ?? [];
  const weeklyFocus = appData.preferences.weeklyFocus ?? '';
  const desiredPerson = active?.desiredPerson ?? active?.identity ?? '';
  const season = appData.preferences.currentSeason ?? '';
  const focusTokens = tokens(`${weeklyFocus} ${desiredPerson}`);
  const valueMatch = values.find(value => text.includes(value.toLowerCase()));
  const focusMatch = focusTokens.find(token => text.includes(token));
  const necessary = /bill|pay|doctor|clinic|work|email|call|buy|grocer|clean|repair|appointment|visa|tax|rent|medicine|family/i.test(text);

  if (valueMatch || focusMatch || task.projectId) {
    const link = valueMatch ?? (weeklyFocus || desiredPerson);
    return {
      aligned: true,
      score: 86,
      reason: `Aligned with ${link ? link.toString().toLowerCase() : 'your current direction'}.`,
      identityLink: link,
      category: 'aligned'
    };
  }
  if (necessary) {
    return {
      aligned: true,
      score: 64,
      reason: 'Necessary task. Keep it small.',
      suggestedRewrite: smallRewrite(task.title, appData.preferences.dailyTimeBudget),
      identityLink: season,
      category: 'maintenance'
    };
  }
  return {
    aligned: false,
    score: 38,
    reason: 'Not central this week. Consider parking it.',
    suggestedRewrite: smallRewrite(task.title, appData.preferences.dailyTimeBudget),
    identityLink: weeklyFocus,
    category: 'maybeLater'
  };
}

export function alignmentLabel(alignment: TodoAlignment) {
  if (alignment.category === 'aligned') return 'Aligned';
  if (alignment.category === 'maintenance') return 'Useful but not central';
  return 'Maybe not for this season';
}

export function createRepeatingAction(input: RepeatingActionInput, now = Date.now()): { habit: Habit; routine: RoutineItem } {
  const title = input.title.trim();
  const id = `habit-${now}-${Math.floor(Math.random() * 10000)}`;
  const scheduledTime = normalizeTime(input.scheduledTime);
  const repeat = {
    frequency: 'weekly' as const,
    daysOfWeek: input.daysOfWeek,
    timesPerWeek: Math.max(1, Math.min(7, Number(input.timesPerWeek) || 1))
  };
  const habit: Habit = {
    id,
    habitId: id,
    name: title,
    title,
    type: 'habit',
    notes: input.notes?.trim() || '',
    frequency: `${repeat.timesPerWeek}x/week`,
    minimum: input.minimum?.trim() || title,
    why: input.notes?.trim() || 'Chosen as a repeating action',
    reminderTime: scheduledTime,
    scheduledTime,
    durationMinutes: input.durationMinutes,
    moduleId: input.moduleId,
    projectId: input.projectId,
    repeat,
    priority: input.priority ?? 'medium',
    status: 'open',
    createdAt: new Date(now).toISOString(),
    isVisibleToOthers: false,
    visibleTo: []
  };
  const routine: RoutineItem = {
    id: `routine-${now}-${Math.floor(Math.random() * 10000)}`,
    habitId: id,
    title,
    time: scheduledTime ?? '',
    scheduledTime,
    durationMinutes: input.durationMinutes,
    category: categoryFromModule(input.moduleId, title),
    type: 'habit',
    moduleId: input.moduleId,
    projectId: input.projectId,
    repeat,
    priority: input.priority ?? 'medium',
    status: 'open',
    createdAt: new Date(now).toISOString()
  };
  return { habit, routine };
}

export function getNextHourActions(data: AppData, now = new Date(), done: Record<string, boolean> = {}): NextAction[] {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const windowEnd = nowMinutes + 60;
  return getAllActions(data)
    .filter(action => !done[action.id])
    .map(action => ({ action, minutes: action.time ? toMinutes(action.time) : null }))
    .filter(({ minutes }) => minutes !== null && minutes >= nowMinutes && minutes <= windowEnd)
    .sort((a, b) => Number(a.minutes) - Number(b.minutes))
    .map(({ action }) => action);
}

export function getNextSmallAction(data: AppData, now = new Date(), habitInProgressId?: string, done: Record<string, boolean> = {}): NextAction | undefined {
  const nextHour = getNextHourActions(data, now, done).find(action => action.habitId !== habitInProgressId && action.id !== habitInProgressId);
  if (nextHour) return nextHour;
  return getAllActions(data).find(action => !done[action.id] && action.habitId !== habitInProgressId && action.id !== habitInProgressId);
}

function getAllActions(data: AppData): NextAction[] {
  const scheduledTasks = data.tasks
    .filter(task => task.scheduledTime && !isDone(task.status))
    .map(task => ({
      id: task.id,
      title: task.title,
      time: task.scheduledTime,
      detail: task.durationMinutes || task.estimatedMinutes ? `${task.durationMinutes ?? task.estimatedMinutes} min` : task.notes,
      source: 'task' as const,
      habitId: task.habitId
    }));
  const routine = data.routine
    .filter(item => item.category !== 'Rest' && !isDone(item.status))
    .map(item => ({
      id: item.id,
      title: item.title,
      time: item.scheduledTime ?? item.time,
      detail: item.durationMinutes ? `${item.durationMinutes} min` : item.repeat?.timesPerWeek ? `${item.repeat.timesPerWeek}x/week` : undefined,
      source: 'routine' as const,
      habitId: item.habitId
    }));
  const tasks = data.tasks
    .filter(task => !task.scheduledTime && !isDone(task.status))
    .map(task => ({
      id: task.id,
      title: task.title,
      detail: task.durationMinutes || task.estimatedMinutes ? `${task.durationMinutes ?? task.estimatedMinutes} min` : task.notes,
      source: 'task' as const,
      habitId: task.habitId
    }));
  return [...scheduledTasks, ...routine, ...tasks];
}

function isDone(status: Task['status'] | RoutineItem['status'] | undefined) {
  return status === 'done' || status === 'Done';
}

function normalizeTime(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return undefined;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return undefined;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function toMinutes(time: string): number | null {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function areaFromModule(moduleId?: ModuleKey): Task['area'] {
  if (moduleId === 'learning') return 'Learning';
  if (moduleId === 'health' || moduleId === 'womenHealth') return 'Health';
  if (moduleId === 'projects') return 'Project';
  return 'Personal';
}

function categoryFromModule(moduleId: ModuleKey | undefined, title: string): RoutineItem['category'] {
  if (moduleId === 'learning' || /learn|study|read/i.test(title)) return 'Learning';
  if (moduleId === 'health' || /walk|stretch|water|sleep|movement/i.test(title)) return 'Body';
  if (moduleId === 'projects') return 'Work';
  return 'Home';
}

function tokens(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= 4 && !['someone', 'becoming', 'build', 'routine', 'this', 'week'].includes(token));
}

function smallRewrite(title: string, dailyTimeBudget?: AppData['preferences']['dailyTimeBudget']) {
  const time = dailyTimeBudget === '5 min' ? '5 minutes' : dailyTimeBudget === '30 min' ? '30 minutes' : '15 minutes';
  return `Do the ${time} version of: ${title}`;
}
