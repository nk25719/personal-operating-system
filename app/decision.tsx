import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { theme } from '../constants/theme';
import { useAppData } from '../hooks/useAppData';

function NumberField({ label, value, setValue }: { label: string; value: number; setValue: (n: number) => void }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} keyboardType="number-pad" value={String(value)} onChangeText={v => setValue(Math.max(0, Math.min(5, Number(v) || 0)))} /></View>;
}

export default function DecisionScreen() {
  const { data } = useAppData();
  const active = data?.characters.find(c => c.id === data.activeCharacterId) ?? data?.characters[0];
  const [title, setTitle] = useState('');
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);
  const total = useMemo(() => scores.reduce((a, b) => a + b, 0), [scores]);
  const result = total >= 20 ? 'Yes, aligned' : total >= 14 ? 'Maybe, adjust cost/time' : total >= 8 ? 'Delay' : 'No';
  const labels = [
    'Closer to who I am becoming?',
    'Supports health/career/research/freedom/relationships?',
    'Worth the money/time/energy now?',
    'Will I regret not doing it?',
    'Low regret after doing it?'
  ];
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Decision Center" />
      <Text style={styles.subtitle}>{active?.missionQuestion ?? 'Before purchases, outings, commitments, or new projects.'}</Text>
      <Card>
        <TextInput style={styles.titleInput} placeholder="Decision title" value={title} onChangeText={setTitle} />
        {labels.map((label, i) => <NumberField key={label} label={label} value={scores[i]} setValue={(n) => setScores(scores.map((s, idx) => idx === i ? n : s))} />)}
        <Text style={styles.total}>Score: {total}/25</Text>
        <Text style={styles.result}>{result}</Text>
      </Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 18, paddingTop: 64 },
  subtitle: { color: theme.colors.textMuted, marginTop: 6, marginBottom: 16 },
  titleInput: { fontSize: 18, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: 12, marginBottom: 12 },
  row: { marginVertical: 10 },
  label: { fontSize: 15, fontWeight: '700', marginBottom: 6, color: theme.colors.text },
  input: { backgroundColor: theme.colors.background, borderRadius: 10, padding: 12, fontSize: 18 },
  total: { fontSize: 22, fontWeight: '800', marginTop: 16, color: theme.colors.text },
  result: { fontSize: 18, marginTop: 8, color: theme.colors.text }
});
