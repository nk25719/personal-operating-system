import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

export function KnowledgeResurfacingCard({ title, summary, onCapture }: { title: string; summary: string; onCapture?: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Memory</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{summary}</Text>
      <Button title="Save" variant="secondary" onPress={() => onCapture?.()} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#eef5f1', borderRadius: 24, borderWidth: 1, borderColor: '#d8e6de', padding: 18, marginBottom: 14 },
  eyebrow: { color: '#5f7f71', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '900', color: '#24322f', marginBottom: 6, lineHeight: 22 },
  body: { fontSize: 14, lineHeight: 20, color: '#3f4a45', marginBottom: 12 }
});
