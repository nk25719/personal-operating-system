import { Pressable, StyleSheet, Text, View } from 'react-native';

export function ChecklistRow({ time, title, done, onPress }: { time?: string; title: string; done: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.check}>{done ? '✅' : '☐'}</Text>
      {time ? <Text style={styles.time}>{time}</Text> : null}
      <Text style={[styles.title, done && styles.done]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, gap: 10 },
  check: { fontSize: 20 },
  time: { width: 88, color: '#666', fontWeight: '600' },
  title: { flex: 1, fontSize: 16, color: '#1c1c1e' },
  done: { textDecorationLine: 'line-through', color: '#8e8e93' }
});
