import { AppData, Habit, TonePreference } from '../types';

export type OnboardingTone = Extract<TonePreference, 'gentle' | 'direct' | 'practical' | 'reflective'>;

export type OnboardingInput = {
  desiredPerson: string;
  currentSeason: string;
  values: string[];
  tinyHabit: string;
  tone: OnboardingTone;
};

export function shouldShowOnboarding(data: AppData) {
  return !data.preferences.onboardingCompleted;
}

export function applyOnboarding(data: AppData, input: OnboardingInput, now = Date.now()): AppData {
  const values = input.values.map(value => value.trim()).filter(Boolean).slice(0, 3);
  const desiredPerson = input.desiredPerson.trim();
  const currentSeason = input.currentSeason.trim();
  const tinyHabit = input.tinyHabit.trim();
  const activeCharacterId = data.activeCharacterId || data.characters[0]?.id;
  const onboardingHabit = tinyHabit ? createOnboardingHabit(tinyHabit, now) : null;

  return {
    ...data,
    characters: data.characters.map(character => character.id === activeCharacterId ? {
      ...character,
      desiredPerson: desiredPerson || character.desiredPerson,
      dailyObligations: currentSeason || character.dailyObligations,
      values: values.length ? values : character.values
    } : character),
    habits: onboardingHabit && !data.habits.some(habit => sameHabitName(habit.name, tinyHabit))
      ? [onboardingHabit, ...data.habits]
      : data.habits,
    preferences: {
      ...data.preferences,
      tone: input.tone,
      currentSeason: currentSeason || data.preferences.currentSeason,
      onboardingCompleted: true
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
