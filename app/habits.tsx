import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { Details, ProgressBar, StatCard } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { Habit } from '../types';

const newHabit = (): Habit => ({ id: `habit-${Date.now()}`, name: 'New habit', frequency: 'Daily', minimum: '10 minutes', why: 'Supports the person I am becoming', reminderTime: '', isVisibleToOthers: false, visibleTo: [] });

export default function HabitsScreen() {
  const { data, updateData, loading } = useAppData();
  if (loading || !data) return null;
  const update = (id: string, patch: Partial<Habit>) => updateData(current => ({ ...current, habits: current.habits.map(h => h.id === id ? { ...h, ...patch } : h) }));
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Habits" />
      <Text style={styles.subtitle}>{data.habits.length} active</Text>
      <Card variant="highlight">
        <View style={styles.metricRow}>
          <StatCard label="Habits" value={String(data.habits.length)} progress={Math.min(100, data.habits.length * 12)} />
          <StatCard label="Private" value={String(data.habits.filter(habit => !habit.isVisibleToOthers).length)} />
        </View>
        <Details title="Design rule">
          <Text style={styles.body}>Minimum first. Low-energy days still count.</Text>
        </Details>
      </Card>
      <Button title="Add habit" onPress={() => updateData(current => ({ ...current, habits: [...current.habits, newHabit()] }))} />
      {!data.habits.length ? (
        <Card>
          <Text style={styles.cardTitle}>Choose one tiny repeatable action.</Text>
          <Text style={styles.body}>Start with something that still counts on a low-energy day.</Text>
          <View style={styles.row}>
            <Button title="Add one habit" variant="secondary" onPress={() => updateData(current => ({ ...current, habits: [...current.habits, newHabit()] }))} />
          </View>
        </Card>
      ) : null}
      {data.habits.map(h => (
        <Card key={h.id}>
          <Field label="Habit" value={h.name} onChangeText={v => update(h.id, { name: v })} />
          <View style={styles.two}><View style={styles.flex}><Field label="Frequency" value={h.frequency} onChangeText={v => update(h.id, { frequency: v })} /></View><View style={styles.flex}><Field label="Reminder HH:MM" value={h.reminderTime ?? ''} onChangeText={v => update(h.id, { reminderTime: v })} /></View></View>
          <Field label="Minimum version" value={h.minimum} onChangeText={v => update(h.id, { minimum: v })} />
          <ProgressBar value={h.reminderTime ? 80 : 45} />
          <Details title="Why">
            <Field label="Why I choose it" value={h.why} onChangeText={v => update(h.id, { why: v })} multiline />
          </Details>
          <View style={styles.row}>
            <Button title={h.isVisibleToOthers ? 'Visible' : 'Private'} variant={h.isVisibleToOthers ? 'primary' : 'secondary'} onPress={() => update(h.id, { isVisibleToOthers: !h.isVisibleToOthers })} />
            <Button title="Delete" variant="secondary" onPress={() => updateData(current => ({ ...current, habits: current.habits.filter(x => x.id !== h.id) }))} />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f6f3ec' }, content: { padding: 18, paddingTop: 64, paddingBottom: 44 }, title: { fontSize: 32, fontWeight: '900', color: '#24322f' }, subtitle: { color: '#68766f', marginTop: 6, marginBottom: 16, lineHeight: 22 }, cardTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8, color: '#24322f' }, body: { color: '#3f4a45', lineHeight: 22 }, metricRow: { flexDirection: 'row', gap: 10 }, two: { flexDirection: 'row', gap: 10 }, flex: { flex: 1 }, row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 8 }, muted: { color: '#68766f', marginTop: 8, lineHeight: 20 } });
