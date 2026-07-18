import { StyleSheet, Text, View } from 'react-native';
import { Habit } from '../types';

type Props = {
  habit: Habit;
  daysPracticed?: number;
  hoursInvested?: number;
};

export function ProgressStoryCard({ habit, daysPracticed = 42, hoursInvested = 10.5 }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{habit.name}</Text>
      <Text style={styles.body}>{daysPracticed} days · {hoursInvested}h invested</Text>
      <Text style={styles.highlight}>Progress tied to purpose.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#eef5f1', borderRadius: 20, borderWidth: 1, borderColor: '#d8e6de', padding: 14, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '900', color: '#24322f', marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 22, color: '#3f4a45' },
  highlight: { marginTop: 6, fontSize: 15, lineHeight: 22, color: '#36594d', fontWeight: '800' },
  muted: { marginTop: 8, fontSize: 13, lineHeight: 18, color: '#68766f' }
});
