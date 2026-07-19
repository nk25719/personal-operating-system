import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { Chip, Details, StatCard } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { extractActionsFromCapture, suggestNextFromCapture } from '../services/os';

export default function CaptureScreen() {
  const { data, updateData, loading } = useAppData();
  const [text, setText] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  if (loading || !data) return null;

  const save = async () => {
    if (!text.trim()) return;
    const entry = extractActionsFromCapture(text.trim());
    await updateData(
      current => ({ ...current, captureInbox: [entry, ...(current.captureInbox ?? [])] }),
      { type: 'capture.saved', payload: { captureId: entry.id, suggestedModule: entry.suggestedModule } }
    );
    setLastMessage(`Saved. A possible next step is: ${suggestNextFromCapture(entry)}`);
    setText('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Capture</Text>
      <View style={styles.chipRow}>
        <Chip label={`${(data.captureInbox ?? []).length} notes`} />
        <Chip label="Local" />
      </View>
      {lastMessage ? <Card><Text style={styles.message}>{lastMessage}</Text></Card> : null}
      <Card>
        <Text style={styles.cardTitle}>What changed?</Text>
        <Field label="Note" value={text} onChangeText={setText} multiline placeholder="I want to study DICOM, but tonight feels crowded. Minimum version: read one page after dinner." />
        <Button title="Save" onPress={save} />
        <Details title="Learn more">
          <Text style={styles.body}>POS looks for small actions and useful areas. Costly actions need confirmation.</Text>
        </Details>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Recent</Text>
        <View style={styles.metricRow}>
          <StatCard label="Saved" value={String((data.captureInbox ?? []).length)} />
          <StatCard label="With actions" value={String((data.captureInbox ?? []).filter(entry => entry.extractedActions.length).length)} />
        </View>
        {(data.captureInbox ?? []).slice(0, 8).map(entry => (
          <View key={entry.id} style={styles.entry}>
            <Text style={styles.body}>{entry.text}</Text>
            <Text style={styles.muted}>Useful area: {entry.suggestedModule ?? 'today'}</Text>
            {entry.extractedActions.map(action => <Text key={action} style={styles.action}>• {action}</Text>)}
          </View>
        ))}
        {!(data.captureInbox ?? []).length ? <Text style={styles.muted}>Save one honest sentence.</Text> : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f1ea' },
  content: { padding: 16, paddingTop: 56, paddingBottom: 64 },
  title: { fontSize: 24, lineHeight: 29, fontWeight: '800', color: '#24322f' },
  subtitle: { color: '#68766f', marginTop: 6, marginBottom: 16, lineHeight: 20, fontSize: 15 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 16 },
  metricRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  message: { fontSize: 16, lineHeight: 21 },
  body: { fontSize: 15, color: '#3f4a45', lineHeight: 22 },
  muted: { color: '#68766f', lineHeight: 20, marginTop: 4 },
  action: { color: '#24322f', marginTop: 4, lineHeight: 20 },
  entry: { borderTopWidth: 1, borderTopColor: '#dde7df', paddingTop: 10, marginTop: 10 }
});
