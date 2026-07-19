import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Card } from '../components/Card';
import { HeaderActions } from '../components/HeaderActions';
import { Chip } from '../components/Visual';
import { theme } from '../constants/theme';
import { useAppData } from '../hooks/useAppData';
import { ModuleKey } from '../types';
import { AppIcon, AppIconName } from '../components/AppIcon';

const groups = [
  {
    title: 'Planning',
    items: [
      { title: 'Plan', subtitle: 'Organize the day.', route: '/plan', icon: 'plan' },
      { title: 'Tasks', subtitle: 'Next actions.', route: '/tasks', icon: 'tasks' },
      { title: 'Projects', subtitle: 'Active outcomes.', route: '/projects', icon: 'projects', moduleKey: 'projects' },
      { title: 'Decisions', subtitle: 'Choice check.', route: '/decision', icon: 'decisions', moduleKey: 'decision' }
    ]
  },
  {
    title: 'Growth',
    items: [
      { title: 'Habits', subtitle: 'Steady practices.', route: '/habits', icon: 'habits', moduleKey: 'habits' },
      { title: 'Builder', subtitle: 'Shape POS.', route: '/builder', icon: 'builder', moduleKey: 'builder' },
      { title: 'AI', subtitle: 'Optional advisor.', route: '/ai', icon: 'ai', moduleKey: 'ai' }
    ]
  },
  {
    title: 'Knowledge',
    items: [
      { title: 'Learning', subtitle: 'Study notes.', route: '/learning', icon: 'learning', moduleKey: 'learning' },
      { title: 'Capture', subtitle: 'Save a thought.', route: '/capture', icon: 'capture' }
    ]
  },
  {
    title: 'Wellbeing',
    items: [
      { title: 'Health', subtitle: 'Body context.', route: '/health', icon: 'health', moduleKey: 'health' },
      { title: 'Women’s Health', subtitle: 'Cycle notes.', route: '/women-health', icon: 'womenHealth', moduleKey: 'womenHealth' },
      { title: 'Environment', subtitle: 'Spaces and values.', route: '/environment', icon: 'environment', moduleKey: 'environment' }
    ]
  },
  {
    title: 'Relationships',
    items: [
      { title: 'Relationships', subtitle: 'Connection care.', route: '/relationships', icon: 'relationships' }
    ]
  }
] as const;

export default function ModulesScreen() {
  const { data } = useAppData();
  const recommended = new Set(data?.preferences.recommendedModules ?? []);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Modules</Text>
          <Text style={styles.title}>More tools</Text>
        </View>
        <HeaderActions />
      </View>
      <View style={styles.chips}>
        <Chip label="One tap away" />
        <Chip label="Local-first" />
      </View>

      {groups.map(group => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.sectionTitle}>{group.title}</Text>
          <View style={styles.grid}>
            {group.items.map(item => (
              <Link key={item.route} href={item.route as any} asChild>
                <Pressable accessibilityRole="button" style={styles.shortcut}>
                  <Card style={styles.cardFill}>
                    <View style={styles.icon}>
                      <AppIcon name={item.icon as AppIconName} size={21} fallbackLabel={item.title.slice(0, 2)} />
                    </View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                    {'moduleKey' in item && recommended.has(item.moduleKey as ModuleKey) ? <Text style={styles.suggested}>Suggested</Text> : null}
                  </Card>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingTop: 56, paddingBottom: 64 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  titleBlock: { flex: 1 },
  eyebrow: { color: theme.colors.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 11 },
  title: { fontSize: 34, fontWeight: '900', color: theme.colors.text, marginTop: 6, lineHeight: 38 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 16 },
  group: { marginTop: 4 },
  sectionTitle: { color: theme.colors.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 12, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shortcut: { width: '48%' },
  cardFill: { minHeight: 134, justifyContent: 'space-between' },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: theme.colors.text, lineHeight: 22 },
  subtitle: { color: theme.colors.textMuted, lineHeight: 19, marginTop: 5 },
  suggested: { color: theme.colors.accent, fontSize: 12, fontWeight: '900', marginTop: 8, textTransform: 'uppercase' }
});
