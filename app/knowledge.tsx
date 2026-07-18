import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { HeaderActions } from '../components/HeaderActions';
import { Chip, Details, StatCard } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { theme } from '../constants/theme';

export default function KnowledgeScreen() {
  const { data, loading } = useAppData();
  if (loading || !data) return null;

  const captures = data.captureInbox ?? [];
  const latestCapture = captures[0];
  const learning = data.learningTopics ?? [];
  const resurfaced = learning.slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Knowledge</Text>
          <Text style={styles.subtitle}>What do I know and need to remember?</Text>
        </View>
        <HeaderActions />
      </View>

      <Card variant="highlight">
        <View style={styles.row}>
          <Icon name="albums" />
          <View style={styles.copy}>
            <Text style={styles.cardLabel}>Captures</Text>
            <Text style={styles.cardTitle}>{captures.length} saved</Text>
            <Text style={styles.muted}>{latestCapture?.text ?? 'Capture one useful sentence.'}</Text>
          </View>
        </View>
        <Link href="/capture" asChild><Button title="Add note" /></Link>
      </Card>

      <Card>
        <View style={styles.row}>
          <Icon name="book" />
          <View style={styles.copy}>
            <Text style={styles.cardLabel}>Learning</Text>
            <Text style={styles.cardTitle}>{learning[0]?.name ?? 'No topic yet'}</Text>
            <Text style={styles.muted}>{learning[0]?.nextAction ?? 'Choose one thing to remember.'}</Text>
          </View>
        </View>
        <View style={styles.chips}>
          {learning.slice(0, 4).map(topic => <Chip key={topic.id} label={topic.name} />)}
        </View>
        <Link href="/learning" asChild><Button title="Open learning" variant="secondary" /></Link>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>Resurfaced notes</Text>
        <View style={styles.metricRow}>
          <StatCard label="Topics" value={String(learning.length)} />
          <StatCard label="Action notes" value={String(captures.filter(entry => entry.extractedActions.length).length)} />
        </View>
        {resurfaced.map(topic => (
          <View key={topic.id} style={styles.noteRow}>
            <Text style={styles.rowTitle}>{topic.day}: {topic.name}</Text>
            <Text style={styles.muted}>{topic.resources.slice(0, 2).join(' · ')}</Text>
          </View>
        ))}
        <Details title="Details">
          <Text style={styles.body}>Notes stay local unless you choose AI or export a backup.</Text>
        </Details>
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
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  titleBlock: { flex: 1 },
  title: { fontSize: 34, fontWeight: '900', color: theme.colors.text, lineHeight: 38 },
  subtitle: { color: theme.colors.textMuted, marginTop: 8, marginBottom: 16, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  cardLabel: { color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12, marginBottom: 5 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.text, lineHeight: 25 },
  body: { fontSize: 15, color: theme.colors.text, lineHeight: 21 },
  muted: { color: theme.colors.textMuted, lineHeight: 20, marginTop: 4 },
  noteRow: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10, marginTop: 10 },
  rowTitle: { fontSize: 15, fontWeight: '900', color: theme.colors.text, lineHeight: 21 }
});
