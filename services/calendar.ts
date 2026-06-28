import * as Calendar from 'expo-calendar';
import { AppData } from '../types';

function parseTime(time: string) {
  const match = time.match(/(\d{2}):(\d{2})/);
  if (!match) return null;
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
}

export async function createTodayCalendarEvents(data: AppData) {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return 'Calendar permission not granted.';

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  let calendar = calendars.find(c => c.title === data.integrations.calendarName);
  if (!calendar) {
    const defaultCalendar = calendars.find(c => c.allowsModifications) ?? calendars[0];
    const id = await Calendar.createCalendarAsync({
      title: data.integrations.calendarName,
      color: '#111827',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendar?.source?.id,
      source: defaultCalendar?.source,
      name: data.integrations.calendarName,
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER
    });
    calendar = { id } as Calendar.Calendar;
  }

  let created = 0;
  for (const item of data.routine) {
    const start = parseTime(item.time);
    if (!start) continue;
    const end = new Date(start.getTime() + 20 * 60 * 1000);
    await Calendar.createEventAsync(calendar.id, {
      title: item.title,
      startDate: start,
      endDate: end,
      notes: item.category
    });
    created += 1;
  }
  return `Created ${created} calendar events for today.`;
}
