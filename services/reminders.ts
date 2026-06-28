import * as Notifications from 'expo-notifications';
import { AppData } from '../types';

export async function scheduleHabitReminders(data: AppData) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return 'Notification permission not granted.';
  await Notifications.cancelAllScheduledNotificationsAsync();
  let count = 0;
  for (const habit of data.habits) {
    if (!habit.reminderTime) continue;
    const [hour, minute] = habit.reminderTime.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: { title: `POS: ${habit.name}`, body: habit.minimum },
      trigger: { hour, minute, repeats: true } as any
    });
    count += 1;
  }
  return `Scheduled ${count} daily habit reminders.`;
}
