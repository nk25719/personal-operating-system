import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MotivationCheckIn, MotivationNeed } from '../types';
import { ProgressBar } from './Visual';

type NeedOption = {
  key: MotivationNeed;
  title: string;
  question: string;
};

const needs: NeedOption[] = [
  { key: 'autonomy', title: 'Choice', question: 'I chose this direction.' },
  { key: 'competence', title: 'Progress', question: 'The next step feels doable.' },
  { key: 'relatedness', title: 'Support', question: 'I feel connected, not alone.' }
];

type Props = {
  value: MotivationCheckIn;
  onChange: (next: MotivationCheckIn) => void;
};

export function AgencyCheckCard({ value, onChange }: Props) {
  const average = Math.round(((value.autonomy + value.competence + value.relatedness) / 15) * 100);
  const lowest = needs.reduce((current, option) => value[option.key] < value[current.key] ? option : current, needs[0]);
  const guidance = getGuidance(lowest.key);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>Agency check</Text>
          <Text style={styles.title}>3 quiet signals</Text>
        </View>
        <View style={styles.score}>
          <Text style={styles.scoreText}>{average}%</Text>
        </View>
      </View>

      {needs.map(option => (
        <View key={option.key} style={styles.needRow}>
          <View style={styles.needHeader}>
            <Text style={styles.needTitle}>{option.title}</Text>
            <Text style={styles.needScore}>{value[option.key]}/5</Text>
          </View>
          <ProgressBar value={value[option.key] * 20} />
          <View style={styles.pills}>
            {[1, 2, 3, 4, 5].map(score => {
              const active = value[option.key] === score;
              return (
                <Pressable
                  key={score}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.title} ${score} of 5`}
                  onPress={() => onChange({ ...value, [option.key]: score })}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{score}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.guidance}>
        <Text style={styles.guidanceTitle}>{guidance.title}</Text>
        <Text style={styles.guidanceText}>{guidance.body}</Text>
      </View>
    </View>
  );
}

function getGuidance(need: MotivationNeed) {
  if (need === 'autonomy') {
    return { title: 'Restore choice', body: 'Choose the smaller version.' };
  }
  if (need === 'competence') {
    return { title: 'Lower friction', body: 'Make it shorter.' };
  }
  return { title: 'Add support', body: 'Ask for one check-in.' };
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fffdf8', borderRadius: 24, borderWidth: 1, borderColor: '#dde7df', padding: 18, marginBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  heading: { flex: 1 },
  eyebrow: { color: '#9a6b4f', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '900', color: '#24322f', lineHeight: 23 },
  score: { minWidth: 58, minHeight: 44, borderRadius: 22, backgroundColor: '#e7f0ea', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  scoreText: { color: '#36594d', fontWeight: '900' },
  needRow: { borderTopWidth: 1, borderTopColor: '#dde7df', paddingTop: 12, marginTop: 12 },
  needHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  needTitle: { fontSize: 15, fontWeight: '900', color: '#24322f' },
  needScore: { color: '#68766f', fontWeight: '800' },
  pills: { flexDirection: 'row', gap: 8, marginTop: 8 },
  pill: { flex: 1, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#d8e6de', backgroundColor: '#f6f3ec', alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: '#5f7f71', borderColor: '#5f7f71' },
  pillText: { color: '#36594d', fontWeight: '900' },
  pillTextActive: { color: '#ffffff' },
  guidance: { marginTop: 14, backgroundColor: '#f6f3ec', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#eadfce' },
  guidanceTitle: { color: '#9a6b4f', fontWeight: '900', marginBottom: 4 },
  guidanceText: { color: '#3f4a45', lineHeight: 20 }
});
