import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { LifeProfile } from '../types';

const MS_HOUR = 1000 * 60 * 60;
const MS_DAY = MS_HOUR * 24;

type DurationParts = { years: number; months: number; days: number; hours: number };

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

function calendarDiff(start: Date, end: Date): DurationParts {
  if (end <= start) return { years: 0, months: 0, days: 0, hours: 0 };
  let cursor = new Date(start);
  let years = 0;
  while (addMonths(cursor, 12) <= end) {
    cursor = addMonths(cursor, 12);
    years += 1;
  }
  let months = 0;
  while (addMonths(cursor, 1) <= end) {
    cursor = addMonths(cursor, 1);
    months += 1;
  }
  const remainingMs = end.getTime() - cursor.getTime();
  const days = Math.floor(remainingMs / MS_DAY);
  const hours = Math.floor((remainingMs % MS_DAY) / MS_HOUR);
  return { years, months, days, hours };
}

function formatDuration(start: Date, end: Date, mode: LifeProfile['displayMode']) {
  const ms = Math.max(0, end.getTime() - start.getTime());
  const totalHours = Math.floor(ms / MS_HOUR);
  const totalDays = Math.floor(ms / MS_DAY);
  if (mode === 'hours') return `${totalHours.toLocaleString()} hours`;
  if (mode === 'daysHours') return `${totalDays.toLocaleString()} days ${Math.floor((ms % MS_DAY) / MS_HOUR)} hours`;
  const parts = calendarDiff(start, end);
  if (mode === 'monthsDaysHours') return `${(parts.years * 12 + parts.months).toLocaleString()} months ${parts.days} days ${parts.hours} hours`;
  return `${parts.years.toLocaleString()} years ${parts.months} months ${parts.days} days ${parts.hours} hours`;
}

function percent(start: Date, now: Date, end?: Date | null) {
  if (!end || end <= start) return null;
  const total = end.getTime() - start.getTime();
  const used = Math.min(Math.max(now.getTime() - start.getTime(), 0), total);
  return Math.round((used / total) * 1000) / 10;
}

export default function LifeClockScreen() {
  const { data, setData, loading } = useAppData();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const calc = useMemo(() => {
    if (!data) return null;
    const birth = parseDate(data.lifeProfile.birthDate);
    const end = parseDate(data.lifeProfile.expectedEndDate);
    if (!birth) return { birth: null, end, alive: 'Add a valid birth date first.', left: '', pct: null as number | null };
    return {
      birth,
      end,
      alive: formatDuration(birth, now, data.lifeProfile.displayMode),
      left: end ? formatDuration(now, end, data.lifeProfile.displayMode) : 'Add an optional expected end date to show time left.',
      pct: percent(birth, now, end)
    };
  }, [data, now]);

  if (loading || !data || !calc) return null;

  const update = (patch: Partial<LifeProfile>) => setData({ ...data, lifeProfile: { ...data.lifeProfile, ...patch } });
  const modeButtons: { label: string; mode: LifeProfile['displayMode'] }[] = [
    { label: 'Hours', mode: 'hours' },
    { label: 'Days + hours', mode: 'daysHours' },
    { label: 'Months + days + hours', mode: 'monthsDaysHours' },
    { label: 'Years + months + days + hours', mode: 'yearsMonthsDaysHours' }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Life Clock</Text>
      <Text style={styles.subtitle}>A clear, editable reminder that time is a resource to invest intentionally.</Text>

      <Card>
        <Text style={styles.cardTitle}>Time Alive</Text>
        <Text style={styles.big}>{calc.alive}</Text>
        <Text style={styles.note}>{data.lifeProfile.reminderText}</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Time Left</Text>
        <Text style={styles.big}>{calc.left}</Text>
        {calc.pct !== null ? (
          <View style={styles.progressWrap}>
            <View style={[styles.progressFill, { width: `${calc.pct}%` }]} />
            <Text style={styles.progressText}>{calc.pct}% of selected life timeline lived</Text>
          </View>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Edit Demographic Dates</Text>
        <Field label="Birth date" value={data.lifeProfile.birthDate ?? ''} onChangeText={v => update({ birthDate: v })} placeholder="YYYY-MM-DD" />
        <Field label="Expected end date, optional" value={data.lifeProfile.expectedEndDate ?? ''} onChangeText={v => update({ expectedEndDate: v })} placeholder="YYYY-MM-DD" />
        <Field label="Reminder text" value={data.lifeProfile.reminderText} onChangeText={v => update({ reminderText: v })} multiline />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Display Mode</Text>
        {modeButtons.map(item => (
          <Button key={item.mode} title={`${data.lifeProfile.displayMode === item.mode ? '✓ ' : ''}${item.label}`} onPress={() => update({ displayMode: item.mode })} />
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 18, paddingTop: 64 },
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { color: '#6b7280', marginTop: 6, marginBottom: 16, lineHeight: 21 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  big: { fontSize: 30, fontWeight: '900', color: '#111827', lineHeight: 38 },
  note: { color: '#374151', marginTop: 12, fontSize: 16, lineHeight: 23 },
  progressWrap: { marginTop: 16, height: 34, borderRadius: 17, backgroundColor: '#e5e7eb', overflow: 'hidden', justifyContent: 'center' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#111827' },
  progressText: { textAlign: 'center', fontWeight: '800', color: '#111827' }
});
