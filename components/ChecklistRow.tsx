import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { time?: string; title: string; done: boolean; onPress: () => void };

export function ChecklistRow({ time, title, done, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, done && styles.doneRow, pressed && styles.pressed]}>
      <View style={[styles.check, done && styles.checkDone]}>
        <Text style={styles.checkText}>{done ? '✓' : ''}</Text>
      </View>
      <View style={styles.copy}>
        {time ? <Text style={styles.time}>{time}</Text> : null}
        <Text style={[styles.title, done && styles.doneText]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3e8d6'
  },
  doneRow: { opacity: 0.66 },
  pressed: { opacity: 0.7 },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#c4b5fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff'
  },
  checkDone: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  checkText: { color: '#fff', fontWeight: '900' },
  copy: { flex: 1 },
  time: { color: '#9a3412', fontSize: 12, fontWeight: '800', marginBottom: 2 },
  title: { color: '#2f2546', fontSize: 16, fontWeight: '700' },
  doneText: { textDecorationLine: 'line-through', color: '#78716c' }
});
