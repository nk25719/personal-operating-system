import { Habit, Recommendation, RoutineItem } from '../types';
import { isRelationshipCue } from './relationshipCue';

export function isRecommendationForHabit(recommendation: Recommendation | undefined, habit: Habit | undefined) {
  if (!recommendation || !habit) return false;
  const habitName = habit.name.trim().toLowerCase();
  if (!habitName) return false;
  const text = [
    recommendation.title,
    recommendation.summary,
    recommendation.whyToday,
    recommendation.tinyAction,
    recommendation.linkedGoal,
    recommendation.linkedProject,
    ...recommendation.evidence
  ].join(' ').toLowerCase();
  return text.includes(habitName) || text.includes(habit.minimum.trim().toLowerCase());
}

export function getSmallStep(recommendation: Recommendation | undefined, habit: Habit | undefined) {
  if (habit?.name.toLowerCase().includes('movement')) return 'Do 1 small movement or stretch.';
  if (!recommendation) return habit?.minimum ? `Do ${habit.minimum}.` : 'Do one small step.';
  if (recommendation.type === 'habit_recovery') {
    return recommendation.tinyAction
      .replace(/^Do the minimum version of /, 'Do 1 small step for ')
      .replace(/ once\.$/, '.');
  }
  return recommendation.tinyAction.endsWith('.') ? recommendation.tinyAction : `${recommendation.tinyAction}.`;
}

export function getNextHourItems(routine: RoutineItem[], now = new Date()) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return routine
    .map(item => ({ item, minutes: startMinutes(item.time) }))
    .filter(({ minutes }) => minutes !== null && minutes >= nowMinutes && minutes <= nowMinutes + 60)
    .sort((a, b) => Number(a.minutes) - Number(b.minutes))
    .map(({ item }) => item);
}

export function getNextSmallActionItem(routine: RoutineItem[], done: Record<string, boolean>) {
  return routine.find(item => !done[item.id] && item.category !== 'Rest');
}

export function getTodayVisibleRecommendation(recommendations: Recommendation[], habit: Habit | undefined) {
  return recommendations.find(recommendation => !isRelationshipCue(recommendation) && !isRecommendationForHabit(recommendation, habit));
}

function startMinutes(time: string): number | null {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}
