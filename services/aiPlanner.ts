import { AiPlanSuggestion, ModuleKey } from '../types';
import { buildAiPlanInputFromAppData, buildAiPlanPrompt, AiPlanInput } from './aiPrompts';
import { buildLocalAiPlan } from './localPlanner';
import { AppData } from '../types';

export type AiProvider = 'local' | 'openai-compatible' | 'ollama';

export type AiPlannerOptions = {
  provider?: AiProvider;
  endpoint?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
};

export async function suggestIdentityPlan(data: AppData, desiredPerson?: string, options: AiPlannerOptions = {}): Promise<AiPlanSuggestion> {
  const input = buildAiPlanInputFromAppData(data, desiredPerson);
  return suggestIdentityPlanFromInput(input, options);
}

export async function suggestIdentityPlanFromInput(input: AiPlanInput, options: AiPlannerOptions = {}): Promise<AiPlanSuggestion> {
  const provider = options.provider ?? configuredProvider();
  if (provider === 'local') return buildLocalAiPlan(input);
  try {
    if (provider === 'ollama') return await requestOllamaPlan(input, options);
    return await requestOpenAiCompatiblePlan(input, options);
  } catch {
    return buildLocalAiPlan(input);
  }
}

export function validateAiPlanSuggestion(value: unknown): AiPlanSuggestion | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<AiPlanSuggestion>;
  if (!isNonEmptyString(raw.summary) || !isNonEmptyString(raw.weeklyFocus)) return null;
  if (!Array.isArray(raw.habits) || !Array.isArray(raw.routine) || !Array.isArray(raw.nextActions) || !Array.isArray(raw.recommendedModules)) return null;
  const habits = raw.habits.filter(habit => habit && isNonEmptyString(habit.title) && isNonEmptyString(habit.why) && isNonEmptyString(habit.tinyVersion)).slice(0, 5).map(habit => ({
    title: habit.title.trim(),
    why: habit.why.trim(),
    tinyVersion: habit.tinyVersion.trim(),
    timesPerWeek: clamp(Number(habit.timesPerWeek) || 3, 1, 7),
    preferredTime: isNonEmptyString(habit.preferredTime) ? habit.preferredTime.trim() : undefined
  }));
  if (!habits.length) return null;
  return {
    summary: raw.summary.trim(),
    suggestedValues: Array.isArray(raw.suggestedValues) ? raw.suggestedValues.filter(isNonEmptyString).map(value => value.trim()).slice(0, 5) : [],
    weeklyFocus: raw.weeklyFocus.trim(),
    habits,
    routine: raw.routine.filter(item => item && isNonEmptyString(item.title)).slice(0, 5).map(item => ({
      title: item.title.trim(),
      time: isNonEmptyString(item.time) ? item.time.trim() : undefined,
      durationMinutes: clamp(Number(item.durationMinutes) || 5, 1, 120)
    })),
    nextActions: raw.nextActions.filter(item => item && isNonEmptyString(item.title) && isNonEmptyString(item.reason)).slice(0, 5).map(item => ({
      title: item.title.trim(),
      reason: item.reason.trim(),
      estimatedMinutes: clamp(Number(item.estimatedMinutes) || 5, 1, 120)
    })),
    recommendedModules: raw.recommendedModules.filter(item => item && isModuleKey(item.moduleId) && isNonEmptyString(item.reason)).slice(0, 6).map(item => ({
      moduleId: item.moduleId,
      reason: item.reason.trim()
    })),
    cautions: Array.isArray(raw.cautions) ? raw.cautions.filter(isNonEmptyString).map(item => item.trim()).slice(0, 4) : [],
    userChoices: ['accept', 'edit', 'skip']
  };
}

export function getAiPlannerProviderStatus(options: AiPlannerOptions = {}) {
  const provider = options.provider ?? configuredProvider();
  if (provider === 'local') return 'Using local planner.';
  if (provider === 'ollama') return isLocalDevHost() ? 'Using Ollama for local development.' : 'Ollama is local/dev only. Using local planner.';
  return (options.endpoint ?? process.env.EXPO_PUBLIC_AI_PLAN_ENDPOINT) ? 'Using backend AI planner proxy.' : 'No backend AI proxy configured. Using local planner.';
}

export function applyApprovedAiPlan(data: AppData, plan: AiPlanSuggestion, now = Date.now()): AppData {
  const existingHabitNames = new Set(data.habits.map(habit => habit.name.toLowerCase()));
  const habits = plan.habits
    .filter(habit => !existingHabitNames.has(habit.title.toLowerCase()))
    .map((habit, index) => ({
      id: `habit-ai-${now}-${index}`,
      habitId: `habit-ai-${now}-${index}`,
      name: habit.title,
      title: habit.title,
      type: 'habit' as const,
      frequency: `${habit.timesPerWeek}x/week`,
      minimum: habit.tinyVersion,
      why: habit.why,
      reminderTime: habit.preferredTime,
      scheduledTime: habit.preferredTime,
      repeat: { frequency: 'weekly' as const, timesPerWeek: habit.timesPerWeek },
      status: 'open' as const,
      priority: 'medium' as const,
      createdAt: new Date(now + index).toISOString(),
      isVisibleToOthers: false,
      visibleTo: []
    }));
  const routine = plan.routine.map((item, index) => ({
    id: `routine-ai-${now}-${index}`,
    title: item.title,
    time: item.time ?? '',
    scheduledTime: item.time,
    durationMinutes: item.durationMinutes,
    category: categoryForTitle(item.title),
    type: 'routine' as const,
    status: 'open' as const,
    priority: 'medium' as const,
    createdAt: new Date(now + index).toISOString()
  }));
  const tasks = plan.nextActions.map((item, index) => ({
    id: `task-ai-${now}-${index}`,
    title: item.title,
    notes: item.reason,
    type: 'todo' as const,
    area: 'Personal' as const,
    status: 'open' as const,
    priority: 'medium' as const,
    estimatedMinutes: item.estimatedMinutes,
    durationMinutes: item.estimatedMinutes,
    repeat: { frequency: 'none' as const },
    createdAt: new Date(now + index).toISOString(),
    alignmentNote: item.reason
  }));

  return {
    ...data,
    habits: [...habits, ...data.habits],
    routine: [...routine, ...data.routine],
    tasks: [...tasks, ...data.tasks],
    modules: data.modules.map(module => ({
      ...module,
      enabled: module.enabled || plan.recommendedModules.some(recommended => recommended.moduleId === module.key)
    })),
    preferences: {
      ...data.preferences,
      weeklyFocus: plan.weeklyFocus || data.preferences.weeklyFocus,
      recommendedModules: mergeModules(data.preferences.recommendedModules ?? [], plan.recommendedModules.map(module => module.moduleId))
    },
    characters: data.characters.map(character => character.id === data.activeCharacterId ? {
      ...character,
      values: mergeValues(character.values, plan.suggestedValues).slice(0, 5)
    } : character)
  };
}

async function requestOpenAiCompatiblePlan(input: AiPlanInput, options: AiPlannerOptions) {
  const endpoint = options.endpoint ?? process.env.EXPO_PUBLIC_AI_PLAN_ENDPOINT;
  if (!endpoint) throw new Error('OpenAI-compatible planning requires a backend proxy endpoint.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: buildAiPlanPrompt(input), input })
  });
  if (!response.ok) throw new Error('AI planner proxy failed.');
  const json = await response.json();
  const plan = validateAiPlanSuggestion(json?.suggestion ?? json);
  if (!plan) throw new Error('AI planner returned malformed output.');
  return plan;
}

async function requestOllamaPlan(input: AiPlanInput, options: AiPlannerOptions) {
  if (!isLocalDevHost()) throw new Error('Ollama planning is local/dev only.');
  const baseUrl = options.ollamaBaseUrl ?? process.env.EXPO_PUBLIC_OLLAMA_BASE_URL ?? 'http://localhost:11434';
  const model = options.ollamaModel ?? process.env.EXPO_PUBLIC_OLLAMA_MODEL ?? 'llama3.1:8b';
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt: buildAiPlanPrompt(input), stream: false, format: 'json' })
  });
  if (!response.ok) throw new Error('Ollama planner failed.');
  const json = await response.json();
  const parsed = typeof json.response === 'string' ? JSON.parse(json.response) : json.response;
  const plan = validateAiPlanSuggestion(parsed);
  if (!plan) throw new Error('Ollama returned malformed output.');
  return plan;
}

function configuredProvider(): AiProvider {
  const raw = process.env.EXPO_PUBLIC_AI_PROVIDER;
  if (raw === 'ollama' || raw === 'openai-compatible') return raw;
  return 'local';
}

function isLocalDevHost() {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (!host) return true;
  return host === 'localhost' || host === '127.0.0.1' || host === '';
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isModuleKey(value: unknown): value is ModuleKey {
  return ['habits', 'projects', 'learning', 'decision', 'lifeClock', 'womenHealth', 'health', 'environment', 'builder', 'ai'].includes(String(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function categoryForTitle(title: string) {
  if (/walk|stretch|movement|water|sleep|health/i.test(title)) return 'Body' as const;
  if (/learn|study|read|language|german/i.test(title)) return 'Learning' as const;
  if (/write|journal|plan|reset/i.test(title)) return 'Mind' as const;
  return 'Home' as const;
}

function mergeModules(current: ModuleKey[], incoming: ModuleKey[]) {
  return [...new Set([...current, ...incoming])];
}

function mergeValues(current: string[], incoming: string[]) {
  return [...new Set([...current, ...incoming].map(value => value.trim()).filter(Boolean))];
}
