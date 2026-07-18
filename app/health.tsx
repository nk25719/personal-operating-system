import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { Character, HealthProfile } from '../types';

const defaultHealthProfile = (): HealthProfile => ({
  enabled: false,
  medicalConditions: '',
  allergies: '',
  physicalLimitations: '',
  medications: '',
  pregnancyStatus: 'preferNotToSay',
  sleepIssues: '',
  dietaryPreferences: '',
  mentalHealthConsiderations: '',
  painOrEnergyNotes: '',
  clinicianGuidance: '',
  habitIntensity: 'moderate',
  showHealthDisclaimer: true
});

export default function HealthScreen() {
  const { data, updateCharacter: mutateCharacter, loading } = useAppData();
  if (loading || !data) return null;
  const active = data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
  const profile = active.healthProfile ?? defaultHealthProfile();

  const updateCharacter = (patch: Partial<Character>) => mutateCharacter(active.id, patch);
  const updateHealth = (patch: Partial<HealthProfile>) => updateCharacter({ healthProfile: { ...profile, ...patch } });

  const constraints = buildConstraintSummary(profile);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Health" />
      <Text style={styles.subtitle}>Optional context used to tailor habits and avoid inappropriate suggestions. This is not medical advice.</Text>

      <Card>
        <Text style={styles.cardTitle}>Personalization Toggle</Text>
        <Button title={`${profile.enabled ? '✓ ' : ''}Use health context in habit planning`} onPress={() => updateHealth({ enabled: !profile.enabled })} />
        <Button title={`${profile.showHealthDisclaimer ? '✓ ' : ''}Show health disclaimers`} onPress={() => updateHealth({ showHealthDisclaimer: !profile.showHealthDisclaimer })} />
        {profile.showHealthDisclaimer ? <Text style={styles.disclaimer}>POS can adapt routines around what you share here. It is for personal organization only, not diagnosis, treatment, prescription, or a replacement for qualified medical care.</Text> : null}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Health Context</Text>
        <Field label="Medical conditions" value={profile.medicalConditions} onChangeText={v => updateHealth({ medicalConditions: v })} multiline placeholder="Example: asthma, diabetes, hypertension, migraines, ADHD, anxiety..." />
        <Field label="Allergies" value={profile.allergies} onChangeText={v => updateHealth({ allergies: v })} multiline />
        <Field label="Physical limitations or injuries" value={profile.physicalLimitations} onChangeText={v => updateHealth({ physicalLimitations: v })} multiline placeholder="Example: knee pain, back pain, wheelchair use, recent surgery..." />
        <Field label="Current medications (optional)" value={profile.medications} onChangeText={v => updateHealth({ medications: v })} multiline />
        <Field label="Pregnancy status" value={profile.pregnancyStatus ?? 'preferNotToSay'} onChangeText={v => updateHealth({ pregnancyStatus: v as HealthProfile['pregnancyStatus'] })} placeholder="notPregnant / pregnant / postpartum / trying / preferNotToSay" />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Lifestyle Constraints</Text>
        <Field label="Sleep issues" value={profile.sleepIssues} onChangeText={v => updateHealth({ sleepIssues: v })} multiline />
        <Field label="Dietary preferences or restrictions" value={profile.dietaryPreferences} onChangeText={v => updateHealth({ dietaryPreferences: v })} multiline placeholder="Example: halal, vegetarian, gluten-free..." />
        <Field label="Mental health / focus considerations" value={profile.mentalHealthConsiderations} onChangeText={v => updateHealth({ mentalHealthConsiderations: v })} multiline placeholder="Example: stress, ADHD, burnout risk, anxiety..." />
        <Field label="Pain / energy notes" value={profile.painOrEnergyNotes} onChangeText={v => updateHealth({ painOrEnergyNotes: v })} multiline />
        <Field label="Clinician guidance to respect" value={profile.clinicianGuidance} onChangeText={v => updateHealth({ clinicianGuidance: v })} multiline placeholder="Example: avoid high-impact exercise, limit caffeine, physical therapy plan..." />
        <Field label="Habit intensity" value={profile.habitIntensity} onChangeText={v => updateHealth({ habitIntensity: v as HealthProfile['habitIntensity'] })} placeholder="gentle / moderate / ambitious" />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Adaptive Habit Rules</Text>
        {constraints.map((item, index) => (
          <View key={index} style={styles.rule}>
            <Text style={styles.ruleTitle}>{item.title}</Text>
            <Text style={styles.ruleText}>{item.text}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function buildConstraintSummary(profile: HealthProfile) {
  const blob = `${profile.medicalConditions} ${profile.physicalLimitations} ${profile.sleepIssues} ${profile.mentalHealthConsiderations} ${profile.painOrEnergyNotes} ${profile.clinicianGuidance}`.toLowerCase();
  const rules = [
    { title: 'Default rule', text: 'Habits should have a minimum version, a recovery version, and an ambitious version.' }
  ];
  if (!profile.enabled) return [{ title: 'Health context off', text: 'The planner will not use health information until this module is enabled.' }, ...rules];
  if (profile.habitIntensity === 'gentle') rules.push({ title: 'Gentle mode', text: 'Prefer low-friction habits: stretching, walking, breathing, short focus blocks, and recovery windows.' });
  if (blob.includes('knee') || blob.includes('joint') || blob.includes('arthritis')) rules.push({ title: 'Joint-aware movement', text: 'Prefer low-impact movement options and avoid assuming daily running is appropriate.' });
  if (blob.includes('asthma') || blob.includes('breath')) rules.push({ title: 'Breathing-aware exercise', text: 'Suggest gradual warmups and avoid intense cardio as a default recommendation.' });
  if (blob.includes('diabetes') || blob.includes('glucose')) rules.push({ title: 'Diabetes-aware planning', text: 'Avoid fasting challenges or intense workout assumptions. Encourage using the person’s existing clinician-approved glucose routine.' });
  if (blob.includes('adhd') || blob.includes('focus')) rules.push({ title: 'Focus support', text: 'Prefer 10-25 minute blocks, visible checklists, body-doubling, reminders, and reduced setup time.' });
  if (blob.includes('anxiety') || blob.includes('stress') || blob.includes('burnout')) rules.push({ title: 'Nervous-system support', text: 'Keep recovery blocks, meditation, journaling, and low-pressure planning visible.' });
  if (blob.includes('insomnia') || blob.includes('sleep')) rules.push({ title: 'Sleep protection', text: 'Avoid late caffeine/productivity pushes and protect a wind-down routine.' });
  if (profile.pregnancyStatus === 'pregnant' || profile.pregnancyStatus === 'postpartum') rules.push({ title: 'Pregnancy/postpartum caution', text: 'Keep all physical habit suggestions conservative and prompt clinician guidance for exercise and health decisions.' });
  if (profile.clinicianGuidance.trim()) rules.push({ title: 'Clinician guidance', text: `Respect: ${profile.clinicianGuidance}` });
  return rules;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f1ea' },
  content: { padding: 18, paddingTop: 64, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: '#24322f' },
  subtitle: { color: '#68766f', marginTop: 6, marginBottom: 16, lineHeight: 20 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  disclaimer: { color: '#68766f', lineHeight: 20, marginTop: 12 },
  rule: { borderTopWidth: 1, borderTopColor: '#dde7df', paddingVertical: 10 },
  ruleTitle: { fontWeight: '800', color: '#24322f' },
  ruleText: { color: '#3f4a45', marginTop: 4, lineHeight: 20 }
});
