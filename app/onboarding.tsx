import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { Chip } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../hooks/useAuth';
import { applyOnboarding, DailyTimeBudget, EnergyPattern, LifeSeason, OnboardingTone, recommendModules, suggestHabits, validateOnboardingInput } from '../services/onboarding';
import { suggestIdentityPlan } from '../services/aiPlanner';
import { AiPlanSuggestion, ModuleKey } from '../types';
import { theme } from '../constants/theme';

const seasons: LifeSeason[] = ['rebuilding', 'growing', 'overwhelmed', 'steady', 'exploring'];
const values = ['health', 'learning', 'faith', 'family', 'creativity', 'career', 'peace', 'independence', 'relationships'];
const focuses = ['feel healthier', 'organize life', 'learn consistently', 'finish a project', 'reduce stress', 'build routine'];
const areas = ['health', 'learning', 'work', 'relationships', 'home', 'creativity'];
const energies: EnergyPattern[] = ['low', 'mixed', 'good'];
const tones: OnboardingTone[] = ['gentle', 'direct', 'practical', 'structured'];
const budgets: DailyTimeBudget[] = ['5 min', '15 min', '30 min', 'flexible'];
const moduleOptions: { key: ModuleKey; label: string }[] = [
  { key: 'habits', label: 'Habits' },
  { key: 'projects', label: 'Projects' },
  { key: 'learning', label: 'Learning' },
  { key: 'health', label: 'Health' },
  { key: 'environment', label: 'Relationships' },
  { key: 'decision', label: 'Decisions' }
];

export default function OnboardingScreen() {
  const { data, updateData, loading } = useAppData();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [preferredName, setPreferredName] = useState(data?.preferences.preferredName ?? '');
  const [username, setUsername] = useState(data?.userProfile?.username ?? '');
  const [pronouns, setPronouns] = useState(data?.userProfile?.pronouns ?? '');
  const [desiredPerson, setDesiredPerson] = useState('');
  const [currentSeason, setCurrentSeason] = useState<LifeSeason>('growing');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [mainAreas, setMainAreas] = useState<string[]>([]);
  const [weeklyFocus, setWeeklyFocus] = useState('build routine');
  const [learningGoal, setLearningGoal] = useState('');
  const [healthContext, setHealthContext] = useState('');
  const [relationshipPreference, setRelationshipPreference] = useState('');
  const [energyPattern, setEnergyPattern] = useState<EnergyPattern>('mixed');
  const [tone, setTone] = useState<OnboardingTone>('gentle');
  const [dailyTimeBudget, setDailyTimeBudget] = useState<DailyTimeBudget>('15 min');
  const habitSuggestions = useMemo(() => suggestHabits({ weeklyFocus, energyPattern, dailyTimeBudget }), [weeklyFocus, energyPattern, dailyTimeBudget]);
  const [habits, setHabits] = useState<string[]>(habitSuggestions);
  const recommendedModules = useMemo(() => recommendModules({ weeklyFocus, values: selectedValues }), [weeklyFocus, selectedValues]);
  const [modules, setModules] = useState<ModuleKey[]>(recommendedModules);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [planSuggestion, setPlanSuggestion] = useState<AiPlanSuggestion | null>(null);
  const [message, setMessage] = useState('');

  if (loading || !data) return null;

  const finish = async () => {
    if (saving) return;
    if (!user) {
      setMessage('Log in again before finishing setup.');
      return;
    }
    const input = {
      authUserId: user.uid,
      email: user.email,
      preferredName,
      username,
      pronouns,
      desiredPerson,
      currentSeason,
      values: selectedValues,
      weeklyFocus,
      mainAreas,
      energyPattern,
      dailyTimeBudget,
      habits,
      startingRoutine: habits,
      recommendedModules: modules,
      tone,
      learningGoal,
      healthContext,
      relationshipPreference
    };
    const validationError = validateOnboardingInput(input);
    if (validationError) {
      setMessage(validationError);
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const saved = await updateData(
        current => applyOnboarding(current, input),
        { type: 'data.updated', payload: { reason: 'onboarding.completed' } }
      );
      if (!saved?.preferences.onboardingCompleted) throw new Error('Setup did not finish saving. Please try again.');
      router.replace('/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Setup could not finish. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (saving) return;
    if (step < 4) setStep(step + 1);
    else finish();
  };

  const suggestPlan = async () => {
    if (suggesting) return;
    if (!desiredPerson.trim()) {
      setMessage('Write the person you are becoming first.');
      return;
    }
    setSuggesting(true);
    setMessage('');
    try {
      const suggestion = await suggestIdentityPlan(data, desiredPerson);
      setPlanSuggestion(suggestion);
      if (!weeklyFocus.trim() || weeklyFocus === 'build routine') setWeeklyFocus(suggestion.weeklyFocus);
      if (!selectedValues.length) setSelectedValues(suggestion.suggestedValues.slice(0, 3));
      setHabits(suggestion.habits.map(habit => habit.tinyVersion || habit.title).slice(0, 5));
      setModules(current => [...new Set([...current, ...suggestion.recommendedModules.map(module => module.moduleId)])]);
      setStep(4);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Suggestions are not available right now.');
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>First setup</Text>
      <Text style={styles.title}>{titles[step]}</Text>
      <Text style={styles.step}>Step {step + 1} of 5</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {step === 0 ? (
        <Card>
          <Field label="Preferred name" value={preferredName} onChangeText={setPreferredName} placeholder="Your name" />
          <Field label="Username" value={username} onChangeText={setUsername} placeholder="yourname" />
          <Field label="Pronouns optional" value={pronouns} onChangeText={setPronouns} placeholder="Optional" />
          <Field label="Person I am becoming" value={desiredPerson} onChangeText={setDesiredPerson} placeholder="Steady, healthy, focused" />
          <Button title={suggesting ? 'Suggesting...' : 'Suggest habits'} variant="secondary" onPress={suggestPlan} disabled={suggesting} />
          <Text style={styles.label}>Season</Text>
          <ChipRow options={seasons} selected={[currentSeason]} onPress={value => setCurrentSeason(value as LifeSeason)} />
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <Text style={styles.label}>Choose up to 3 values</Text>
          <ChipRow options={values} selected={selectedValues} onPress={toggleValue} />
          <Text style={styles.label}>Main areas</Text>
          <ChipRow options={areas} selected={mainAreas} onPress={toggleArea} />
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <Text style={styles.label}>This week</Text>
          <ChipRow options={focuses} selected={[weeklyFocus]} onPress={setWeeklyFocus} />
          <Field label="Or write your focus" value={weeklyFocus} onChangeText={setWeeklyFocus} />
          <Field label="Learning goal optional" value={learningGoal} onChangeText={setLearningGoal} placeholder="German, anatomy, product design" />
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <Text style={styles.label}>Energy</Text>
          <ChipRow options={energies} selected={[energyPattern]} onPress={value => setEnergyPattern(value as EnergyPattern)} />
          <Text style={styles.label}>Tone</Text>
          <ChipRow options={tones} selected={[tone]} onPress={value => setTone(value as OnboardingTone)} />
          <Text style={styles.label}>Daily time</Text>
          <ChipRow options={budgets} selected={[dailyTimeBudget]} onPress={value => setDailyTimeBudget(value as DailyTimeBudget)} />
          <Field label="Health context optional" value={healthContext} onChangeText={setHealthContext} placeholder="Low energy, sleep, movement limits" />
          <Field label="Accountability optional" value={relationshipPreference} onChangeText={setRelationshipPreference} placeholder="A person or support style" />
        </Card>
      ) : null}

      {step === 4 ? (
        <>
          <Card>
            <Text style={styles.cardTitle}>Starting habits</Text>
            {planSuggestion ? <Text style={styles.note}>{planSuggestion.summary}</Text> : null}
            <ChipRow options={habitSuggestions} selected={habits} onPress={toggleHabit} />
            <Field label="Edit first habit" value={habits[0] ?? ''} onChangeText={value => setHabits([value, ...habits.slice(1)])} />
            {planSuggestion?.habits.map((habit, index) => (
              <View key={`${habit.title}-${index}`} style={styles.suggestionRow}>
                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionTitle}>{habit.title}</Text>
                  <Text style={styles.note}>{habit.tinyVersion}</Text>
                  <Text style={styles.note}>{habit.why}</Text>
                </View>
                <Button title={habits.includes(habit.tinyVersion) ? 'Remove' : 'Keep'} variant={habits.includes(habit.tinyVersion) ? 'secondary' : 'primary'} onPress={() => toggleSuggestedHabit(habit.tinyVersion)} />
              </View>
            ))}
            <Button title={suggesting ? 'Regenerating...' : 'Regenerate'} variant="secondary" onPress={suggestPlan} disabled={suggesting} />
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Modules</Text>
            <ChipRow options={moduleOptions.map(option => option.label)} selected={moduleOptions.filter(option => modules.includes(option.key)).map(option => option.label)} onPress={toggleModuleByLabel} />
            <View style={styles.chipRow}>{recommendedModules.map(module => <Chip key={module} label={`Suggested: ${module}`} />)}</View>
          </Card>
        </>
      ) : null}

      <Button title={saving ? 'Saving...' : step === 4 ? 'Your POS is ready' : 'Continue'} onPress={next} disabled={saving} />
    </ScrollView>
  );

  function toggleValue(value: string) {
    setSelectedValues(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value].slice(0, 3));
  }

  function toggleHabit(value: string) {
    setHabits(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value].slice(0, 5));
  }

  function toggleSuggestedHabit(value: string) {
    setHabits(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value].slice(0, 5));
  }

  function toggleArea(value: string) {
    setMainAreas(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value].slice(0, 4));
  }

  function toggleModuleByLabel(label: string) {
    const module = moduleOptions.find(option => option.label === label)?.key;
    if (!module) return;
    setModules(current => current.includes(module) ? current.filter(item => item !== module) : [...current, module]);
  }
}

function ChipRow({ options, selected, onPress }: { options: readonly string[]; selected: string[]; onPress: (value: string) => void }) {
  return (
    <View style={styles.chipRow}>
      {options.map(option => (
        <Button key={option} title={label(option)} variant={selected.includes(option) ? 'primary' : 'secondary'} onPress={() => onPress(option)} />
      ))}
    </View>
  );
}

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const titles = ['Who are you becoming?', 'What matters?', 'What needs focus?', 'What pace fits?', 'Choose your start.'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center', padding: theme.spacing.screen, paddingTop: 56, paddingBottom: 48 },
  eyebrow: { color: theme.colors.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 },
  title: { fontSize: 30, fontWeight: '900', color: theme.colors.text, lineHeight: 34, marginTop: 8, flexShrink: 1 },
  step: { color: theme.colors.textMuted, marginTop: 6, marginBottom: 16, fontWeight: '800' },
  message: { color: theme.colors.warning, fontWeight: '800', lineHeight: 20, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: '900', marginBottom: 12, color: theme.colors.text, flexShrink: 1 },
  label: { color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  note: { color: theme.colors.textMuted, lineHeight: 20, marginBottom: 8 },
  suggestionRow: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, marginTop: 10, flexDirection: 'row', gap: 10, alignItems: 'center' },
  suggestionText: { flex: 1, minWidth: 0 },
  suggestionTitle: { color: theme.colors.text, fontWeight: '900', marginBottom: 4 }
});
