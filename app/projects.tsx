import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { Details, ProgressBar, StatCard } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { Project } from '../types';

const newProject = (): Project => ({ id: `project-${Date.now()}`, name: 'New project', area: 'Life', status: 'Active', nextAction: 'Define next action', why: 'Aligned with identity', progress: 0 });

export default function ProjectsScreen() {
  const { data, updateData, loading } = useAppData();
  if (loading || !data) return null;
  const update = (id: string, patch: Partial<Project>) => updateData(current => ({ ...current, projects: current.projects.map(p => p.id === id ? { ...p, ...patch } : p) }));
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Projects" />
      <Card variant="highlight">
        <View style={styles.metricRow}>
          <StatCard label="Active" value={String(data.projects.filter(project => project.status === 'Active').length)} />
          <StatCard label="Average" value={`${averageProgress(data.projects)}%`} progress={averageProgress(data.projects)} />
        </View>
      </Card>
      <Button title="Add project" onPress={() => updateData(current => ({ ...current, projects: [...current.projects, newProject()] }))} />
      {!data.projects.length ? (
        <Card>
          <Text style={styles.cardTitle}>Name one project for this season.</Text>
          <Text style={styles.body}>It can be small. Choose the next visible step.</Text>
          <View style={styles.row}>
            <Button title="Add one project" variant="secondary" onPress={() => updateData(current => ({ ...current, projects: [...current.projects, newProject()] }))} />
          </View>
        </Card>
      ) : null}
      {data.projects.map(p => (
        <Card key={p.id}>
          <Field label="Project" value={p.name} onChangeText={v => update(p.id, { name: v })} />
          <View style={styles.two}><View style={styles.flex}><Field label="Area" value={p.area} onChangeText={v => update(p.id, { area: v })} /></View><View style={styles.flex}><Field label="Status" value={p.status} onChangeText={v => update(p.id, { status: (v as Project['status']) || 'Active' })} /></View></View>
          <Field label="Progress 0-100" value={String(p.progress)} onChangeText={v => update(p.id, { progress: Math.max(0, Math.min(100, Number(v) || 0)) })} />
          <ProgressBar value={p.progress} />
          <Field label="Next action" value={p.nextAction} onChangeText={v => update(p.id, { nextAction: v })} />
          <Details title="Why">
            <Field label="Why" value={p.why} onChangeText={v => update(p.id, { why: v })} multiline />
            <Button title="Delete" variant="secondary" onPress={() => updateData(current => ({ ...current, projects: current.projects.filter(x => x.id !== p.id) }))} />
          </Details>
        </Card>
      ))}
    </ScrollView>
  );
}
function averageProgress(projects: Project[]) {
  if (!projects.length) return 0;
  return Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length);
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f4f1ea' }, content: { padding: 18, paddingTop: 64 }, title: { fontSize: 32, fontWeight: '800', marginBottom: 16, color: '#24322f' }, cardTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8, color: '#24322f' }, body: { color: '#3f4a45', lineHeight: 22 }, metricRow: { flexDirection: 'row', gap: 10 }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }, two: { flexDirection: 'row', gap: 10 }, flex: { flex: 1 } });
