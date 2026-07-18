import { MutationEvent } from '../types';

export function calculateHabitStreak(events: MutationEvent[], habitId: string, today = new Date()) {
  const completedDays = new Set(
    events
      .filter(event => event.type === 'habit.completed' && event.payload?.itemId === habitId)
      .map(event => event.createdAt.slice(0, 10))
  );
  let streak = 0;
  let cursor = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  while (completedDays.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= 24 * 60 * 60 * 1000;
  }

  return streak;
}

export function formatStreak(streak: number) {
  return streak > 0 ? `${streak}-day streak` : 'Start today';
}

export function formatConsecutiveCompletion(streak: number) {
  return streak > 0 ? `Completed ${streak} days in a row` : 'Start today';
}
