import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { WomenHealthProfile } from '../types';

const MS_DAY = 1000 * 60 * 60 * 24;

type YMD = { years: number; months: number; days: number };

function parseDate(value?: string) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

function calendarDiff(start: Date, end: Date): YMD {
  if (end <= start) return { years: 0, months: 0, days: 0 };
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
  const days = Math.floor((end.getTime() - cursor.getTime()) / MS_DAY);
  return { years, months, days };
}

function formatDate(date?: Date | null) {
  if (!date) return 'Not set';
  return date.toISOString().slice(0, 10);
}

function formatRemaining(start: Date, end: Date, mode: WomenHealthProfile['displayMode']) {
  const ms = Math.max(0, end.getTime() - start.getTime());
  const totalDays = Math.floor(ms / MS_DAY);
  if (mode === 'days') return `${totalDays.toLocaleString()} days`;
  const parts = calendarDiff(start, end);
  if (mode === 'monthsDays') return `${(parts.years * 12 + parts.months).toLocaleString()} months ${parts.days} days`;
  return `${parts.years.toLocaleString()} years ${parts.months} months ${parts.days} days`;
}

function getCycleInfo(lastStart: Date | null, cycleDays: number, periodDays: number, now: Date) {
  if (!lastStart || cycleDays <= 0) return null;
  let nextStart = new Date(lastStart);
  while (nextStart <= now) nextStart = addDays(nextStart, cycleDays);
  const previousStart = addDays(nextStart, -cycleDays);
  const currentPeriodEnd = addDays(previousStart, periodDays);
  const cycleDay = Math.max(1, Math.floor((now.getTime() - previousStart.getTime()) / MS_DAY) + 1);
  const daysToNext = Math.max(0, Math.ceil((nextStart.getTime() - now.getTime()) / MS_DAY));
  const fertileStart = addDays(nextStart, -19);
  const fertileEnd = addDays(nextStart, -10);
  return {
    previousStart,
    nextStart,
    currentPeriodEnd,
    cycleDay,
    daysToNext,
    isPeriod: now >= previousStart && now < currentPeriodEnd,
    fertileStart,
    fertileEnd
  };
}

export default function WomenHealthScreen() {
  const { data, updateData, updateCharacter, loading } = useAppData();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const active = data?.characters.find(c => c.id === data.activeCharacterId) ?? data?.characters[0];
  const showModule = active?.demographics?.biologicalSex === 'female' && active?.demographics?.showWomenHealth;

  const calc = useMemo(() => {
    if (!data) return null;
    const birth = parseDate(data.lifeProfile.birthDate);
    const last = parseDate(data.womenHealth.lastPeriodStart);
    const cycle = getCycleInfo(last, Number(data.womenHealth.averageCycleDays), Number(data.womenHealth.averagePeriodDays), now);
    const referenceEnd = birth ? addYears(birth, Number(data.womenHealth.fertilityReferenceAge || 35)) : null;
    return { birth, cycle, referenceEnd };
  }, [data, now]);

  if (loading || !data || !calc || !active) return null;

  const update = (patch: Partial<WomenHealthProfile>) => updateData(current => ({ ...current, womenHealth: { ...current.womenHealth, ...patch } }));
  const updateCharacterDemographics = (patch: Partial<NonNullable<typeof active.demographics>>) => updateCharacter(active.id, { demographics: { ...active.demographics, ...patch } });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Women Health" />
      <Text style={styles.subtitle}>Optional cycle and family-planning awareness for humans who choose to display it.</Text>

      <Card>
        <Text style={styles.cardTitle}>Visibility</Text>
        <Text style={styles.note}>This tab appears when the active human is marked as female and women's health is enabled.</Text>
        <Button title={`${active.demographics?.biologicalSex === 'female' ? '✓ ' : ''}Mark active human as female`} onPress={() => updateCharacterDemographics({ biologicalSex: 'female', showWomenHealth: true })} />
        <Button title={`${active.demographics?.showWomenHealth ? '✓ ' : ''}Show women's health module`} onPress={() => updateCharacterDemographics({ showWomenHealth: !active.demographics?.showWomenHealth })} />
      </Card>

      {!showModule ? (
        <Card>
          <Text style={styles.cardTitle}>Module Hidden</Text>
          <Text style={styles.note}>Enable the female option and show women's health to display period and fertility planning fields.</Text>
        </Card>
      ) : (
        <>
          <Card>
            <Text style={styles.cardTitle}>Period Tracker</Text>
            <Field label="Last period start" value={data.womenHealth.lastPeriodStart ?? ''} onChangeText={v => update({ lastPeriodStart: v })} placeholder="YYYY-MM-DD" />
            <Field label="Average cycle length, days" value={String(data.womenHealth.averageCycleDays)} onChangeText={v => update({ averageCycleDays: Number(v.replace(/[^0-9]/g, '')) || 28 })} />
            <Field label="Average period length, days" value={String(data.womenHealth.averagePeriodDays)} onChangeText={v => update({ averagePeriodDays: Number(v.replace(/[^0-9]/g, '')) || 5 })} />
            {calc.cycle ? (
              <View style={styles.summaryBox}>
                <Text style={styles.big}>{calc.cycle.daysToNext} days to estimated next period</Text>
                <Text style={styles.line}>Current cycle day: {calc.cycle.cycleDay}</Text>
                <Text style={styles.line}>Estimated next start: {formatDate(calc.cycle.nextStart)}</Text>
                <Text style={styles.line}>Estimated fertile window: {formatDate(calc.cycle.fertileStart)} to {formatDate(calc.cycle.fertileEnd)}</Text>
                <Text style={styles.line}>Status: {calc.cycle.isPeriod ? 'Likely period days' : 'Outside estimated period days'}</Text>
              </View>
            ) : <Text style={styles.note}>Add last period start date to estimate the next cycle.</Text>}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Optional Child Planning Clock</Text>
            <Text style={styles.note}>This is an editable planning reminder, not a medical prediction. Choose the planning horizon that feels personally relevant.</Text>
            <Button title={`${data.womenHealth.fertilityPlanningEnabled ? '✓ ' : ''}Enable child-planning clock`} onPress={() => update({ fertilityPlanningEnabled: !data.womenHealth.fertilityPlanningEnabled })} />
            <Field label="Pregnancy intention" value={data.womenHealth.pregnancyIntent ?? ''} onChangeText={v => update({ pregnancyIntent: v as WomenHealthProfile['pregnancyIntent'] })} placeholder="notNow / maybeLater / trying / preferNotToSay" />
            <Field label="Reference age for planning" value={String(data.womenHealth.fertilityReferenceAge)} onChangeText={v => update({ fertilityReferenceAge: Number(v.replace(/[^0-9]/g, '')) || 35 })} />
            <Field label="Reminder text" value={data.womenHealth.fertilityReminderText} onChangeText={v => update({ fertilityReminderText: v })} multiline />
            {data.womenHealth.fertilityPlanningEnabled && calc.referenceEnd ? (
              <View style={styles.summaryBox}>
                <Text style={styles.big}>{formatRemaining(now, calc.referenceEnd, data.womenHealth.displayMode)}</Text>
                <Text style={styles.line}>Until selected planning reference age: {data.womenHealth.fertilityReferenceAge}</Text>
                <Text style={styles.line}>Reference date: {formatDate(calc.referenceEnd)}</Text>
                <Text style={styles.note}>{data.womenHealth.fertilityReminderText}</Text>
              </View>
            ) : null}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Display Mode</Text>
            <Button title={`${data.womenHealth.displayMode === 'days' ? '✓ ' : ''}Days`} onPress={() => update({ displayMode: 'days' })} />
            <Button title={`${data.womenHealth.displayMode === 'monthsDays' ? '✓ ' : ''}Months + days`} onPress={() => update({ displayMode: 'monthsDays' })} />
            <Button title={`${data.womenHealth.displayMode === 'yearsMonthsDays' ? '✓ ' : ''}Years + months + days`} onPress={() => update({ displayMode: 'yearsMonthsDays' })} />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Notes</Text>
            <Field label="Personal notes" value={data.womenHealth.notes ?? ''} onChangeText={v => update({ notes: v })} multiline />
            <Text style={styles.disclaimer}>Health and fertility information can vary greatly by person. Use this for reflection and planning only; for medical decisions, consult a qualified clinician.</Text>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f1ea' },
  content: { padding: 18, paddingTop: 64 },
  title: { fontSize: 32, fontWeight: '800', color: '#24322f' },
  subtitle: { color: '#68766f', marginTop: 6, marginBottom: 16, lineHeight: 21 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  note: { color: '#3f4a45', fontSize: 15, lineHeight: 22, marginBottom: 8 },
  big: { fontSize: 26, fontWeight: '900', color: '#24322f', lineHeight: 34, marginBottom: 8 },
  line: { fontSize: 16, color: '#24322f', marginTop: 5 },
  summaryBox: { backgroundColor: '#fffdf8', borderRadius: 14, padding: 14, marginTop: 10 },
  disclaimer: { color: '#68766f', fontSize: 13, lineHeight: 19, marginTop: 8 }
});
