import { emptyUserData } from '../data/seed';
import { AppData, Habit, LearningTopic, ModuleKey, Project, RoutineItem, Task, TonePreference } from '../types';

export type OnboardingTone = Extract<TonePreference, 'gentle' | 'direct' | 'practical' | 'structured'>;
export type LifeSeason = 'rebuilding' | 'growing' | 'overwhelmed' | 'steady' | 'exploring';
export type EnergyPattern = 'low' | 'mixed' | 'good';
export type DailyTimeBudget = '5 min' | '15 min' | '30 min' | 'flexible';

export type OnboardingInput = {
  authUserId?: string;
  email?: string | null;
  preferredName: string;
  username: string;
  pronouns?: string;
  desiredPerson: string;
  currentSeason: LifeSeason | string;
  values: string[];
  mainAreas?: string[];
  weeklyFocus: string;
  energyPattern: EnergyPattern;
  dailyTimeBudget: DailyTimeBudget;
  habits: string[];
  startingRoutine?: string[];
  recommendedModules: ModuleKey[];
  tone: OnboardingTone;
  healthContext?: string;
  learningGoal?: string;
  relationshipPreference?: string;
};

export type OnboardingSetupContract = {
  requiredAnswers: [
    'preferredName',
    'username',
    'desiredPerson',
    'currentSeason',
    'values',
    'weeklyFocus',
    'energyPattern',
    'preferredTone',
    'dailyTimeBudget',
    'enabledModules',
    'startingHabits',
    'startingRoutine'
  ];
  generatedAppData: [
    'authUserId',
    'email',
    'activeCharacterId',
    'characters',
    'preferences',
    'modules',
    'routine',
    'habits',
    'emptyProjectsTasksCaptureInbox'
  ];
};

export const onboardingSetupContract: OnboardingSetupContract = {
  requiredAnswers: [
    'preferredName',
    'username',
    'desiredPerson',
    'currentSeason',
    'values',
    'weeklyFocus',
    'energyPattern',
    'preferredTone',
    'dailyTimeBudget',
    'enabledModules',
    'startingHabits',
    'startingRoutine'
  ],
  generatedAppData: [
    'authUserId',
    'email',
    'activeCharacterId',
    'characters',
    'preferences',
    'modules',
    'routine',
    'habits',
    'emptyProjectsTasksCaptureInbox'
  ]
};

export function validateOnboardingInput(input: OnboardingInput): string | null {
  if (!input.preferredName.trim()) return 'Add your preferred name.';
  if (!input.username.trim()) return 'Choose a username.';
  if (!input.desiredPerson.trim()) return 'Add the person you are becoming.';
  if (!input.currentSeason.trim()) return 'Choose your current season.';
  if (!input.values.map(value => value.trim()).filter(Boolean).length) return 'Choose at least one value.';
  if (!input.weeklyFocus.trim()) return 'Choose one weekly focus.';
  if (!input.energyPattern) return 'Choose your energy pattern.';
  if (!input.tone) return 'Choose your recommendation tone.';
  if (!input.dailyTimeBudget) return 'Choose your daily time.';
  if (!input.recommendedModules.length) return 'Choose at least one module.';
  if (!input.habits.map(habit => habit.trim()).filter(Boolean).length) return 'Keep or write one tiny habit.';
  if (!input.startingRoutine?.map(item => item.trim()).filter(Boolean).length) return 'Keep or write one starting routine step.';
  return null;
}

export function shouldShowOnboarding(data: AppData) {
  return !data.preferences.onboardingCompleted;
}

export function applyOnboarding(data: AppData, input: OnboardingInput, now = Date.now()): AppData {
  return buildAppDataFromOnboarding(
    { uid: input.authUserId || data.userProfile?.authUserId || '', email: input.email ?? data.userProfile?.email ?? null },
    input,
    data,
    now
  );
}

export function buildAppDataFromOnboarding(
  authUser: { uid: string; email: string | null },
  input: OnboardingInput,
  baseData: AppData = emptyUserData,
  now = Date.now()
): AppData {
  const validationError = validateOnboardingInput(input);
  if (validationError) throw new Error(validationError);
  const values = input.values.map(value => value.trim()).filter(Boolean).slice(0, 3);
  const mainAreas = input.mainAreas?.map(value => value.trim()).filter(Boolean) ?? [];
  const currentSeason = input.currentSeason.trim();
  const habits = input.habits.map(habit => habit.trim()).filter(Boolean).slice(0, 3);
  const activeCharacterId = baseData.activeCharacterId || baseData.characters[0]?.id || 'self';
  const preferredName = input.preferredName.trim();
  const username = input.username.trim();
  const weeklyFocus = input.weeklyFocus.trim();
  const desiredPerson = input.desiredPerson.trim();
  const onboardingHabits = habits.map((habit, index) => createOnboardingHabit(habit, now + index));
  const routine = createOnboardingRoutine(onboardingHabits, input.dailyTimeBudget, input.startingRoutine);
  const existingCharacter = baseData.characters.find(character => character.id === activeCharacterId) ?? baseData.characters[0];
  const projects = createStarterProjects(weeklyFocus, values, now);
  const tasks = createStarterTasks(weeklyFocus, projects[0], input.dailyTimeBudget, now);
  const learningTopics = input.learningGoal?.trim() ? createLearningTopics(input.learningGoal.trim(), now) : [];
  const character = {
    ...(existingCharacter ?? {
      id: activeCharacterId,
      name: preferredName,
      identity: desiredPerson,
      missionQuestion: `What is one small step toward ${weeklyFocus} today?`,
      values: []
    }),
    id: activeCharacterId,
    name: preferredName,
    identity: desiredPerson,
    desiredPerson,
    dailyObligations: [currentSeason, weeklyFocus, ...mainAreas].filter(Boolean).join(' · '),
    missionQuestion: `What is one small step toward ${weeklyFocus} today?`,
    values,
    healthProfile: existingCharacter?.healthProfile ? {
      ...existingCharacter.healthProfile,
      enabled: Boolean(input.healthContext?.trim()) || existingCharacter.healthProfile.enabled,
      painOrEnergyNotes: input.healthContext?.trim() || existingCharacter.healthProfile.painOrEnergyNotes
    } : existingCharacter?.healthProfile,
    environmentProfile: existingCharacter?.environmentProfile ? {
      ...existingCharacter.environmentProfile,
      lifePurpose: weeklyFocus,
      futureSelfStatement: desiredPerson,
      valuesToProtect: values,
      desiredPeople: input.relationshipPreference?.trim() || existingCharacter.environmentProfile.desiredPeople
    } : existingCharacter?.environmentProfile
  };
  const completedAt = new Date(now).toISOString();

  return {
    ...baseData,
    userProfile: {
      ...baseData.userProfile,
      authUserId: authUser.uid,
      email: authUser.email,
      username,
      displayName: preferredName,
      pronouns: input.pronouns?.trim() || baseData.userProfile?.pronouns
    },
    activeCharacterId,
    characters: [character],
    routine,
    habits: onboardingHabits,
    projects,
    tasks,
    learningTopics,
    captureInbox: [],
    connectedAccounts: [],
    friends: input.relationshipPreference?.trim() ? [{
      id: `relationship-preference-${now}`,
      name: input.relationshipPreference.trim(),
      email: '',
      status: 'pending',
      sharedHabits: []
    }] : [],
    modules: baseData.modules.map(module => ({
      ...module,
      enabled: input.recommendedModules.includes(module.key)
    })),
    preferences: {
      ...baseData.preferences,
      preferredName,
      username,
      tone: input.tone,
      preferredTone: input.tone,
      currentSeason,
      weeklyFocus,
      energyPattern: input.energyPattern,
      dailyTimeBudget: input.dailyTimeBudget,
      recommendedModules: input.recommendedModules,
      onboardingCompleted: true,
      onboardingCompletedAt: completedAt
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

function createOnboardingRoutine(habits: Habit[], dailyTimeBudget: DailyTimeBudget, startingRoutine?: string[]): RoutineItem[] {
  const startTime = dailyTimeBudget === '5 min' ? '09:00-09:05' : dailyTimeBudget === '30 min' ? '09:00-09:30' : '09:00-09:15';
  const routineAnswers = startingRoutine?.map(item => item.trim()).filter(Boolean) ?? [];
  if (routineAnswers.length) {
    return routineAnswers.slice(0, 3).map((title, index) => ({
      id: `routine-onboarding-${index}`,
      time: index === 0 ? startTime : '',
      title,
      category: categoryForHabit(title)
    }));
  }
  const firstHabit = habits[0];
  if (!firstHabit) return [];
  return [{
    id: firstHabit.id,
    time: startTime,
    title: firstHabit.name,
    category: categoryForHabit(firstHabit.name)
  }];
}

function createStarterProjects(weeklyFocus: string, values: string[], now: number): Project[] {
  if (!/project|finish|launch|career|work|create|write/i.test(weeklyFocus)) return [];
  return [{
    id: `project-onboarding-${now}`,
    name: capitalize(weeklyFocus),
    area: values[0] ? capitalize(values[0]) : 'Personal',
    status: 'Active',
    nextAction: `Choose one small step for ${weeklyFocus}`,
    why: 'Created from first setup',
    progress: 0
  }];
}

function createStarterTasks(weeklyFocus: string, project: Project | undefined, dailyTimeBudget: DailyTimeBudget, now: number): Task[] {
  if (!weeklyFocus.trim()) return [];
  return [{
    id: `task-onboarding-${now}`,
    title: `Take one step toward ${weeklyFocus}`,
    notes: 'Keep it small enough to start today.',
    area: project ? 'Project' : 'Personal',
    status: 'Todo',
    priority: 'Medium',
    estimatedMinutes: dailyTimeBudget === '5 min' ? 5 : dailyTimeBudget === '30 min' ? 30 : 15,
    projectId: project?.id,
    alignmentNote: 'Created from first setup.'
  }];
}

function createLearningTopics(learningGoal: string, now: number): LearningTopic[] {
  return [{
    id: `learning-onboarding-${now}`,
    name: learningGoal,
    day: 'Flexible',
    nextAction: `Spend one small session on ${learningGoal}`,
    resources: []
  }];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function categoryForHabit(name: string): RoutineItem['category'] {
  if (/walk|stretch|movement|water|sleep|health/i.test(name)) return 'Body';
  if (/learn|german|read|study/i.test(name)) return 'Learning';
  if (/write|thought|journal/i.test(name)) return 'Mind';
  return 'Home';
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
