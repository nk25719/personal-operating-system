import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { Chip, Details, StatCard } from '../components/Visual';
import { theme } from '../constants/theme';
import { useAppData } from '../hooks/useAppData';
import { createTodayCalendarEvents } from '../services/calendar';
import { logOut } from '../services/firebase';
import { syncProjectsToNotion } from '../services/notion';
import { scheduleHabitReminders } from '../services/reminders';
import { Character } from '../types';
import { exportAppBackup, importAppBackup, previewAppBackup, resetAppData } from '../utils/storage';
import { getIntegrationSecrets, setSecret } from '../utils/secrets';
import { AppIcon } from '../components/AppIcon';
import { appIconRegistry, AppIconName } from '../utils/icons';

const newCharacter = (): Character => ({ id: `human-${Date.now()}`, name: 'New human', identity: 'Describe who this person is becoming.', desiredPerson: '', dailyObligations: '', missionQuestion: 'Does this move me closer to who I am becoming?', values: ['Health', 'Growth'], demographics: { biologicalSex: 'preferNotToSay', showWomenHealth: false }, healthProfile: { enabled: false, medicalConditions: '', allergies: '', physicalLimitations: '', medications: '', pregnancyStatus: 'preferNotToSay', sleepIssues: '', dietaryPreferences: '', mentalHealthConsiderations: '', painOrEnergyNotes: '', clinicianGuidance: '', habitIntensity: 'moderate', showHealthDisclaimer: true } });

export default function SettingsScreen() {
  const { data, updateData, updateCharacter: mutateCharacter, updateIntegrations, loading } = useAppData();
  const [message, setMessage] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [backupText, setBackupText] = useState('');

  useEffect(() => {
    getIntegrationSecrets().then(secrets => {
      setOpenaiApiKey(secrets.openaiApiKey);
      setNotionToken(secrets.notionToken);
    });
  }, []);

  const backupPreview = useMemo(() => {
    if (!backupText.trim()) return null;
    try {
      return previewAppBackup(backupText);
    } catch {
      return null;
    }
  }, [backupText]);

  if (loading || !data) return null;
  const active = data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
  const updateCharacter = (patch: Partial<Character>) => mutateCharacter(active.id, patch);
  const updateDemographics = (patch: Partial<NonNullable<Character['demographics']>>) => updateCharacter({ demographics: { ...active.demographics, ...patch } });
  const saveOpenAIKey = async (value: string) => {
    setOpenaiApiKey(value);
    await setSecret('openaiApiKey', value);
  };
  const saveNotionToken = async (value: string) => {
    setNotionToken(value);
    await setSecret('notionToken', value);
  };
  const exportBackup = async () => {
    const backup = await exportAppBackup();
    setBackupText(backup);
    setMessage('Backup generated. It excludes OpenAI and Notion secrets.');
  };
  const importBackup = async () => {
    try {
      await importAppBackup(backupText);
      setMessage('Backup imported. Restart or revisit screens to refresh local state.');
    } catch (error) {
      setMessage(`Import failed: ${String(error)}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Settings" />
      <View style={styles.chipRow}>
        <Chip label="Local-first" />
        <Chip label="Secure secrets" />
      </View>
      {message ? <Card><Text style={styles.message}>{message}</Text></Card> : null}
      <Card>
        <Text style={styles.cardTitle}>Person profile</Text>
        <Field label="Name" value={active.name} onChangeText={v => updateCharacter({ name: v })} />
        <Field label="Identity" value={active.identity} onChangeText={v => updateCharacter({ identity: v })} multiline />
        <Field label="Person I want to become" value={active.desiredPerson ?? ''} onChangeText={v => updateCharacter({ desiredPerson: v })} multiline />
        <Field label="Current daily obligations" value={active.dailyObligations ?? ''} onChangeText={v => updateCharacter({ dailyObligations: v })} multiline />
        <Field label="Guiding question" value={active.missionQuestion} onChangeText={v => updateCharacter({ missionQuestion: v })} multiline />
        <Field label="Values, comma separated" value={active.values.join(', ')} onChangeText={v => updateCharacter({ values: v.split(',').map(x => x.trim()).filter(Boolean) })} />
        <Text style={styles.smallTitle}>Demographics</Text>
        <Field label="Biological sex" value={active.demographics?.biologicalSex ?? 'preferNotToSay'} onChangeText={v => updateDemographics({ biologicalSex: v as NonNullable<Character['demographics']>['biologicalSex'] })} placeholder="female / male / other / preferNotToSay" />
        <Button title={`${active.demographics?.showWomenHealth ? 'Showing' : 'Show'} women’s health`} variant="secondary" onPress={() => updateDemographics({ showWomenHealth: !active.demographics?.showWomenHealth })} />
        <Details title="More profile">
          <Text style={styles.note}>Health constraints can shape habit suggestions.</Text>
          <Button title="Add another profile" variant="secondary" onPress={() => updateData(current => ({ ...current, characters: [...current.characters, newCharacter()] }))} />
        </Details>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Integrations</Text>
        <Field label="Notion internal integration token" value={notionToken} onChangeText={saveNotionToken} />
        <Field label="Notion database ID" value={data.integrations.notionDatabaseId} onChangeText={v => updateIntegrations({ notionDatabaseId: v })} />
        <Field label="OpenAI API key" value={openaiApiKey} onChangeText={saveOpenAIKey} />
        <Field label="AI model" value={data.integrations.aiModel} onChangeText={v => updateIntegrations({ aiModel: v })} />
        <Field label="Calendar name" value={data.integrations.calendarName} onChangeText={v => updateIntegrations({ calendarName: v })} />
        <Details title="More integrations">
          <Field label="Web research backend endpoint" value={data.integrations.webResearchEndpoint ?? ''} onChangeText={v => updateIntegrations({ webResearchEndpoint: v })} />
          <Text style={styles.note}>Keys stay in SecureStore.</Text>
        </Details>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Privacy</Text>
        <View style={styles.metricRow}>
          <StatCard label="Profile" value="Local" />
          <StatCard label="Secrets" value="Secure" />
          <StatCard label="Sync" value="Off" />
        </View>
        <Details title="Details">
          <Text style={styles.privacyLine}>Local: profile, values, habits, projects, tasks, captures, reviews, events, planner memory.</Text>
          <Text style={styles.privacyLine}>Secure: OpenAI keys and Notion tokens.</Text>
          <Text style={styles.privacyLine}>Backup: app data, events, planner memory. No secrets.</Text>
          <Text style={styles.privacyLine}>AI: selected context is sent only when AI is enabled.</Text>
        </Details>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Icon check</Text>
        <Text style={styles.note}>All app icons should show with a label.</Text>
        <View style={styles.iconGrid}>
          {(Object.keys(appIconRegistry) as AppIconName[]).map(iconKey => (
            <View key={iconKey} style={styles.iconCheck}>
              <View style={styles.iconCircle}>
                <AppIcon name={iconKey} size={20} />
              </View>
              <Text style={styles.iconLabel}>{iconKey}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Actions</Text>
        <Button title="Schedule reminders" variant="secondary" onPress={async () => setMessage(await scheduleHabitReminders(data))} />
        <Details title="More actions">
          <Button title="Create calendar events" variant="secondary" onPress={async () => setMessage(await createTodayCalendarEvents(data))} />
          <Button title="Sync projects to Notion" variant="secondary" onPress={async () => setMessage(await syncProjectsToNotion(data))} />
          <Button title="Reset local data" variant="secondary" onPress={async () => { await resetAppData(); setMessage('Local data reset. Restart the app.'); }} />
          <Button title="Log out" variant="secondary" onPress={logOut} />
        </Details>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Export / Import</Text>
        <Button title="Export my data" onPress={exportBackup} />
        <Field label="Backup JSON" value={backupText} onChangeText={setBackupText} multiline placeholder="Paste a POS backup JSON here to import." />
        {backupPreview ? (
          <View style={styles.previewBox}>
            <Text style={styles.smallTitle}>Restore preview</Text>
            <Text style={styles.note}>Schema version: {backupPreview.schemaVersion}</Text>
            <Text style={styles.note}>Characters: {backupPreview.charactersCount}</Text>
            <Text style={styles.note}>Habits: {backupPreview.habitsCount}</Text>
            <Text style={styles.note}>Projects: {backupPreview.projectsCount}</Text>
            <Text style={styles.note}>Tasks: {backupPreview.tasksCount}</Text>
            <Text style={styles.warning}>{backupPreview.warning}</Text>
          </View>
        ) : null}
        <Button title="Import backup" variant="secondary" onPress={importBackup} />
        <Details title="Backup details">
          <Text style={styles.note}>Backups include local data and events. Secrets are excluded.</Text>
        </Details>
      </Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center', padding: theme.spacing.screen, paddingTop: 48, paddingBottom: 64 },
  note: { color: theme.colors.textMuted, marginTop: 8, lineHeight: 20 },
  privacyLine: { color: theme.colors.text, marginTop: 8, lineHeight: 21 },
  warning: { color: theme.colors.warning, marginTop: 10, lineHeight: 20, fontWeight: '800' },
  previewBox: { backgroundColor: theme.colors.surfaceSoft, borderWidth: 1, borderColor: theme.colors.primarySoft, borderRadius: 14, padding: 12, marginTop: 12, marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 16 },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  iconCheck: { width: 78, maxWidth: '31%', alignItems: 'center', gap: 6, minWidth: 0 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceSoft },
  iconLabel: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, color: theme.colors.text },
  message: { color: theme.colors.text, fontSize: 16, lineHeight: 21 },
  smallTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800', marginTop: 8, marginBottom: 8 }
});
