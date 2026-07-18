import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

export function AccountabilityCard({ title, summary, onRespond }: { title: string; summary: string; onRespond?: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Relationship care</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{summary}</Text>
      <Button title="Send a small check-in" variant="quiet" onPress={() => onRespond?.()} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fffdf8', borderRadius: 24, borderWidth: 1, borderColor: '#dde7df', padding: 18, marginBottom: 14 },
  eyebrow: { color: '#9a6b4f', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '900', color: '#24322f', marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 22, color: '#3f4a45', marginBottom: 12 }
});
