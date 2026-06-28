import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { applyGeneratedPlan, buildLocalPlan, generatePlan } from '../services/planner';
import { Character } from '../types';

export default function BuilderScreen() {
  const { data, setData, loading } = useAppData();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<ReturnType<typeof buildLocalPlan> | null>(null);

  if (loading || !data) return null;
  const active = data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
  const updateCharacter = (patch: Partial<Character>) => setData({ ...data, characters: data.characters.map(c => c.id === active.id ? { ...c, ...patch } : c) });

  const createPreview = async () => {
    setBusy(true);
    try {
      const plan = await generatePlan(data);
      setPreview(plan);
    } catch (e) {
      setPreview(buildLocalPlan(data));
      Alert.alert('Using local planner', String(e));
    }
    setBusy(false);
  };

  const applyPlan = async () => {
    if (!preview) return;
    await setData(applyGeneratedPlan(data, preview));
    Alert.alert('Plan updated', 'The generated schedule, habits, projects, and icon research were added.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Identity Builder</Text>
      <Text style={styles.subtitle}>Describe who you want to become and what your real life already requires. POS will suggest a rhythm, habits, projects, and role-model research prompts.</Text>

      <Card>
        <Text style={styles.cardTitle}>1. Desired Person</Text>
        <Field label="Who do you want to become?" value={active.desiredPerson ?? ''} onChangeText={v => updateCharacter({ desiredPerson: v })} multiline placeholder="Example: A strong biomedical engineer who publishes research, builds useful medical devices, speaks German, stays healthy, and lives independently." />
        <Field label="Daily obligations" value={active.dailyObligations ?? ''} onChangeText={v => updateCharacter({ dailyObligations: v })} multiline placeholder="Example: Work 8-5 Monday-Friday. Volunteer 7-10 PM. Weekend gym/pool. Weekly necessities check. Monthly shopping." />
        <Field label="Values, comma separated" value={active.values.join(', ')} onChangeText={v => updateCharacter({ values: v.split(',').map(x => x.trim()).filter(Boolean) })} />
        <Button title={busy ? 'Building...' : 'Create my tailored plan'} onPress={createPreview} />
      </Card>

      {preview ? (
        <>
          <Card>
            <Text style={styles.cardTitle}>2. Suggested Schedule</Text>
            {preview.routine.map(item => <Row key={item.id} left={item.time} right={item.title} />)}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>3. Suggested Habits</Text>
            {preview.habits.map(item => <Row key={item.id} left={item.name} right={`${item.minimum} — ${item.why}`} />)}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>4. Suggested Projects</Text>
            {preview.projects.map(item => <Row key={item.id} left={item.name} right={item.nextAction} />)}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>5. Icon Research</Text>
            <Text style={styles.note}>These are role-model research prompts. For true deep web search, connect a backend or web research endpoint later.</Text>
            {preview.icons.map(item => (
              <View key={item.id} style={styles.iconBlock}>
                <Text style={styles.iconName}>{item.name} · {item.domain}</Text>
                <Text style={styles.iconText}>{item.whyRelevant}</Text>
                <Text style={styles.iconText}>Model: {item.habitsToModel.join(', ')}</Text>
                <Text style={styles.query}>Search: {item.searchQueries.join(' | ')}</Text>
              </View>
            ))}
          </Card>
          <Button title="Use this plan" onPress={applyPlan} />
        </>
      ) : null}
    </ScrollView>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.left}>{left}</Text>
      <Text style={styles.right}>{right}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 18, paddingTop: 64, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { color: '#6b7280', marginTop: 6, marginBottom: 16, lineHeight: 20 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  row: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingVertical: 10 },
  left: { fontWeight: '800', color: '#111827' },
  right: { color: '#374151', marginTop: 3, lineHeight: 20 },
  note: { color: '#6b7280', lineHeight: 20, marginBottom: 10 },
  iconBlock: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingVertical: 10 },
  iconName: { fontWeight: '800', fontSize: 16 },
  iconText: { color: '#374151', marginTop: 4, lineHeight: 20 },
  query: { color: '#6b7280', marginTop: 6, fontStyle: 'italic' }
});
