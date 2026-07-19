import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';

type MoodOption = {
  id: string;
  emoji: string;
  label: string;
  note: string;
};

type Props = {
  title: string;
  summary: string;
  options: MoodOption[];
  selectedValue?: string;
  onSelect?: (value: string) => void;
};

export function MoodPickerCard({ title, summary, options, selectedValue, onSelect }: Props) {
  return (
    <Card variant="soft">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.summary}>{summary}</Text>
      <View style={styles.row}>
        {options.map(option => {
          const active = selectedValue === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              onPress={() => onSelect?.(option.id)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {selectedValue ? (
        <Text style={styles.note}>{options.find(option => option.id === selectedValue)?.note}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '900', color: '#24322f', marginBottom: 6, lineHeight: 22 },
  summary: { fontSize: 13, lineHeight: 19, color: '#68766f', marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d8e6de',
    backgroundColor: '#fffdf8',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 80,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  optionActive: { borderColor: '#5f7f71', backgroundColor: '#e7f0ea' },
  emoji: { fontSize: 17, marginBottom: 4 },
  optionLabel: { fontSize: 13, fontWeight: '800', color: '#68766f' },
  optionLabelActive: { color: '#36594d' },
  note: { marginTop: 10, fontSize: 14, lineHeight: 20, color: '#7b5b3f', fontWeight: '700' }
});
