import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { defaultMotivationCheckIn, motivationStorageKey } from '../services/os';
import { MotivationCheckIn } from '../types';
import { appendMutationEvent, getJSON, setJSON } from '../utils/storage';
import { theme } from '../constants/theme';

export default function RelationshipsScreen() {
  const { data, loading } = useAppData();
  const [motivation, setMotivation] = useState<MotivationCheckIn>(defaultMotivationCheckIn());
  const [relationshipCue, setRelationshipCue] = useState<'done' | 'skip' | null>(null);
  const relationshipCueKey = `${new Date().toISOString().slice(0, 10)}-relationship-cue`;

  useEffect(() => { getJSON(motivationStorageKey(), defaultMotivationCheckIn()).then(setMotivation); }, []);
  useEffect(() => { getJSON<'done' | 'skip' | null>(relationshipCueKey, null).then(setRelationshipCue); }, [relationshipCueKey]);

  if (loading || !data) return null;

  const partner = data.friends?.[0];
  const showCue = motivation.relatedness <= 2 || relationshipCue !== null || !partner;

  const respond = async (response: 'done' | 'skip') => {
    setRelationshipCue(response);
    await setJSON(relationshipCueKey, response);
    await appendMutationEvent(response === 'done' ? 'connection.done' : 'connection.skipped', {
      prompt: 'Check in with one person today.',
      response,
      dateKey: relationshipCueKey
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Relationships</Text>
      <Text style={styles.subtitle}>Who matters and what needs care?</Text>

      {showCue ? (
        <Card variant="highlight">
          <View style={styles.row}>
            <Icon name="heart" />
            <View style={styles.copy}>
              <Text style={styles.cardLabel}>Connection cue</Text>
              <Text style={styles.cardTitle}>Check in with one person today.</Text>
              <Text style={styles.muted}>{partner ? `Send a short message to ${partner.name}.` : 'Send a short message, or write the person’s name.'}</Text>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <Button title={relationshipCue === 'done' ? 'Done' : 'Done'} variant={relationshipCue === 'done' ? 'primary' : 'secondary'} onPress={() => respond('done')} />
            <Button title={relationshipCue === 'skip' ? 'Skipped' : 'Skip'} variant={relationshipCue === 'skip' ? 'primary' : 'secondary'} onPress={() => respond('skip')} />
          </View>
        </Card>
      ) : null}

      <Card>
        <View style={styles.row}>
          <Icon name="people" />
          <View style={styles.copy}>
            <Text style={styles.cardLabel}>Accountability</Text>
            <Text style={styles.cardTitle}>{partner?.name ?? 'No partner set'}</Text>
            <Text style={styles.muted}>{partner ? 'Private check-ins only.' : 'Choose support when it helps.'}</Text>
          </View>
        </View>
        <View style={styles.chips}>
          <Chip label={`${data.friends?.length ?? 0} people`} />
          <Chip label="No feed" />
          <Chip label="No public streaks" />
        </View>
        <Link href="/social" asChild><Button title="Open connections" variant="secondary" /></Link>
      </Card>
    </ScrollView>
  );
}

function Icon({ name }: { name: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.icon}>
      <Ionicons name={name} size={20} color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingTop: 56, paddingBottom: 64 },
  title: { fontSize: 34, fontWeight: '900', color: theme.colors.text, lineHeight: 38 },
  subtitle: { color: theme.colors.textMuted, marginTop: 8, marginBottom: 16, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  cardLabel: { color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12, marginBottom: 5 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.text, lineHeight: 25 },
  muted: { color: theme.colors.textMuted, lineHeight: 20, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  buttonRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 14 }
});
