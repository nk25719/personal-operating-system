import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { getAISuggestion } from '../services/ai';

export default function AIScreen() {
  const { data, loading } = useAppData();
  const [prompt, setPrompt] = useState('I have 30 minutes. What action moves me forward most?');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading || !data) return null;
  const ask = async () => {
    setBusy(true);
    try { setAnswer(await getAISuggestion(data, prompt)); } catch (e) { setAnswer(`AI failed, using local rule.\n\n${String(e)}`); }
    setBusy(false);
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Advisor</Text>
      <Text style={styles.subtitle}>Ask for next actions, subtopics, tips, or resources. Without an API key, it uses local rules.</Text>
      <Card>
        <Field label="Task / question" value={prompt} onChangeText={setPrompt} multiline />
        <Button title={busy ? 'Thinking...' : 'Get suggestion'} onPress={ask} />
      </Card>
      {answer ? <Card><Text style={styles.answer}>{answer}</Text></Card> : null}
    </ScrollView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f2f2f7' }, content: { padding: 18, paddingTop: 64 }, title: { fontSize: 32, fontWeight: '800' }, subtitle: { color: '#6b7280', marginTop: 6, marginBottom: 16 }, answer: { fontSize: 16, lineHeight: 24 } });
