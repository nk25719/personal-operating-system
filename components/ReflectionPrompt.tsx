import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

export function ReflectionPrompt({ prompt, onRespond }: { prompt: string; onRespond?: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Small reflection</Text>
      <Text style={styles.prompt}>{prompt}</Text>
      <Text style={styles.body}>Take one minute. A short answer is enough.</Text>
      <Button title="Respond briefly" variant="quiet" onPress={() => onRespond?.()} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fffdf8', borderRadius: 24, borderWidth: 1, borderColor: '#dde7df', padding: 18, marginBottom: 14 },
  eyebrow: { color: '#9a6b4f', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11, marginBottom: 4 },
  prompt: { fontSize: 18, fontWeight: '900', color: '#24322f', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20, color: '#68766f', marginBottom: 12 }
});
