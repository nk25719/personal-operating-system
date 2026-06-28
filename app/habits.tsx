import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { Habit } from '../types';

const newHabit = (): Habit => ({ id: `habit-${Date.now()}`, name: 'New habit', frequency: 'Daily', minimum: '10 minutes', why: 'Supports the person I am becoming', reminderTime: '' });

export default function HabitsScreen() {
  const { data, setData, loading } = useAppData();
  if (loading || !data) return null;
  const update = (id: string, patch: Partial<Habit>) => setData({ ...data, habits: data.habits.map(h => h.id === id ? { ...h, ...patch } : h) });
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Editable Habits</Text>
      <Text style={styles.subtitle}>Each habit has a tiny version, so progress still counts on busy or tired days.</Text>
      <Button title="Add habit" onPress={() => setData({ ...data, habits: [...data.habits, newHabit()] })} />
      {data.habits.map(h => (
        <Card key={h.id}>
          <Field label="Habit" value={h.name} onChangeText={v => update(h.id, { name: v })} />
          <View style={styles.two}><View style={styles.flex}><Field label="Frequency" value={h.frequency} onChangeText={v => update(h.id, { frequency: v })} /></View><View style={styles.flex}><Field label="Reminder HH:MM" value={h.reminderTime ?? ''} onChangeText={v => update(h.id, { reminderTime: v })} /></View></View>
          <Field label="Minimum version" value={h.minimum} onChangeText={v => update(h.id, { minimum: v })} />
          <Field label="Why" value={h.why} onChangeText={v => update(h.id, { why: v })} multiline />
          <Button title="Delete" onPress={() => setData({ ...data, habits: data.habits.filter(x => x.id !== h.id) })} />
        </Card>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f2f2f7' }, content: { padding: 18, paddingTop: 64 }, title: { fontSize: 32, fontWeight: '800' }, subtitle: { color: '#6b7280', marginTop: 6, marginBottom: 16 }, two: { flexDirection: 'row', gap: 10 }, flex: { flex: 1 } });
