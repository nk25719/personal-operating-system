import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ChecklistRow } from '../components/ChecklistRow';
import { useAppData } from '../hooks/useAppData';
import { getJSON, setJSON } from '../utils/storage';
import { activeCharacter, alignmentScore, discretionaryTimeEstimate, enabledModules, getNextAction, routineWithoutMaintenance, todayStorageKey, topProjects } from '../services/os';

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

  const toggle = async (id: string) => {
    const nextDone = { ...done, [id]: !done[id] };
    setDone(nextDone);
    await setJSON(storageKey, nextDone);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Personal Operating System</Text>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.subtitle}>{active.missionQuestion}</Text>

      <Card>
        <Text style={styles.cardLabel}>Next action</Text>
        <Text style={styles.next}>{next.label}</Text>
        <Text style={styles.muted}>{next.detail} · {next.source}</Text>
        <View style={styles.row}>
          <Link href="/capture" asChild><Button title="Capture thought" onPress={() => {}} /></Link>
          <Link href="/modules" asChild><Button title="Modules" onPress={() => {}} /></Link>
        </View>
      </Card>

      <Card>
        <View style={styles.metricRow}>
          <View style={styles.metric}><Text style={styles.metricValue}>{completed}/{routine.length}</Text><Text style={styles.muted}>routine</Text></View>
          <View style={styles.metric}><Text style={styles.metricValue}>{alignmentScore(data)}%</Text><Text style={styles.muted}>alignment</Text></View>
          <View style={styles.metric}><Text style={styles.metricValue}>{discretionaryTimeEstimate(data)}</Text><Text style={styles.muted}>free time</Text></View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Essential today</Text>
        {routine.map(item => <ChecklistRow key={item.id} time={item.time} title={item.title} done={!!done[item.id]} onPress={() => toggle(item.id)} />)}
      </Card>

      <Card>
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
        <Text style={styles.cardTitle}>Enabled modules</Text>
        <Text style={styles.body}>{modules.map(m => m.title).join(' · ') || 'Only Today is enabled.'}</Text>
        <Text style={styles.note}>Core rule: maintain this app in under two minutes. Use Capture when something changes; let modules stay optional.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 18, paddingTop: 64, paddingBottom: 40 },
  eyebrow: { color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 38, fontWeight: '900', color: '#111827', marginTop: 4 },
  subtitle: { fontSize: 15, color: '#4b5563', marginTop: 8, marginBottom: 18, lineHeight: 22 },
  cardLabel: { color: '#6b7280', fontWeight: '700', marginBottom: 6 },
  next: { fontSize: 26, fontWeight: '900', color: '#111827', lineHeight: 32 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  muted: { color: '#6b7280', lineHeight: 20 },
  body: { fontSize: 15, color: '#374151', lineHeight: 22 },
  row: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metric: { flex: 1 },
  metricValue: { fontSize: 24, fontWeight: '900', color: '#111827' },
  projectRow: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10, marginTop: 10 },
  projectName: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 4 },
  note: { color: '#6b7280', marginTop: 10, lineHeight: 20 }
});
