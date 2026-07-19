import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { applyApprovedAiPlan, getAiPlannerProviderStatus, suggestIdentityPlan } from '../services/aiPlanner';
import { evaluateTodoAlignment } from '../services/actions';
import { AiPlanSuggestion, Character } from '../types';
import { theme } from '../constants/theme';

export default function BuilderScreen() {
  const { data, updateData, updateCharacter: mutateCharacter, loading } = useAppData();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<AiPlanSuggestion | null>(null);
  const [mode, setMode] = useState<'plan' | 'habits' | 'todos'>('plan');

  if (loading || !data) return null;
  const active = data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
  const updateCharacter = (patch: Partial<Character>) => mutateCharacter(active.id, patch);

  const createPreview = async () => {
    setBusy(true);
    try {
      const plan = await suggestIdentityPlan(data, active.desiredPerson ?? active.identity);
      setPreview(plan);
    } catch (e) {
      Alert.alert('Using local planner', String(e));
    }
    setBusy(false);
  };

  const applyPlan = async () => {
    if (!preview) return;
    await updateData(
      current => applyApprovedAiPlan(current, preview),
      { type: 'data.updated', payload: { reason: 'ai_plan.accepted', habits: preview.habits.length } }
    );
    Alert.alert('Plan updated', 'Your approved habits, routine items, actions, and modules were added.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Builder" />
      <Text style={styles.subtitle}>Build from who you are becoming. You approve every change.</Text>

      <Card>
        <Text style={styles.cardTitle}>Desired person</Text>
        <Field label="Who do you want to become?" value={active.desiredPerson ?? ''} onChangeText={v => updateCharacter({ desiredPerson: v })} multiline placeholder="Example: A strong biomedical engineer who publishes research, builds useful medical devices, speaks German, stays healthy, and lives independently." />
        <Field label="Daily obligations" value={active.dailyObligations ?? ''} onChangeText={v => updateCharacter({ dailyObligations: v })} multiline placeholder="Example: Work 8-5 Monday-Friday. Volunteer 7-10 PM. Weekend gym/pool. Weekly necessities check. Monthly shopping." />
        <Field label="Values, comma separated" value={active.values.join(', ')} onChangeText={v => updateCharacter({ values: v.split(',').map(x => x.trim()).filter(Boolean) })} />
        <View style={styles.row}>
          <Button title="Build my plan" variant={mode === 'plan' ? 'primary' : 'secondary'} onPress={() => { setMode('plan'); createPreview(); }} />
          <Button title="Improve my habits" variant={mode === 'habits' ? 'primary' : 'secondary'} onPress={() => { setMode('habits'); createPreview(); }} />
          <Button title="Check to-dos" variant={mode === 'todos' ? 'primary' : 'secondary'} onPress={() => setMode('todos')} />
        </View>
        <Text style={styles.note}>{busy ? 'Building...' : getAiPlannerProviderStatus()}</Text>
      </Card>

      {mode === 'todos' ? (
        <Card>
          <Text style={styles.cardTitle}>To-do alignment</Text>
          {data.tasks.length ? data.tasks.slice(0, 8).map(task => {
            const alignment = evaluateTodoAlignment(task, data);
            return <Row key={task.id} left={alignment.category === 'aligned' ? 'Aligned' : alignment.category === 'maintenance' ? 'Necessary' : 'Maybe later'} right={`${task.title} · ${alignment.reason}${alignment.suggestedRewrite ? ` Suggested: ${alignment.suggestedRewrite}` : ''}`} />;
          }) : <Text style={styles.note}>No to-dos yet.</Text>}
        </Card>
      ) : null}

      {preview && mode !== 'todos' ? (
        <>
          <Card>
            <Text style={styles.cardTitle}>Suggested focus</Text>
            <Text style={styles.note}>{preview.summary}</Text>
            <Row left="This week" right={preview.weeklyFocus} />
            <Row left="Values" right={preview.suggestedValues.join(', ') || 'Keep your current values'} />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>{mode === 'habits' ? 'Habit improvements' : 'Suggested habits'}</Text>
            {preview.habits.map(item => <Row key={item.title} left={`${item.title} · ${item.timesPerWeek}x/week`} right={`${item.tinyVersion} · ${item.why}`} />)}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Next actions</Text>
            {preview.nextActions.map(item => <Row key={item.title} left={`${item.estimatedMinutes} min`} right={`${item.title} · ${item.reason}`} />)}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Modules</Text>
            {preview.recommendedModules.map(item => <Row key={item.moduleId} left={item.moduleId} right={item.reason} />)}
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center', padding: theme.spacing.screen, paddingTop: 48, paddingBottom: 64 },
  subtitle: { color: theme.colors.textMuted, marginTop: 8, marginBottom: 16, lineHeight: 21 },
  cardTitle: { fontSize: 20, fontWeight: '900', marginBottom: 12, color: theme.colors.text },
  row: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingVertical: 10 },
  left: { fontWeight: '900', color: theme.colors.text },
  right: { color: theme.colors.textMuted, marginTop: 3, lineHeight: 20 },
  note: { color: theme.colors.textMuted, lineHeight: 20, marginBottom: 10 }
});
