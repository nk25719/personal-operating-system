import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { extractActionsFromCapture, suggestNextFromCapture } from '../services/os';

export default function CaptureScreen() {
  const { data, setData, loading } = useAppData();
  const [text, setText] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  if (loading || !data) return null;

  const save = async () => {
    if (!text.trim()) return;
    const entry = extractActionsFromCapture(text.trim());
    await setData({ ...data, captureInbox: [entry, ...(data.captureInbox ?? [])] });
    setLastMessage(`Captured. Suggested next action: ${suggestNextFromCapture(entry)}`);
    setText('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Capture</Text>
      <Text style={styles.subtitle}>One conversational input. The app extracts possible actions and suggests the right module. No form filling.</Text>
      {lastMessage ? <Card><Text style={styles.message}>{lastMessage}</Text></Card> : null}
      <Card>
        <Text style={styles.cardTitle}>What changed?</Text>
        <Field label="Speak or type a messy note" value={text} onChangeText={setText} multiline placeholder="Example: I need to finish DICOM, buy toiletries, avoid late outings this week, and prepare for Saturday gym." />
        <Button title="Capture and extract" onPress={save} />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Inbox</Text>
        {(data.captureInbox ?? []).slice(0, 8).map(entry => (
          <View key={entry.id} style={styles.entry}>
            <Text style={styles.body}>{entry.text}</Text>
            <Text style={styles.muted}>Suggested module: {entry.suggestedModule ?? 'today'}</Text>
            {entry.extractedActions.map(action => <Text key={action} style={styles.action}>• {action}</Text>)}
          </View>
        ))}
        {!(data.captureInbox ?? []).length ? <Text style={styles.muted}>No captures yet.</Text> : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 18, paddingTop: 64, paddingBottom: 40 },
  title: { fontSize: 34, fontWeight: '900', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 6, marginBottom: 16, lineHeight: 21 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  message: { fontSize: 16, lineHeight: 24 },
  body: { fontSize: 15, color: '#374151', lineHeight: 22 },
  muted: { color: '#6b7280', lineHeight: 20, marginTop: 4 },
  action: { color: '#111827', marginTop: 4, lineHeight: 20 },
  entry: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10, marginTop: 10 }
});
