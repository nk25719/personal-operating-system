import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ChecklistRow } from '../components/ChecklistRow';
import { HeaderActions } from '../components/HeaderActions';
import { useAppData } from '../hooks/useAppData';
import { appendMutationEvent, getJSON, getMutationEvents, getPlannerMemory, getUserScopedStorageKey, setJSON } from '../utils/storage';
import { defaultMotivationCheckIn, getMockRecommendations, motivationStorageKey, personalPrompt, preferredName, routineWithoutMaintenance, todayStorageKey } from '../services/os';
import { Chip, ProgressBar } from '../components/Visual';
import { MotivationCheckIn, MutationEvent, PlannerMemoryRecord, PlannerMemoryResponse, Recommendation, RecommendationAction } from '../types';
import { recordRecommendationResponse } from '../services/plannerMemory';
import { isRelationshipCue } from '../services/relationshipCue';
import { getNextSmallActionItem, getSmallStep, isRecommendationForHabit } from '../services/todayPresentation';
import { calculateHabitStreak, formatConsecutiveCompletion, formatStreak } from '../services/streaks';
import { theme } from '../constants/theme';

export default function TodayScreen() {
  const { data, loading } = useAppData();
  const insets = useSafeAreaInsets();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [recommendationState, setRecommendationState] = useState<Record<string, string>>({});
  const [plannerMemory, setPlannerMemory] = useState<PlannerMemoryRecord[]>([]);
  const [motivation, setMotivation] = useState<MotivationCheckIn>(defaultMotivationCheckIn());
  const [events, setEvents] = useState<MutationEvent[]>([]);
  const storageKey = getUserScopedStorageKey(todayStorageKey());
  const agencyKey = getUserScopedStorageKey(motivationStorageKey());

  useEffect(() => {
    if (storageKey) {
      getJSON(storageKey, {}).then(setDone);
    } else {
      setDone({});
    }
  }, [storageKey]);
  useEffect(() => {
    if (agencyKey) {
      getJSON(agencyKey, defaultMotivationCheckIn()).then(setMotivation);
    } else {
      setMotivation(defaultMotivationCheckIn());
    }
  }, [agencyKey]);
  useEffect(() => { getPlannerMemory().then(setPlannerMemory); }, []);
  useEffect(() => { getMutationEvents().then(setEvents); }, []);

  const recommendations = useMemo(() => (
    data ? getMockRecommendations(data, motivation, plannerMemory).filter(item => !isRelationshipCue(item)) : []
  ), [data, motivation, plannerMemory]);

  if (loading || !data) return null;

  const routine = routineWithoutMaintenance(data.routine);
  const completed = routine.filter(item => done[item.id]).length;
  const firstName = preferredName(data);
  const prompt = personalPrompt(data);
  const desiredPerson = data.characters.find(character => character.id === data.activeCharacterId)?.desiredPerson;
  const nextHabit = data.habits[0];
  const habitRecommendation = recommendations.find(item => isRecommendationForHabit(item, nextHabit));
  const selectedHabitRecommendationAction = habitRecommendation ? recommendationState[habitRecommendation.id] : undefined;
  const habitPercent = routine.length ? Math.round((completed / routine.length) * 100) : 0;
  const nextSmallAction = getNextSmallActionItem(routine, done);
  const habitSmallStep = nextHabit?.minimum || getSmallStep(habitRecommendation, nextHabit);
  const habitStreak = nextHabit ? calculateHabitStreak(events, nextHabit.id) : 0;
  const nextSmallActionStreak = nextSmallAction ? calculateHabitStreak(events, nextSmallAction.id) : 0;

  const toggle = async (id: string) => {
    const nextDone = { ...done, [id]: !done[id] };
    setDone(nextDone);
    if (!storageKey) return;
    await setJSON(storageKey, nextDone);
    if (nextDone[id]) {
      const event = await appendMutationEvent('habit.completed', { itemId: id, dateKey: storageKey });
      setEvents(current => [event, ...current]);
    }
  };

  const respondToHabitRecommendation = async () => {
    if (!habitRecommendation) return;
    await recordRecommendation(habitRecommendation, 'accept');
  };

  const recordRecommendation = async (target: Recommendation, action: RecommendationAction['id']) => {
    setRecommendationState(prev => ({ ...prev, [target.id]: action }));
    const response = toPlannerMemoryResponse(action);
    const memory = await recordRecommendationResponse({
      recommendation: target,
      userIntention: prompt,
      response
    });
    setPlannerMemory(prev => [memory, ...prev]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: 56 + insets.top }]}>
      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Today</Text>
            <Text style={styles.title}>Hello {firstName}</Text>
            {desiredPerson ? <Text style={styles.subtitle}>Ready to move one step closer to becoming {desiredPerson}?</Text> : null}
          </View>
          <View style={styles.heroActions}>
            <HeaderActions />
            <Link href="/capture" asChild><Button title="Capture" variant="secondary" /></Link>
          </View>
        </View>
      </View>

      <Card>
        <Text style={styles.cardLabel}>Next Small Action</Text>
        {nextSmallAction ? (
          <>
            <ChecklistRow
              key={nextSmallAction.id}
              time={nextSmallAction.time}
              title={nextSmallAction.title}
              detail={formatConsecutiveCompletion(nextSmallActionStreak)}
              done={!!done[nextSmallAction.id]}
              onPress={() => toggle(nextSmallAction.id)}
            />
            <View style={styles.nextHour}>
              <Text style={styles.stepLabel}>Next hour</Text>
              <Text style={styles.muted}>{nextSmallAction.time} {nextSmallAction.title}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.body}>Nothing scheduled next.</Text>
            <Text style={styles.muted}>{data.preferences.weeklyFocus ? `Use this time for ${data.preferences.weeklyFocus}.` : 'Use this time for your focus.'}</Text>
          </>
        )}
      </Card>

      {nextHabit ? (
        <Card>
          <Text style={styles.cardLabel}>Habit</Text>
          <View style={styles.habitTitleRow}>
            <Text style={styles.cardTitle}>{nextHabit.name}</Text>
            <Chip label={formatStreak(habitStreak)} />
          </View>
          <ProgressBar value={habitPercent} />
          <Text style={styles.muted}>{completed}/{routine.length} today</Text>
          <Text style={styles.stepLabel}>What to do</Text>
          <Text style={styles.body}>{habitSmallStep}</Text>
          <View style={styles.row}>
            <Button title={selectedHabitRecommendationAction === 'accept' ? 'Started' : 'Start here'} onPress={respondToHabitRecommendation} />
            <Button title="Done" variant={done[nextHabit.id] ? 'primary' : 'secondary'} onPress={() => toggle(nextHabit.id)} />
          </View>
        </Card>
      ) : null}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 24 },
  hero: { marginBottom: 16 },
  heroRow: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between' },
  heroActions: { alignItems: 'flex-end', gap: 8 },
  heroCopy: { flex: 1 },
  eyebrow: { color: theme.colors.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 11 },
  title: { fontSize: 32, fontWeight: '900', color: theme.colors.text, marginTop: 6, letterSpacing: -0.5, lineHeight: 36 },
  subtitle: { fontSize: 15, color: theme.colors.textMuted, marginTop: 10, lineHeight: 22 },
  cardLabel: { color: theme.colors.accent, fontWeight: '900', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12 },
  cardTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8, color: theme.colors.text, lineHeight: 24, flexShrink: 1 },
  habitTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  muted: { color: theme.colors.textMuted, lineHeight: 20 },
  body: { fontSize: 15, color: theme.colors.text, lineHeight: 22 },
  stepLabel: { color: theme.colors.accent, fontWeight: '900', marginTop: 14, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12 },
  nextHour: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.border },
  row: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap', alignContent: 'stretch' },
  feedback: { color: theme.colors.primary, fontWeight: '800', marginTop: -6, marginBottom: 12 }
});

function toPlannerMemoryResponse(action: RecommendationAction['id']): PlannerMemoryResponse {
  if (action === 'accept') return 'accepted';
  return 'dismissed';
}
