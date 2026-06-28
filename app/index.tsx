import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ChecklistRow } from '../components/ChecklistRow';
import { useAppData } from '../hooks/useAppData';
import { getJSON, setJSON } from '../utils/storage';
import { activeCharacter, alignmentScore, discretionaryTimeEstimate, enabledModules, getNextAction, openTasks, personalPrompt, preferredName, routineWithoutMaintenance, todayStorageKey, topProjects } from '../services/os';

export default function TodayScreen() {
  const { data, loading } = useAppData();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const storageKey = todayStorageKey();

  useEffect(() => { getJSON(storageKey, {}).then(setDone); }, [storageKey]);
  if (loading || !data) return null;

  const active = activeCharacter(data);
  const routine = routineWithoutMaintenance(data.routine);
  const completed = routine.filter(item => done[item.id]).length;
  const next = getNextAction(data, done);
  const projects = topProjects(data);
  const modules = enabledModules(data);
  const firstName = preferredName(data);
  const prompt = personalPrompt(data);
  const tasks = openTasks(data).slice(0, 3);

  const toggle = async (id: string) => {
    const nextDone = { ...done, [id]: !done[id] };
    setDone(nextDone);
    await setJSON(storageKey, nextDone);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>POS</Text>
        <Text style={styles.title}>Good day, {firstName}</Text>
        <Text style={styles.subtitle}>{prompt}</Text>
      </View>

      <Card variant="highlight">
        <Text style={styles.cardLabel}>Your next gentle step</Text>
        <Text style={styles.next}>{next.label}</Text>
        <Text style={styles.muted}>{next.detail} · {next.source}</Text>
        <View style={styles.row}>
          <Link href="/capture" asChild><Button title="Add a quick note" onPress={() => {}} /></Link>
          <Link href="/tasks" asChild><Button title="Edit tasks" variant="secondary" onPress={() => {}} /></Link>
        </View>
      </Card>

      <Card>
        <View style={styles.metricRow}>
          <View style={styles.metric}><Text style={styles.metricValue}>{completed}/{routine.length}</Text><Text style={styles.muted}>today's rhythm</Text></View>
          <View style={styles.metric}><Text style={styles.metricValue}>{alignmentScore(data)}%</Text><Text style={styles.muted}>alignment</Text></View>
          <View style={styles.metric}><Text style={styles.metricValue}>{discretionaryTimeEstimate(data)}</Text><Text style={styles.muted}>open time</Text></View>
        </View>
      </Card>


      <Card>
        <Text style={styles.cardTitle}>Tasks that matter</Text>
        <Text style={styles.sectionHint}>Keep this list honest and small. Edit it whenever your real life changes.</Text>
        {tasks.length ? tasks.map(task => (
          <View key={task.id} style={styles.taskRow}>
            <View style={styles.taskBadge}><Text style={styles.taskBadgeText}>{task.priority}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.projectName}>{task.title}</Text>
              <Text style={styles.muted}>{task.area}{task.estimatedMinutes ? ` · ${task.estimatedMinutes} min` : ''}</Text>
              {task.alignmentNote ? <Text style={styles.body}>{task.alignmentNote}</Text> : null}
            </View>
          </View>
        )) : <Text style={styles.body}>No open tasks. Add one when something genuinely needs your attention.</Text>}
        <View style={styles.row}><Link href="/tasks" asChild><Button title="Open tasks" onPress={() => {}} /></Link></View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Today’s essentials</Text>
        <Text style={styles.sectionHint}>Small actions count. Check off only what genuinely happened.</Text>
        {routine.map(item => <ChecklistRow key={item.id} time={item.time} title={item.title} done={!!done[item.id]} onPress={() => toggle(item.id)} />)}
      </Card>

      <Card variant="soft">
        <Text style={styles.cardTitle}>Active outcomes</Text>
        {projects.map(project => (
          <View key={project.id} style={styles.projectRow}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.body}>{project.nextAction}</Text>
            <Text style={styles.muted}>{project.progress}% · {project.why}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Your tools</Text>
        <Text style={styles.body}>{modules.map(m => m.title).join(' · ') || 'Your day is ready. You can add tools whenever they become useful.'}</Text>
        <Text style={styles.note}>POS works best when it feels light: capture what changed, edit what matters, and keep the rest out of your way.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  content: { padding: 18, paddingTop: 58, paddingBottom: 44 },
  hero: { marginBottom: 16 },
  eyebrow: { color: '#7c3aed', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.4 },
  title: { fontSize: 38, fontWeight: '900', color: '#2f2546', marginTop: 4, letterSpacing: -0.8 },
  subtitle: { fontSize: 16, color: '#6b4f3f', marginTop: 10, lineHeight: 24 },
  cardLabel: { color: '#9a3412', fontWeight: '900', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12 },
  next: { fontSize: 27, fontWeight: '900', color: '#2f2546', lineHeight: 34 },
  cardTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8, color: '#2f2546' },
  sectionHint: { color: '#7c6f64', lineHeight: 20, marginBottom: 4 },
  muted: { color: '#7c6f64', lineHeight: 20 },
  body: { fontSize: 15, color: '#4b3f38', lineHeight: 22 },
  row: { flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  metric: { flex: 1, backgroundColor: '#fff7ed', borderRadius: 18, padding: 12 },
  metricValue: { fontSize: 24, fontWeight: '900', color: '#5b21b6' },
  projectRow: { borderTopWidth: 1, borderTopColor: '#e9d5ff', paddingTop: 10, marginTop: 10 },
  projectName: { fontSize: 17, fontWeight: '900', color: '#2f2546', marginBottom: 4 },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderTopWidth: 1, borderTopColor: '#f1e4d0', paddingTop: 12, marginTop: 12 },
  taskBadge: { backgroundColor: '#fef3c7', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  taskBadgeText: { color: '#92400e', fontWeight: '900', fontSize: 12 },
  note: { color: '#7c6f64', marginTop: 10, lineHeight: 21 }
});
