import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip, ProgressBar } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { AppData, Project, Task } from '../types';
import { AppIcon, AppIconName } from '../components/AppIcon';

const sections = [
  { title: 'Tasks', route: '/tasks', icon: 'tasks', key: 'tasks' },
  { title: 'Habits', route: '/habits', icon: 'habits', key: 'habits' },
  { title: 'Projects', route: '/projects', icon: 'projects', key: 'projects' },
  { title: 'Learning', route: '/learning', icon: 'learning', key: 'learning' },
  { title: 'Decisions', route: '/decision', icon: 'decisions', key: 'decisions' }
] as const;

const tools = [
  { label: 'Profile', route: '/profile' },
  { label: 'Settings', route: '/settings' },
  { label: 'AI', route: '/ai' },
  { label: 'Health', route: '/health' },
  { label: 'Women Health', route: '/women-health' },
  { label: 'Environment', route: '/environment' },
  { label: 'Social', route: '/social' },
  { label: 'Life Clock', route: '/life-clock' },
  { label: 'Builder', route: '/builder' },
  { label: 'Spaces', route: '/modules' }
] as const;

export default function PlanScreen() {
  const { data, loading } = useAppData();
  if (loading || !data) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Plan</Text>
      <View style={styles.chips}>
        <Chip label={`${openTasks(data.tasks)} open`} />
        <Chip label={`${data.habits.length} habits`} />
        <Chip label={`${activeProjects(data.projects)} projects`} />
      </View>

      {sections.map(section => {
        const summary = getSectionSummary(section.key, data);
        return (
          <Card key={section.key}>
            <View style={styles.row}>
              <View style={styles.icon}>
                <AppIcon name={section.icon as AppIconName} size={20} color="#36594d" fallbackLabel={section.title.slice(0, 2)} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.status}>{summary.count} · {summary.status}</Text>
                <ProgressBar value={summary.progress} />
              </View>
              <Link href={section.route as any} asChild>
                <Button title="Open" variant="secondary" />
              </Link>
            </View>
          </Card>
        );
      })}

      <Card variant="soft">
        <Text style={styles.sectionTitle}>More tools</Text>
        <View style={styles.toolGrid}>
          {tools.map(tool => (
            <Link key={tool.route} href={tool.route as any} asChild>
              <Button title={tool.label} variant="secondary" />
            </Link>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

function getSectionSummary(key: typeof sections[number]['key'], data: AppData) {
  if (key === 'tasks') {
    const open = openTasks(data.tasks);
    return { count: `${open}`, status: open ? 'next actions' : 'clear', progress: donePercent(data.tasks) };
  }
  if (key === 'habits') return { count: `${data.habits.length}`, status: 'steady practices', progress: Math.min(100, data.habits.length * 12) };
  if (key === 'projects') return { count: `${activeProjects(data.projects)}`, status: 'active outcomes', progress: averageProjectProgress(data.projects) };
  if (key === 'learning') return { count: `${data.learningTopics.length}`, status: 'topics', progress: Math.min(100, data.learningTopics.length * 18) };
  return { count: '1', status: 'choice check', progress: 40 };
}

function openTasks(tasks: Task[]) {
  return tasks.filter(task => task.status !== 'Done').length;
}

function donePercent(tasks: Task[]) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter(task => task.status === 'Done').length / tasks.length) * 100);
}

function activeProjects(projects: Project[]) {
  return projects.filter(project => project.status === 'Active').length;
}

function averageProjectProgress(projects: Project[]) {
  if (!projects.length) return 0;
  return Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f3ec' },
  content: { padding: 16, paddingTop: 56, paddingBottom: 64 },
  title: { fontSize: 34, fontWeight: '900', color: '#24322f' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#e7f0ea', borderWidth: 1, borderColor: '#d8e6de', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#24322f' },
  status: { color: '#68766f', fontWeight: '800', marginTop: 3 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }
});
