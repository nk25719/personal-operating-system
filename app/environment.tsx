
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { Character, EnvironmentProfile } from '../types';

const defaultEnvironmentProfile = (): EnvironmentProfile => ({
  enabled: true,
  lifePurpose: '',
  futureSelfStatement: '',
  integrityDefinition: 'Integrity means my actions, spending, relationships, and commitments match my stated values even when no one is watching.',
  valuesToProtect: [],
  desiredEnvironments: '',
  environmentsToAvoid: '',
  desiredPeople: '',
  peopleToLimit: '',
  experiencesToSeek: '',
  experiencesToAvoid: '',
  weeklyEnvironmentReview: 'Did my social environment, spaces, and experiences make me more like my future self this week?',
  integrityScoreMode: 'gentle'
});

export default function EnvironmentScreen() {
  const { data, updateCharacter: mutateCharacter, loading } = useAppData();
  const [scores, setScores] = useState([0, 0, 0, 0, 0, 0]);

  const active = data?.characters.find(c => c.id === data.activeCharacterId) ?? data?.characters[0];
  const profile = active?.environmentProfile ?? defaultEnvironmentProfile();

  const total = useMemo(() => scores.reduce((a, b) => a + b, 0), [scores]);
  const integrityLabel = total >= 25 ? 'Strong alignment' : total >= 18 ? 'Mostly aligned' : total >= 10 ? 'Needs attention' : 'Misaligned today';
  const environmentRules = buildEnvironmentRules(profile);

  if (loading || !data || !active) return null;
  const updateCharacter = (patch: Partial<Character>) => mutateCharacter(active.id, patch);
  const updateProfile = (patch: Partial<EnvironmentProfile>) => updateCharacter({ environmentProfile: { ...profile, ...patch } });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Environment" />
      <Text style={styles.subtitle}>Design the social spaces, experiences, and integrity standards that shape the human into their future self.</Text>

      <Card>
        <Text style={styles.cardTitle}>Core Philosophy</Text>
        <Text style={styles.quote}>Which action right now contributes most to the person I am trying to become?</Text>
        <Button title={`${profile.enabled ? '✓ ' : ''}Use environment context in planning`} onPress={() => updateProfile({ enabled: !profile.enabled })} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Purpose & Future Self</Text>
        <Field label="Purpose in life" value={profile.lifePurpose} onChangeText={v => updateProfile({ lifePurpose: v })} multiline placeholder="Example: build useful medical technology, serve people, grow in skill and character, create freedom." />
        <Field label="Future self statement" value={profile.futureSelfStatement} onChangeText={v => updateProfile({ futureSelfStatement: v })} multiline placeholder="Who is this person becoming?" />
        <Field label="Integrity definition" value={profile.integrityDefinition} onChangeText={v => updateProfile({ integrityDefinition: v })} multiline />
        <Field label="Values to protect, comma separated" value={profile.valuesToProtect.join(', ')} onChangeText={v => updateProfile({ valuesToProtect: v.split(',').map(x => x.trim()).filter(Boolean) })} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Environment Design</Text>
        <Field label="Environments to seek" value={profile.desiredEnvironments} onChangeText={v => updateProfile({ desiredEnvironments: v })} multiline placeholder="Labs, libraries, gym, research groups, disciplined offices..." />
        <Field label="Environments to avoid or limit" value={profile.environmentsToAvoid} onChangeText={v => updateProfile({ environmentsToAvoid: v })} multiline placeholder="Places that increase distraction, spending, drama, sleep loss..." />
        <Field label="People to seek" value={profile.desiredPeople} onChangeText={v => updateProfile({ desiredPeople: v })} multiline placeholder="Mentors, builders, researchers, kind disciplined friends..." />
        <Field label="People to limit" value={profile.peopleToLimit} onChangeText={v => updateProfile({ peopleToLimit: v })} multiline placeholder="Patterns, not judgment: people who pull you away from your values..." />
        <Field label="Experiences to seek" value={profile.experiencesToSeek} onChangeText={v => updateProfile({ experiencesToSeek: v })} multiline />
        <Field label="Experiences to avoid" value={profile.experiencesToAvoid} onChangeText={v => updateProfile({ experiencesToAvoid: v })} multiline />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Integrity Score</Text>
        <Text style={styles.note}>This is not moral judgment. It is a private alignment signal: did today match the person I claim I want to become?</Text>
        {[
          'I protected my health and energy',
          'I spent money intentionally',
          'I kept promises to myself or repaired them quickly',
          'I chose people/environments that strengthen me',
          'I avoided avoidable distraction or chaos',
          'I acted according to my values even when inconvenient'
        ].map((label, index) => (
          <ScoreRow key={label} label={label} value={scores[index]} setValue={n => setScores(scores.map((s, i) => i === index ? n : s))} />
        ))}
        <Text style={styles.total}>Integrity alignment: {total}/30</Text>
        <Text style={styles.result}>{integrityLabel}</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Weekly Environment Review</Text>
        <Field label="Review question" value={profile.weeklyEnvironmentReview} onChangeText={v => updateProfile({ weeklyEnvironmentReview: v })} multiline />
        {environmentRules.map((rule, index) => (
          <View key={index} style={styles.rule}>
            <Text style={styles.ruleTitle}>{rule.title}</Text>
            <Text style={styles.ruleText}>{rule.text}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function ScoreRow({ label, value, setValue }: { label: string; value: number; setValue: (n: number) => void }) {
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <TextInput style={styles.scoreInput} keyboardType="number-pad" value={String(value)} onChangeText={v => setValue(Math.max(0, Math.min(5, Number(v) || 0)))} />
    </View>
  );
}

function buildEnvironmentRules(profile: EnvironmentProfile) {
  if (!profile.enabled) return [{ title: 'Environment context off', text: 'The planner will not use social environment or integrity rules until this module is enabled.' }];
  const rules = [
    { title: 'Character is ecological', text: 'Places, people, media, and repeated experiences all shape who you become. Choose them with care.' },
    { title: 'Purpose filter', text: 'New outings, purchases, commitments, and relationships should be evaluated by whether they support the stated purpose and values.' },
    { title: 'Integrity is measured gently', text: 'A low score means adjust the system, repair the promise, or reduce friction. It is not an invitation to shame.' }
  ];
  if (profile.desiredPeople.trim()) rules.push({ title: 'Seek strengthening people', text: `Prioritize exposure to: ${profile.desiredPeople}` });
  if (profile.peopleToLimit.trim()) rules.push({ title: 'Limit draining patterns', text: `Create boundaries around: ${profile.peopleToLimit}` });
  if (profile.desiredEnvironments.trim()) rules.push({ title: 'Choose growth environments', text: `Schedule time in: ${profile.desiredEnvironments}` });
  if (profile.environmentsToAvoid.trim()) rules.push({ title: 'Reduce misaligned environments', text: `Avoid or limit: ${profile.environmentsToAvoid}` });
  return rules;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f1ea' },
  content: { padding: 18, paddingTop: 64, paddingBottom: 40 },
  title: { fontSize: 24, lineHeight: 29, fontWeight: '800', color: '#24322f' },
  subtitle: { color: '#68766f', marginTop: 6, marginBottom: 16, lineHeight: 20 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  quote: { fontSize: 16, fontWeight: '700', lineHeight: 26, marginBottom: 12, color: '#24322f' },
  note: { color: '#68766f', lineHeight: 20, marginBottom: 10 },
  scoreRow: { marginVertical: 8 },
  scoreLabel: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  scoreInput: { backgroundColor: '#f4f1ea', borderRadius: 10, padding: 12, fontSize: 16 },
  total: { fontSize: 16, fontWeight: '800', marginTop: 16, color: '#24322f' },
  result: { fontSize: 16, marginTop: 8, color: '#3f4a45' },
  rule: { borderTopWidth: 1, borderTopColor: '#dde7df', paddingVertical: 10 },
  ruleTitle: { fontWeight: '800', color: '#24322f' },
  ruleText: { color: '#3f4a45', marginTop: 4, lineHeight: 20 }
});
