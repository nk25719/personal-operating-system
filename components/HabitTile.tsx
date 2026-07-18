import { StyleSheet, Text, View } from 'react-native';
import { Habit } from '../types';

type Props = {
  habit: Habit;
  streak?: number;
  completedInRow?: number;
};

export function HabitTile({ habit, streak = 12, completedInRow = 5 }: Props) {
  return (
    <View style={styles.tile}>
      <Text style={styles.name}>{habit.name}</Text>
      <Text style={styles.body}>{habit.minimum}</Text>
      <View style={styles.progressRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{streak} days</Text>
          <Text style={styles.metricLabel}>current streak</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{completedInRow}x</Text>
          <Text style={styles.metricLabel}>completed in a row</Text>
        </View>
      </View>
      <Text style={styles.muted}>{habit.frequency} · {habit.why}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: '#f6f3ec', borderRadius: 18, borderWidth: 1, borderColor: '#eadfce', padding: 12, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '900', color: '#24322f', marginBottom: 4 },
  body: { fontSize: 14, lineHeight: 20, color: '#3f4a45' },
  progressRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 8 },
  metric: { flex: 1, backgroundColor: '#fffdf8', borderRadius: 14, borderWidth: 1, borderColor: '#dde7df', padding: 8 },
  metricValue: { fontSize: 15, fontWeight: '900', color: '#36594d' },
  metricLabel: { fontSize: 12, color: '#68766f', marginTop: 2 },
  muted: { marginTop: 4, fontSize: 13, lineHeight: 18, color: '#68766f' }
});
