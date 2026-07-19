import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { Button } from '../components/Button';
import { useAppData } from '../hooks/useAppData';
import { Character } from '../types';
import { theme } from '../constants/theme';

export default function ProfileScreen() {
  const { data, updateData, updateCharacter: mutateCharacter, loading } = useAppData();
  if (loading || !data) return null;
  const active = data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
  const updateCharacter = (patch: Partial<Character>) => mutateCharacter(active.id, patch);
  const updateDemographics = (patch: Partial<NonNullable<Character['demographics']>>) => updateCharacter({ demographics: { ...active.demographics, ...patch } });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Profile" />
      <Text style={styles.subtitle}>POS becomes more personal when it understands your life, your obligations, and the person you are choosing to become.</Text>

      <Card variant="highlight">
        <Text style={styles.cardTitle}>How POS speaks to you</Text>
        <Field label="Preferred name" value={data.preferences.preferredName ?? active.name} onChangeText={v => updateData(current => ({ ...current, preferences: { ...current.preferences, preferredName: v } }))} />
        <Field label="Tone" value={data.preferences.tone} onChangeText={v => updateData(current => ({ ...current, preferences: { ...current.preferences, tone: v as any } }))} placeholder="warm / direct / reflective / coach / minimal" />
        <Field label="Rotating personal prompts" value={data.preferences.rotatingPrompts.join('\n')} onChangeText={v => updateData(current => ({ ...current, preferences: { ...current.preferences, rotatingPrompts: v.split('\n').map(x => x.trim()).filter(Boolean) } }))} multiline />
        <Text style={styles.note}>These lines rotate across the app so the experience feels personal instead of repetitive.</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Identity</Text>
        <Field label="Name" value={active.name} onChangeText={v => updateCharacter({ name: v })} />
        <Field label="Who are you becoming?" value={active.desiredPerson ?? ''} onChangeText={v => updateCharacter({ desiredPerson: v })} multiline />
        <Field label="Current identity" value={active.identity} onChangeText={v => updateCharacter({ identity: v })} multiline />
        <Field label="Daily obligations" value={active.dailyObligations ?? ''} onChangeText={v => updateCharacter({ dailyObligations: v })} multiline />
        <Field label="Core values, comma separated" value={active.values.join(', ')} onChangeText={v => updateCharacter({ values: v.split(',').map(x => x.trim()).filter(Boolean) })} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Demographics</Text>
        <Field label="Date of birth" value={data.lifeProfile.birthDate ?? ''} onChangeText={v => updateData(current => ({ ...current, lifeProfile: { ...current.lifeProfile, birthDate: v } }))} placeholder="YYYY-MM-DD" />
        <Field label="Country / location" value={(active.demographics as any)?.country ?? ''} onChangeText={v => updateDemographics({ ...(active.demographics as any), country: v } as any)} placeholder="Lebanon" />
        <Field label="Occupation" value={(active.demographics as any)?.occupation ?? ''} onChangeText={v => updateDemographics({ ...(active.demographics as any), occupation: v } as any)} placeholder="Biomedical engineer" />
        <Field label="Languages" value={(active.demographics as any)?.languages ?? ''} onChangeText={v => updateDemographics({ ...(active.demographics as any), languages: v } as any)} placeholder="Arabic, English, German" />
        <Field label="Biological sex" value={active.demographics?.biologicalSex ?? 'preferNotToSay'} onChangeText={v => updateDemographics({ biologicalSex: v as any })} placeholder="female / male / other / preferNotToSay" />
        <Button title={`${active.demographics?.showWomenHealth ? '✓ ' : ''}Show women’s health module`} onPress={() => updateDemographics({ showWomenHealth: !active.demographics?.showWomenHealth })} />
        <Text style={styles.note}>Demographics are optional. They help POS tailor schedules, health-aware habits, and life planning more respectfully.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center', padding: theme.spacing.screen, paddingTop: 48, paddingBottom: 64 },
  subtitle: { color: theme.colors.textMuted, marginTop: 8, marginBottom: 16, lineHeight: 22 },
  cardTitle: { fontSize: 17, fontWeight: '900', marginBottom: 12, color: theme.colors.text, flexShrink: 1 },
  note: { color: theme.colors.textMuted, lineHeight: 21, marginTop: 8 }
});
