import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Recommendation } from '../types';
import { Button } from './Button';
import { Chip, Details, ProgressBar } from './Visual';

type Props = {
  recommendation: Recommendation;
  onAction?: (id: Recommendation['actions'][number]['id']) => void;
  selectedAction?: string;
};

export function RecommendationCard({ recommendation, onAction, selectedAction }: Props) {
  const [expanded, setExpanded] = useState(false);
  const confidenceLabel = useMemo(() => {
    if (recommendation.confidence >= 80) return 'High';
    if (recommendation.confidence >= 60) return 'Moderate';
    return 'Low';
  }, [recommendation.confidence]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headingWrap}>
          <Text style={styles.eyebrow}>Suggested</Text>
          <Text style={styles.title}>{recommendation.title}</Text>
        </View>
        <Chip label={confidenceLabel} />
      </View>

      <Text style={styles.sectionTitle}>Tiny action</Text>
      <Text style={styles.tinyAction}>{recommendation.tinyAction}</Text>
      <Text style={styles.body}>{recommendation.whyToday}</Text>
      <ProgressBar value={recommendation.confidence} />

      <Details title="Learn more">
        <Text style={styles.sectionTitle}>Why</Text>
        <Text style={styles.body}>{recommendation.whyItMatters}</Text>
        <Text style={styles.sectionTitle}>Connected</Text>
        <Text style={styles.body}>{[recommendation.linkedIdentity, recommendation.linkedGoal, recommendation.linkedProject].filter(Boolean).join(' · ') || 'Your direction'}</Text>
        {expanded ? null : null}
        <Pressable accessibilityRole="button" onPress={() => setExpanded(v => !v)} style={styles.toggle}>
          <Text style={styles.toggleText}>{expanded ? 'Hide reasoning' : 'Show reasoning'}</Text>
        </Pressable>
        {expanded ? (
          <View style={styles.expanded}>
          <Text style={styles.sectionTitle}>Confidence</Text>
          <Text style={styles.body}>{recommendation.confidence}% confidence</Text>
          <Text style={styles.sectionTitle}>Evidence</Text>
          {recommendation.evidence.map(item => <Text key={item} style={styles.bullet}>• {item}</Text>)}
          <Text style={styles.sectionTitle}>Assumptions</Text>
          {recommendation.assumptions.map(item => <Text key={item} style={styles.bullet}>• {item}</Text>)}
          <Text style={styles.sectionTitle}>Known limits</Text>
          {recommendation.knowledgeLimits.map(item => <Text key={item} style={styles.bullet}>• {item}</Text>)}
          <Text style={styles.sectionTitle}>How to correct it</Text>
          <Text style={styles.body}>{recommendation.userOverride}</Text>
          </View>
        ) : null}
      </Details>

      <View style={styles.actions}>
        {recommendation.actions.map(action => (
          <Button
            key={action.id}
            title={action.label}
            variant={selectedAction === action.id ? 'primary' : 'secondary'}
            onPress={() => onAction?.(action.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffdf8',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#dde7df',
    padding: 18,
    marginBottom: 14
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  headingWrap: { flex: 1 },
  eyebrow: { color: '#9a6b4f', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '900', color: '#24322f', marginBottom: 6, lineHeight: 22 },
  sectionTitle: { marginTop: 12, fontSize: 13, fontWeight: '900', color: '#5f7f71', textTransform: 'uppercase', letterSpacing: 0.7 },
  body: { marginTop: 4, fontSize: 15, lineHeight: 22, color: '#3f4a45' },
  tinyAction: { marginTop: 6, fontSize: 16, lineHeight: 22, color: '#24322f', fontWeight: '900' },
  bullet: { marginTop: 4, fontSize: 14, lineHeight: 20, color: '#4f5d56' },
  toggle: { marginTop: 12, alignSelf: 'flex-start' },
  toggleText: { color: '#5f7f71', fontWeight: '800' },
  expanded: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#dde7df' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }
});
