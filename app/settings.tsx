import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { createTodayCalendarEvents } from '../services/calendar';
import { syncProjectsToNotion } from '../services/notion';
import { scheduleHabitReminders } from '../services/reminders';
import { Character } from '../types';
import { resetAppData } from '../utils/storage';

const newCharacter = (): Character => ({ id: `human-${Date.now()}`, name: 'New human', identity: 'Describe who this person is becoming.', desiredPerson: '', dailyObligations: '', missionQuestion: 'Does this move me closer to who I am becoming?', values: ['Health', 'Growth'], demographics: { biologicalSex: 'preferNotToSay', showWomenHealth: false }, healthProfile: { enabled: false, medicalConditions: '', allergies: '', physicalLimitations: '', medications: '', pregnancyStatus: 'preferNotToSay', sleepIssues: '', dietaryPreferences: '', mentalHealthConsiderations: '', painOrEnergyNotes: '', clinicianGuidance: '', habitIntensity: 'moderate', showHealthDisclaimer: true } });

export default function SettingsScreen() {
  const { data, setData, loading } = useAppData();
  const [message, setMessage] = useState('');
  if (loading || !data) return null;
  const active = data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
  const updateCharacter = (patch: Partial<Character>) => setData({ ...data, characters: data.characters.map(c => c.id === active.id ? { ...c, ...patch } : c) });
  const updateDemographics = (patch: Partial<NonNullable<Character['demographics']>>) => updateCharacter({ demographics: { ...active.demographics, ...patch } });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Make the POS reusable for different humans and characters.</Text>
      {message ? <Card><Text style={styles.message}>{message}</Text></Card> : null}
      <Card>
        <Text style={styles.cardTitle}>Human / Character</Text>
        <Field label="Name" value={active.name} onChangeText={v => updateCharacter({ name: v })} />
        <Field label="Identity" value={active.identity} onChangeText={v => updateCharacter({ identity: v })} multiline />
        <Field label="Desired person" value={active.desiredPerson ?? ''} onChangeText={v => updateCharacter({ desiredPerson: v })} multiline />
        <Field label="Daily obligations" value={active.dailyObligations ?? ''} onChangeText={v => updateCharacter({ dailyObligations: v })} multiline />
        <Field label="Core question" value={active.missionQuestion} onChangeText={v => updateCharacter({ missionQuestion: v })} multiline />
        <Field label="Values, comma separated" value={active.values.join(', ')} onChangeText={v => updateCharacter({ values: v.split(',').map(x => x.trim()).filter(Boolean) })} />
        <Text style={styles.smallTitle}>Demographics</Text>
        <Field label="Biological sex" value={active.demographics?.biologicalSex ?? 'preferNotToSay'} onChangeText={v => updateDemographics({ biologicalSex: v as NonNullable<Character['demographics']>['biologicalSex'] })} placeholder="female / male / other / preferNotToSay" />
        <Button title={`${active.demographics?.showWomenHealth ? '✓ ' : ''}Show women's health module`} onPress={() => updateDemographics({ showWomenHealth: !active.demographics?.showWomenHealth })} />
        <Text style={styles.note}>Health constraints are edited in the Health tab and used by the planner when enabled.</Text>
        <Button title="Add another human/character" onPress={() => setData({ ...data, characters: [...data.characters, newCharacter()] })} />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Integrations</Text>
        <Field label="Notion internal integration token" value={data.integrations.notionToken} onChangeText={v => setData({ ...data, integrations: { ...data.integrations, notionToken: v } })} />
        <Field label="Notion database ID" value={data.integrations.notionDatabaseId} onChangeText={v => setData({ ...data, integrations: { ...data.integrations, notionDatabaseId: v } })} />
        <Field label="OpenAI API key" value={data.integrations.aiApiKey} onChangeText={v => setData({ ...data, integrations: { ...data.integrations, aiApiKey: v } })} />
        <Field label="AI model" value={data.integrations.aiModel} onChangeText={v => setData({ ...data, integrations: { ...data.integrations, aiModel: v } })} />
        <Field label="Calendar name" value={data.integrations.calendarName} onChangeText={v => setData({ ...data, integrations: { ...data.integrations, calendarName: v } })} />
        <Field label="Web research backend endpoint" value={data.integrations.webResearchEndpoint ?? ''} onChangeText={v => setData({ ...data, integrations: { ...data.integrations, webResearchEndpoint: v } })} />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Actions</Text>
        <Button title="Schedule habit reminders" onPress={async () => setMessage(await scheduleHabitReminders(data))} />
        <Button title="Create today's calendar events" onPress={async () => setMessage(await createTodayCalendarEvents(data))} />
        <Button title="Sync projects to Notion" onPress={async () => setMessage(await syncProjectsToNotion(data))} />
        <Button title="Reset local data" onPress={async () => { await resetAppData(); setMessage('Local data reset. Restart the app.'); }} />
      </Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ note: { color: '#6b7280', marginTop: 8, lineHeight: 20 }, container: { flex: 1, backgroundColor: '#f2f2f7' }, content: { padding: 18, paddingTop: 64 }, title: { fontSize: 32, fontWeight: '800' }, subtitle: { color: '#6b7280', marginTop: 6, marginBottom: 16 }, cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 }, message: { fontSize: 16, lineHeight: 24 }, smallTitle: { fontSize: 16, fontWeight: '800', marginTop: 8, marginBottom: 8 } });
