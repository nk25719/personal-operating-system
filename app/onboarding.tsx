import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { Chip } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { applyOnboarding, OnboardingTone } from '../services/onboarding';

const toneOptions: { id: OnboardingTone; label: string }[] = [
  { id: 'gentle', label: 'Gentle' },
  { id: 'direct', label: 'Direct' },
  { id: 'practical', label: 'Practical' },
  { id: 'reflective', label: 'Reflective' }
];

export default function OnboardingScreen() {
  const { data, updateData, loading } = useAppData();
  const [desiredPerson, setDesiredPerson] = useState('');
  const [currentSeason, setCurrentSeason] = useState('');
  const [valuesText, setValuesText] = useState('');
  const [tinyHabit, setTinyHabit] = useState('');
  const [tone, setTone] = useState<OnboardingTone>('gentle');

  if (loading || !data) return null;

  const finish = async () => {
    await updateData(
      current => applyOnboarding(current, {
        desiredPerson,
        currentSeason,
        values: valuesText.split(','),
        tinyHabit,
        tone
      }),
      { type: 'data.updated', payload: { reason: 'onboarding.completed' } }
    );
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>First setup</Text>
      <Text style={styles.title}>Start gently.</Text>
      <View style={styles.chipRow}>
        <Chip label="Identity" />
        <Chip label="Values" />
        <Chip label="Tiny habit" />
      </View>

      <Card>
        <Field
          label="Desired person"
          value={desiredPerson}
          onChangeText={setDesiredPerson}
          multiline
          placeholder="A healthier, steadier builder who keeps promises gently."
        />
        <Field
          label="Current season"
          value={currentSeason}
          onChangeText={setCurrentSeason}
          multiline
          placeholder="Busy work season, low energy evenings, protecting health."
        />
        <Field
          label="Three values, comma separated"
          value={valuesText}
          onChangeText={setValuesText}
          placeholder="Health, mastery, freedom"
        />
        <Field
          label="One tiny habit"
          value={tinyHabit}
          onChangeText={setTinyHabit}
          placeholder="Read one paragraph after dinner"
        />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Recommendation tone</Text>
        <View style={styles.toneGrid}>
          {toneOptions.map(option => (
            <Button
              key={option.id}
              title={option.label}
              variant={tone === option.id ? 'primary' : 'secondary'}
              onPress={() => setTone(option.id)}
            />
          ))}
        </View>
      </Card>

      <Button title="Begin" onPress={finish} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f3ec' },
  content: { padding: 18, paddingTop: 72, paddingBottom: 48 },
  eyebrow: { color: '#5f7f71', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 },
  title: { fontSize: 32, fontWeight: '900', color: '#24322f', lineHeight: 36, marginTop: 8 },
  subtitle: { color: '#68766f', lineHeight: 22, marginTop: 8, marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: '900', marginBottom: 12, color: '#24322f' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 16 },
  toneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }
});
