import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { Details } from '../components/Visual';
import { theme } from '../constants/theme';
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
    try { setAnswer(await getAISuggestion(data, prompt)); } catch (e) { setAnswer(`AI is unavailable, so POS used the local rule instead.\n\n${String(e)}`); }
    setBusy(false);
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="AI Advisor" />
      <Text style={styles.subtitle}>One question. One next step.</Text>
      <Card>
        <Field label="Task / question" value={prompt} onChangeText={setPrompt} multiline />
        <Button title={busy ? 'Thinking...' : 'Get suggestion'} onPress={ask} />
        <Details title="Learn more">
          <Text style={styles.answer}>Without an API key, POS uses local rules.</Text>
        </Details>
      </Card>
      {answer ? <Card><Text style={styles.answer}>{answer}</Text></Card> : null}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 18, paddingTop: 64 },
  subtitle: { color: theme.colors.textMuted, marginTop: 6, marginBottom: 16 },
  answer: { color: theme.colors.text, fontSize: 16, lineHeight: 24 }
});
