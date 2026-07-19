import { AiPlanSuggestion, ModuleKey } from '../types';
import { AiPlanInput } from './aiPrompts';

type Rule = {
  test: RegExp;
  values: string[];
  moduleId: ModuleKey;
  habit: {
    title: string;
    tiny: string;
    why: string;
  };
  focus: string;
  action: string;
};

const rules: Rule[] = [
  {
    test: /healthy|strong|fit|energy|body|movement|stress|sleep/i,
    values: ['health', 'steadiness'],
    moduleId: 'health',
    habit: { title: 'Movement', tiny: 'Do 1 small movement or stretch.', why: 'A stronger identity is built through repeatable care for your body.' },
    focus: 'protect energy with one small body habit',
    action: 'Do one stretch or short walk'
  },
  {
    test: /learner|learning|language|german|study|student|read/i,
    values: ['learning', 'consistency'],
    moduleId: 'learning',
    habit: { title: 'Learning reps', tiny: 'Study for 5 minutes.', why: 'A learner becomes real through small, repeated sessions.' },
    focus: 'learn consistently in small sessions',
    action: 'Open one lesson and study for 5 minutes'
  },
  {
    test: /organized|calm|steady|routine|focused|peace/i,
    values: ['peace', 'clarity'],
    moduleId: 'habits',
    habit: { title: 'Daily reset', tiny: 'Write one next step.', why: 'A calmer life starts with one visible next action.' },
    focus: 'make the day simpler before adding more',
    action: 'Write the one step that would make today easier'
  },
  {
    test: /connected|parent|friend|family|relationship|support/i,
    values: ['relationships', 'care'],
    moduleId: 'environment',
    habit: { title: 'Connection check-in', tiny: 'Send one short message.', why: 'Connection grows through small, low-pressure contact.' },
    focus: 'care for one supportive connection',
    action: 'Send one short check-in'
  },
  {
    test: /creator|researcher|engineer|builder|writer|publish|project|career/i,
    values: ['craft', 'mastery'],
    moduleId: 'projects',
    habit: { title: 'Focus block', tiny: 'Work for 10 minutes.', why: 'A builder becomes visible through protected work blocks.' },
    focus: 'move one meaningful project forward',
    action: 'Open the project and work for 10 minutes'
  }
];

export function buildLocalAiPlan(input: AiPlanInput): AiPlanSuggestion {
  const desired = input.desiredPerson || input.weeklyFocus || 'a steady person';
  const matched = rules.filter(rule => rule.test.test(`${desired} ${input.weeklyFocus ?? ''} ${(input.values ?? []).join(' ')}`));
  const selected = (matched.length ? matched : [rules[2]]).slice(0, 5);
  const tinyMinutes = minutesFromBudget(input.dailyTimeBudget);
  const suggestedValues = mergeUnique([...(input.values ?? []), ...selected.flatMap(rule => rule.values)]).slice(0, 3);
  const weeklyFocus = input.weeklyFocus?.trim() || selected[0].focus;
  const habits = selected.map(rule => ({
    title: rule.habit.title,
    why: toneReason(rule.habit.why, input.preferredTone),
    tinyVersion: adaptTiny(rule.habit.tiny, tinyMinutes),
    timesPerWeek: input.dailyTimeBudget === '5 min' ? 3 : 5,
    preferredTime: '09:00'
  }));

  return {
    summary: `A small plan for becoming ${desired}.`,
    suggestedValues,
    weeklyFocus,
    habits,
    routine: habits.slice(0, 3).map((habit, index) => ({
      title: habit.title,
      time: index === 0 ? '09:00' : undefined,
      durationMinutes: tinyMinutes
    })),
    nextActions: selected.slice(0, 3).map(rule => ({
      title: rule.action,
      reason: `This supports ${weeklyFocus}.`,
      estimatedMinutes: tinyMinutes
    })),
    recommendedModules: uniqueModules(selected.map(rule => ({
      moduleId: rule.moduleId,
      reason: `Useful for ${rule.focus}.`
    }))),
    cautions: ['Keep the plan small enough to approve and edit.'],
    userChoices: ['accept', 'edit', 'skip']
  };
}

function minutesFromBudget(budget: AiPlanInput['dailyTimeBudget']) {
  if (budget === '5 min') return 5;
  if (budget === '30 min') return 10;
  return 5;
}

function adaptTiny(text: string, minutes: number) {
  return text.replace(/\d+\s*minutes?/i, `${minutes} minutes`);
}

function toneReason(reason: string, tone: AiPlanInput['preferredTone']) {
  if (tone === 'direct') return reason.replace(/^A /, 'This ');
  if (tone === 'practical' || tone === 'structured') return `${reason} It is small enough to repeat.`;
  return reason;
}

function mergeUnique(values: string[]) {
  return [...new Set(values.map(value => value.trim().toLowerCase()).filter(Boolean))];
}

function uniqueModules(modules: AiPlanSuggestion['recommendedModules']) {
  const seen = new Set<ModuleKey>();
  return modules.filter(module => {
    if (seen.has(module.moduleId)) return false;
    seen.add(module.moduleId);
    return true;
  });
}
