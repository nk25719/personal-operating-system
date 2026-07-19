import { AiPlanSuggestion, AppData } from '../types';

export type AiPlanInput = {
  desiredPerson: string;
  preferredName?: string;
  values?: string[];
  currentSeason?: string;
  weeklyFocus?: string;
  energyPattern?: AppData['preferences']['energyPattern'];
  dailyTimeBudget?: AppData['preferences']['dailyTimeBudget'];
  preferredTone?: AppData['preferences']['preferredTone'];
  enabledModules?: string[];
  existingHabits?: string[];
  existingTasks?: string[];
  existingProjects?: string[];
};

export const aiPlanSystemPrompt = [
  'You suggest identity-aligned habits for a personal operating system.',
  'Return only JSON matching AiPlanSuggestion.',
  'Be gentle, practical, and concise.',
  'No shame language. No medical, legal, or financial claims.',
  'Do not over-plan. Prefer tiny actions.',
  'Explain why each habit supports the desired identity.',
  'The user must approve before anything is added.'
].join(' ');

export function buildAiPlanPrompt(input: AiPlanInput) {
  return [
    aiPlanSystemPrompt,
    '',
    `User context: ${JSON.stringify(input)}`,
    '',
    'Contract:',
    JSON.stringify({
      summary: 'short sentence',
      suggestedValues: ['value'],
      weeklyFocus: 'one weekly focus',
      habits: [{ title: 'habit', why: 'identity reason', tinyVersion: 'smallest version', timesPerWeek: 3, preferredTime: 'optional HH:mm' }],
      routine: [{ title: 'routine item', time: 'optional HH:mm', durationMinutes: 5 }],
      nextActions: [{ title: 'next action', reason: 'why now', estimatedMinutes: 5 }],
      recommendedModules: [{ moduleId: 'habits', reason: 'why this helps' }],
      cautions: ['short caution'],
      userChoices: ['accept', 'edit', 'skip']
    } satisfies AiPlanSuggestion)
  ].join('\n');
}

export function buildAiPlanInputFromAppData(data: AppData, desiredPersonOverride?: string): AiPlanInput {
  const active = data.characters.find(character => character.id === data.activeCharacterId) ?? data.characters[0];
  return {
    desiredPerson: desiredPersonOverride?.trim() || active?.desiredPerson || active?.identity || '',
    preferredName: data.preferences.preferredName || active?.name,
    values: active?.values ?? [],
    currentSeason: data.preferences.currentSeason,
    weeklyFocus: data.preferences.weeklyFocus,
    energyPattern: data.preferences.energyPattern,
    dailyTimeBudget: data.preferences.dailyTimeBudget,
    preferredTone: data.preferences.preferredTone ?? data.preferences.tone,
    enabledModules: data.modules.filter(module => module.enabled).map(module => module.key),
    existingHabits: data.habits.map(habit => habit.name),
    existingTasks: data.tasks.map(task => task.title),
    existingProjects: data.projects.map(project => project.name)
  };
}
