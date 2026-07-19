import { AppData, Habit, ModuleKey, TonePreference } from '../types';

export type OnboardingTone = Extract<TonePreference, 'gentle' | 'direct' | 'practical' | 'structured'>;
export type LifeSeason = 'rebuilding' | 'growing' | 'overwhelmed' | 'steady' | 'exploring';
export type EnergyPattern = 'low' | 'mixed' | 'good';
export type DailyTimeBudget = '5 min' | '15 min' | '30 min' | 'flexible';

export type OnboardingInput = {
  preferredName: string;
  username: string;
  pronouns?: string;
  currentSeason: LifeSeason | string;
  values: string[];
  weeklyFocus: string;
  energyPattern: EnergyPattern;
  dailyTimeBudget: DailyTimeBudget;
  habits: string[];
  recommendedModules: ModuleKey[];
  tone: OnboardingTone;
};

export function shouldShowOnboarding(data: AppData) {
  return !data.preferences.onboardingCompleted;
}

export function applyOnboarding(data: AppData, input: OnboardingInput, now = Date.now()): AppData {
  const values = input.values.map(value => value.trim()).filter(Boolean).slice(0, 3);
  const currentSeason = input.currentSeason.trim();
  const habits = input.habits.map(habit => habit.trim()).filter(Boolean).slice(0, 3);
  const activeCharacterId = data.activeCharacterId || data.characters[0]?.id;
  const onboardingHabits = habits
    .filter(habit => !data.habits.some(existing => sameHabitName(existing.name, habit)))
    .map((habit, index) => createOnboardingHabit(habit, now + index));
  const preferredName = input.preferredName.trim();
  const username = input.username.trim();
  const weeklyFocus = input.weeklyFocus.trim();

  return {
    ...data,
    userProfile: {
      ...data.userProfile,
      username: username || data.userProfile?.username,
      displayName: preferredName || data.userProfile?.displayName,
      pronouns: input.pronouns?.trim() || data.userProfile?.pronouns
    },
    characters: data.characters.map(character => character.id === activeCharacterId ? {
      ...character,
      desiredPerson: weeklyFocus ? `Someone becoming steadier through ${weeklyFocus}.` : character.desiredPerson,
      dailyObligations: currentSeason || character.dailyObligations,
      values: values.length ? values : character.values
    } : character),
    habits: [...onboardingHabits, ...data.habits],
    modules: data.modules.map(module => ({
      ...module,
      enabled: input.recommendedModules.includes(module.key) || module.enabled
    })),
    preferences: {
      ...data.preferences,
      preferredName: preferredName || data.preferences.preferredName,
      tone: input.tone,
      currentSeason: currentSeason || data.preferences.currentSeason,
      weeklyFocus: weeklyFocus || data.preferences.weeklyFocus,
      energyPattern: input.energyPattern,
      dailyTimeBudget: input.dailyTimeBudget,
      recommendedModules: input.recommendedModules,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(now).toISOString()
    }
  };
}

function createOnboardingHabit(name: string, now: number): Habit {
  return {
    id: `habit-onboarding-${now}`,
    name,
    frequency: 'Daily',
    minimum: name,
    why: 'Chosen as the smallest promise to the person I am becoming',
    reminderTime: '',
    isVisibleToOthers: false,
    visibleTo: []
  };
}

function sameHabitName(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function suggestHabits(input: Pick<OnboardingInput, 'weeklyFocus' | 'energyPattern' | 'dailyTimeBudget'>) {
  const focus = input.weeklyFocus.toLowerCase();
  const tiny = input.dailyTimeBudget === '5 min' || input.energyPattern === 'low';
  const suggestions = ['write one thought'];
  if (/health|stress|routine|energy|feel/i.test(focus)) suggestions.unshift(tiny ? '2-minute walk' : '10-minute walk');
  if (/learn|study|german/i.test(focus)) suggestions.unshift(tiny ? '5 minutes German' : '15 minutes learning');
  if (/project|finish|career/i.test(focus)) suggestions.unshift('prepare tomorrow’s first step');
  if (!suggestions.includes('drink water after waking')) suggestions.push('drink water after waking');
  return [...new Set(suggestions)].slice(0, 3);
}

export function recommendModules(input: Pick<OnboardingInput, 'weeklyFocus' | 'values'>): ModuleKey[] {
  const focus = `${input.weeklyFocus} ${input.values.join(' ')}`.toLowerCase();
  const modules = new Set<ModuleKey>(['habits', 'learning']);
  if (/project|career|finish|work/.test(focus)) modules.add('projects');
  if (/health|stress|energy|sleep/.test(focus)) modules.add('health');
  if (/relationship|family|peace/.test(focus)) modules.add('environment');
  if (/decision|money|independence/.test(focus)) modules.add('decision');
  return [...modules];
}
