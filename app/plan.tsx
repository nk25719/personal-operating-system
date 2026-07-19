import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip, ProgressBar } from '../components/Visual';
import { HeaderActions } from '../components/HeaderActions';
import { theme } from '../constants/theme';
import { useAppData } from '../hooks/useAppData';
import { AppData, Project, Task } from '../types';
import { AppIcon, AppIconName } from '../components/AppIcon';
import { evaluateTodoAlignment } from '../services/actions';

const sections = [
  { title: 'Tasks', route: '/tasks', icon: 'tasks', key: 'tasks' },
  { title: 'Habits', route: '/habits', icon: 'habits', key: 'habits' },
  { title: 'Projects', route: '/projects', icon: 'projects', key: 'projects' },
  { title: 'Learning', route: '/learning', icon: 'learning', key: 'learning' },
  { title: 'Decisions', route: '/decision', icon: 'decision', key: 'decisions' }
] as const;

const tools = [
  { label: 'Profile', route: '/profile' },
  { label: 'Settings', route: '/settings' },
  { label: 'AI', route: '/ai' },
  { label: 'Health', route: '/health' },
  { label: 'Women Health', route: '/women-health' },
  { label: 'Environment', route: '/environment' },
  { label: 'Relationships', route: '/relationships' },
  { label: 'Life Clock', route: '/life-clock' },
  { label: 'Builder', route: '/builder' },
  { label: 'Spaces', route: '/modules' }
] as const;

export default function PlanScreen() {
  const { data, updateData, loading } = useAppData();
  if (loading || !data) return null;
  const grouped = groupTasksByAlignment(data);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Plan</Text>
        <HeaderActions />
      </View>
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
                <AppIcon name={section.icon as AppIconName} size={20} color={theme.colors.primary} fallbackLabel={section.title.slice(0, 2)} />
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
        <Text style={styles.sectionTitle}>Check your list</Text>
        <TaskGroup title="Aligned with current identity" tasks={grouped.aligned} data={data} updateData={updateData} />
        <TaskGroup title="Necessary maintenance" tasks={grouped.maintenance} data={data} updateData={updateData} />
        <TaskGroup title="Maybe later" tasks={grouped.maybeLater} data={data} updateData={updateData} />
      </Card>

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

function TaskGroup({ title, tasks, data, updateData }: { title: string; tasks: Task[]; data: AppData; updateData: ReturnType<typeof useAppData>['updateData'] }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {tasks.length ? tasks.slice(0, 3).map(task => {
        const alignment = evaluateTodoAlignment(task, data);
        return (
          <View key={task.id} style={styles.taskReview}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.status}>{alignment.reason}</Text>
            <View style={styles.reviewActions}>
              <Button title="Keep" variant="secondary" onPress={() => updateData(current => current)} />
              <Button title="Rewrite" variant="secondary" onPress={() => updateData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, title: alignment.suggestedRewrite ?? item.title } : item) }))} />
              <Button title="Move later" variant="secondary" onPress={() => updateData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, status: 'skipped' } : item) }))} />
              <Button title="Delete" variant="secondary" onPress={() => updateData(current => ({ ...current, tasks: current.tasks.filter(item => item.id !== task.id) }))} />
            </View>
          </View>
        );
      }) : <Text style={styles.empty}>Nothing here.</Text>}
    </View>
  );
}

function groupTasksByAlignment(data: AppData) {
  return data.tasks.reduce((groups, task) => {
    const alignment = evaluateTodoAlignment(task, data);
    if (alignment.category === 'aligned') groups.aligned.push(task);
    else if (alignment.category === 'maintenance') groups.maintenance.push(task);
    else groups.maybeLater.push(task);
    return groups;
  }, { aligned: [] as Task[], maintenance: [] as Task[], maybeLater: [] as Task[] });
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
  return tasks.filter(task => task.status !== 'Done' && task.status !== 'done').length;
}

function donePercent(tasks: Task[]) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter(task => task.status === 'Done' || task.status === 'done').length / tasks.length) * 100);
}

function activeProjects(projects: Project[]) {
  return projects.filter(project => project.status === 'Active').length;
}

function averageProjectProgress(projects: Project[]) {
  if (!projects.length) return 0;
  return Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center', padding: theme.spacing.screen, paddingTop: 48, paddingBottom: 64 },
  topRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, minWidth: 0, fontSize: 30, fontWeight: '900', color: theme.colors.text, lineHeight: 34 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: theme.colors.text },
  status: { color: theme.colors.textMuted, fontWeight: '800', marginTop: 3 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  group: { marginTop: 14 },
  groupTitle: { color: theme.colors.primary, fontWeight: '900', marginBottom: 8 },
  taskReview: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10, marginTop: 10 },
  taskTitle: { color: theme.colors.text, fontWeight: '900', lineHeight: 20 },
  reviewActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  empty: { color: theme.colors.textMuted, lineHeight: 20 }
});
