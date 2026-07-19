import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { HeaderActions } from '../components/HeaderActions';
import { Details } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { defaultMotivationCheckIn, getMockRecommendations, motivationStorageKey, openTasks, preferredName } from '../services/os';
import { isRelationshipCue } from '../services/relationshipCue';
import { MotivationCheckIn, PlannerMemoryRecord, Recommendation } from '../types';
import { getJSON, getPlannerMemory, getUserScopedStorageKey } from '../utils/storage';
import { theme } from '../constants/theme';
import { AppIcon } from '../components/AppIcon';

export default function HomeScreen() {
  const { data, loading } = useAppData();
  const [motivation, setMotivation] = useState<MotivationCheckIn>(defaultMotivationCheckIn());
  const [plannerMemory, setPlannerMemory] = useState<PlannerMemoryRecord[]>([]);

  useEffect(() => {
    const key = getUserScopedStorageKey(motivationStorageKey());
    if (key) {
      getJSON(key, defaultMotivationCheckIn()).then(setMotivation);
    } else {
      setMotivation(defaultMotivationCheckIn());
    }
  }, []);
  useEffect(() => { getPlannerMemory().then(setPlannerMemory); }, []);

  const recommendations = useMemo(() => (
    data ? getMockRecommendations(data, motivation, plannerMemory).filter(item => !isRelationshipCue(item)) : []
  ), [data, motivation, plannerMemory]);

  if (loading || !data) return null;

  const task = openTasks(data)[0];
  const adjustment = recommendations[0];
  const reminder = getUpcomingReminder(data.routine);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Home</Text>
          <Text style={styles.title}>Hello {preferredName(data)}</Text>
        </View>
        <HeaderActions />
      </View>
      <Card variant="highlight">
        <View style={styles.row}>
          <View style={styles.icon}><AppIcon name="today" size={20} fallbackLabel="!" /></View>
          <View style={styles.copy}>
            <Text style={styles.cardLabel}>Needs attention now</Text>
            <Text style={styles.cardTitle}>{task?.title ?? 'No urgent task.'}</Text>
            <Text style={styles.muted}>{task ? `${task.priority} · ${task.estimatedMinutes ?? 10} min` : 'Keep the day light.'}</Text>
          </View>
        </View>
        <Link href="/today" asChild><Button title="Open Today" /></Link>
      </Card>

      <Card>
        <View style={styles.row}>
          <View style={styles.icon}><AppIcon name="add" size={20} fallbackLabel="+" /></View>
          <View style={styles.copy}>
            <Text style={styles.cardLabel}>Suggested adjustment</Text>
            <Text style={styles.cardTitle}>{adjustment?.title ?? 'Nothing to adjust.'}</Text>
            <Text style={styles.body}>{adjustment?.tinyAction ?? 'Stay with the next small step.'}</Text>
          </View>
        </View>
        {adjustment ? (
          <Details title="Details">
            <Text style={styles.body}>{getShortWhy(adjustment)}</Text>
          </Details>
        ) : null}
      </Card>

      <Card>
        <View style={styles.row}>
          <View style={styles.icon}><AppIcon name="lifeClock" size={20} fallbackLabel="•" /></View>
          <View style={styles.copy}>
            <Text style={styles.cardLabel}>Upcoming</Text>
            <Text style={styles.cardTitle}>{reminder.title}</Text>
            <Text style={styles.muted}>{reminder.time}</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

function getUpcomingReminder(routine: { time: string; title: string }[]) {
  return routine.find(item => /work|volunteer|leave/i.test(item.title)) ?? { title: 'No conflict found.', time: 'Keep moving gently.' };
}

function getShortWhy(recommendation: Recommendation) {
  return recommendation.whyToday || recommendation.summary;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center', padding: theme.spacing.screen, paddingTop: 48, paddingBottom: 64 },
  topRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  titleBlock: { flex: 1, minWidth: 0 },
  eyebrow: { color: theme.colors.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 11 },
  title: { fontSize: 30, fontWeight: '900', color: theme.colors.text, marginTop: 6, lineHeight: 34, flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  cardLabel: { color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12, marginBottom: 5 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.text, lineHeight: 25, flexShrink: 1 },
  body: { fontSize: 15, color: theme.colors.text, lineHeight: 21, marginTop: 4 },
  muted: { color: theme.colors.textMuted, lineHeight: 20, marginTop: 4 }
});
