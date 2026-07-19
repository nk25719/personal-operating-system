import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { HeaderActions } from '../components/HeaderActions';
import { Chip, Details, ProgressBar, StatCard } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { activeCharacter, personalPrompt } from '../services/os';
import { MutationEvent, PlannerMemoryRecord, PlannerMemoryResult } from '../types';
import { getMutationEvents, getPlannerMemory, updatePlannerMemoryResult } from '../utils/storage';
import { Button } from '../components/Button';
import { theme } from '../constants/theme';

export default function GrowthScreen() {
  const { data } = useAppData();
  const [events, setEvents] = useState<MutationEvent[]>([]);
  const [plannerMemory, setPlannerMemory] = useState<PlannerMemoryRecord[]>([]);

  useEffect(() => {
    Promise.all([getMutationEvents(), getPlannerMemory()]).then(([nextEvents, nextMemory]) => {
      setEvents(nextEvents);
      setPlannerMemory(nextMemory);
    });
  }, []);

  const todayEvents = useMemo(() => events.filter(isToday), [events]);
  const weekEvents = useMemo(() => events.filter(isThisWeek), [events]);
  const weekMemory = useMemo(() => plannerMemory.filter(isMemoryThisWeek), [plannerMemory]);
  const summary = summarizeToday(todayEvents);
  const weekly = summarizeWeek(weekEvents, weekMemory);
  const todayStats = getTodayStats(todayEvents);
  const character = data ? activeCharacter(data) : null;
  const activeProjects = data?.projects.filter(project => project.status === 'Active') ?? [];

  const setResult = async (id: string, result: PlannerMemoryResult) => {
    setPlannerMemory(await updatePlannerMemoryResult(id, result));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Growth</Text>
          <Text style={styles.subtitle}>How am I becoming?</Text>
        </View>
        <HeaderActions />
      </View>

      {data ? (
        <Card variant="highlight">
          <Text style={styles.cardTitle}>Identity</Text>
          <Text style={styles.connectionText}>{character?.desiredPerson ?? character?.identity}</Text>
          <View style={styles.chips}>
            <Chip label={data.preferences.currentSeason || 'Current season'} />
            {data.preferences.weeklyFocus ? <Chip label={data.preferences.weeklyFocus} /> : null}
            {character?.values.slice(0, 3).map(value => <Chip key={value} label={value} />)}
          </View>
          <Details title="Today’s intention">
            <Text style={styles.body}>{personalPrompt(data)}</Text>
          </Details>
        </Card>
      ) : null}

      {!events.length && !plannerMemory.length ? (
        <Card>
          <Text style={styles.cardTitle}>Nothing to review yet.</Text>
          <Text style={styles.body}>Capture one thought or complete one tiny action.</Text>
        </Card>
      ) : null}

      <Card variant="highlight">
        <Text style={styles.cardTitle}>Today</Text>
        <View style={styles.metricRow}>
          <StatCard label="Captures" value={String(todayStats.captures)} />
          <StatCard label="Habits" value={String(todayStats.habits)} />
          <StatCard label="Agency" value={String(todayStats.agency)} />
        </View>
        <Text style={styles.insight}>{summary}</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Habits</Text>
        <View style={styles.metricRow}>
          <StatCard label="Total" value={String(data?.habits.length ?? 0)} />
          <StatCard label="Done today" value={String(todayStats.habits)} />
          <StatCard label="Weekly events" value={String(weekEvents.filter(event => event.type === 'habit.completed').length)} />
        </View>
        <Text style={styles.insight}>{weekly.habits}</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Projects</Text>
        <View style={styles.metricRow}>
          <StatCard label="Active" value={String(activeProjects.length)} />
          <StatCard label="Average" value={`${averageProgress(activeProjects)}%`} progress={averageProgress(activeProjects)} />
        </View>
        {activeProjects.slice(0, 3).map(project => (
          <View key={project.id} style={styles.row}>
            <Text style={styles.rowTitle}>{project.name}</Text>
            <Text style={styles.muted}>{project.nextAction}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>This week</Text>
        <View style={styles.metricRow}>
          <StatCard label="Events" value={String(weekEvents.length)} progress={Math.min(100, weekEvents.length * 10)} />
          <StatCard label="Accepted" value={String(weekly.accepted)} progress={weekly.responseRate} />
          <StatCard label="Snoozed" value={String(weekly.snoozed)} />
        </View>
        <Text style={styles.sectionTitle}>Themes</Text>
        <Text style={styles.body}>{weekly.themes}</Text>
        <ProgressBar value={weekly.responseRate} />
        <Text style={styles.insight}>{weekly.adjustment}</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Recommendation Memory</Text>
        {plannerMemory.length ? (
          <>
            <Text style={styles.insight}>{plannerMemory.length} responses saved locally.</Text>
            <Details title="Details">
              {plannerMemory.slice(0, 8).map(record => (
                <View key={record.id} style={styles.row}>
                  <Text style={styles.rowTitle}>{formatPlannerResponse(record.userResponse)}: {record.suggestedAction}</Text>
                  {record.resultLater ? (
                    <Text style={styles.result}>Result: {formatResult(record.resultLater)}</Text>
                  ) : (
                    <View style={styles.buttonRow}>
                      <Button title="Helped" variant="secondary" onPress={() => setResult(record.id, 'helped')} />
                      <Button title="Neutral" variant="secondary" onPress={() => setResult(record.id, 'neutral')} />
                      <Button title="Not helpful" variant="secondary" onPress={() => setResult(record.id, 'notHelpful')} />
                    </View>
                  )}
                </View>
              ))}
            </Details>
          </>
        ) : <Text style={styles.muted}>No responses yet.</Text>}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>History</Text>
        {events.length ? (
          <Details title={`${events.length} local events`}>
            {events.slice(0, 30).map(event => (
              <View key={event.id} style={styles.row}>
                <Text style={styles.rowTitle}>{formatEvent(event)}</Text>
                <Text style={styles.muted}>{new Date(event.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </Details>
        ) : <Text style={styles.muted}>No local events yet.</Text>}
      </Card>
    </ScrollView>
  );
}

function isToday(event: MutationEvent) {
  return event.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function isThisWeek(event: MutationEvent) {
  return new Date(event.createdAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
}

function isMemoryThisWeek(record: PlannerMemoryRecord) {
  return new Date(record.createdAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
}

function summarizeToday(events: MutationEvent[]) {
  const stats = getTodayStats(events);
  if (!events.length) return 'Nothing to interpret yet.';
  return `${stats.captures} captures, ${stats.habits} habits, ${stats.agency} agency checks.`;
}

function getTodayStats(events: MutationEvent[]) {
  const captures = count(events, 'capture.saved');
  const habits = count(events, 'habit.completed');
  const agency = count(events, 'agency.updated');
  return { captures, habits, agency };
}

function summarizeWeek(events: MutationEvent[], memory: PlannerMemoryRecord[]) {
  const themeCounts = new Map<string, number>();
  const habitCounts = new Map<string, number>();
  events.forEach(event => {
    if (event.type === 'capture.saved') add(themeCounts, String(event.payload?.suggestedModule ?? 'capture'));
    if (event.type === 'task.created') add(themeCounts, String(event.payload?.area ?? 'task'));
    if (event.type === 'habit.completed') add(habitCounts, String(event.payload?.itemId ?? 'habit'));
  });
  memory.forEach(record => add(themeCounts, record.recommendationType ?? 'recommendation'));
  const accepted = memory.filter(record => record.userResponse === 'accepted' || record.userResponse === 'modified').length;
  const dismissed = memory.filter(record => record.userResponse === 'dismissed').length;
  const snoozed = memory.filter(record => record.userResponse === 'snoozed').length;
  const totalResponses = accepted + dismissed + snoozed;
  const topThemes = topEntries(themeCounts, 3);
  const topHabit = topEntries(habitCounts, 1)[0] ?? 'none yet';
  const leastHabit = bottomEntries(habitCounts, 1)[0] ?? 'more habit history needed';
  return {
    themes: topThemes.length ? topThemes.join(', ') : 'No repeated themes yet.',
    habits: `Most: ${topHabit}. Least: ${leastHabit}.`,
    recommendations: `${accepted} accepted/modified, ${dismissed} dismissed, ${snoozed} snoozed.`,
    adjustment: getWeeklyAdjustment(accepted, dismissed, snoozed, topThemes[0]),
    accepted,
    dismissed,
    snoozed,
    responseRate: totalResponses ? Math.round((accepted / totalResponses) * 100) : 0
  };
}

function add(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function topEntries(map: Map<string, number>, limit: number) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([key, value]) => `${key} (${value})`);
}

function bottomEntries(map: Map<string, number>, limit: number) {
  return [...map.entries()].sort((a, b) => a[1] - b[1]).slice(0, limit).map(([key, value]) => `${key} (${value})`);
}

function getWeeklyAdjustment(accepted: number, dismissed: number, snoozed: number, topTheme?: string) {
  if (dismissed > accepted) return 'Reduce recommendation frequency and ask for more context before suggesting similar actions.';
  if (snoozed > accepted) return 'Move suggestions later in the day or make the tiny action smaller.';
  if (topTheme) return `Protect one small block next week for ${topTheme.replace(/\s\(\d+\)$/, '')}.`;
  return 'Keep the system quiet and capture one honest change each day.';
}

function count(events: MutationEvent[], type: MutationEvent['type']) {
  return events.filter(event => event.type === type).length;
}

function averageProgress(projects: { progress: number }[]) {
  if (!projects.length) return 0;
  return Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length);
}

function formatPlannerResponse(response: PlannerMemoryRecord['userResponse']) {
  if (response === 'accepted') return 'Accepted';
  if (response === 'modified') return 'Modified';
  if (response === 'snoozed') return 'Snoozed';
  return 'Dismissed';
}

function formatResult(result: PlannerMemoryResult) {
  if (result === 'helped') return 'helped';
  if (result === 'notHelpful') return 'not helpful';
  return 'neutral';
}

function formatEvent(event: MutationEvent) {
  if (event.type === 'capture.saved') return 'Captured a thought';
  if (event.type === 'habit.completed') return 'Completed a habit or routine item';
  if (event.type === 'task.created') return 'Created a task';
  if (event.type === 'agency.updated') return 'Updated agency check';
  if (event.type === 'recommendation.accepted') return 'Accepted a recommendation';
  if (event.type === 'recommendation.modified') return 'Modified a recommendation';
  if (event.type === 'recommendation.dismissed') return 'Dismissed a recommendation';
  if (event.type === 'recommendation.snoozed') return 'Snoozed a recommendation';
  if (event.type === 'connection.done') return 'Completed connection cue';
  if (event.type === 'connection.skipped') return 'Skipped connection cue';
  if (event.type === 'backup.imported') return 'Imported a backup';
  if (event.type === 'character.updated') return 'Updated profile';
  return 'Updated local data';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center', padding: theme.spacing.screen, paddingTop: 48, paddingBottom: 64 },
  topRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  titleBlock: { flex: 1, minWidth: 0 },
  title: { fontSize: 24, fontWeight: '900', color: theme.colors.text, flexShrink: 1 },
  subtitle: { color: theme.colors.textMuted, marginTop: 8, marginBottom: 16, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  cardTitle: { fontSize: 17, fontWeight: '900', marginBottom: 10, color: theme.colors.text },
  connectionTitle: { fontSize: 17, fontWeight: '900', color: theme.colors.text, marginBottom: 6 },
  connectionText: { color: theme.colors.text, fontWeight: '800', lineHeight: 20 },
  connectionAction: { color: theme.colors.textMuted, lineHeight: 20, marginTop: 4 },
  body: { fontSize: 15, lineHeight: 22, color: theme.colors.text },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  insight: { color: theme.colors.text, fontWeight: '800', lineHeight: 20, marginTop: 12 },
  row: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10, marginTop: 10 },
  rowTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.text, lineHeight: 21 },
  sectionTitle: { marginTop: 12, color: theme.colors.primary, fontWeight: '900', textTransform: 'uppercase', fontSize: 12 },
  muted: { color: theme.colors.textMuted, marginTop: 4, lineHeight: 20 },
  result: { color: theme.colors.primary, marginTop: 6, fontWeight: '800' },
  buttonRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }
});
