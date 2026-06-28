import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { Task } from '../types';

const emptyTask = (): Task => ({
  id: `task-${Date.now()}`,
  title: '',
  notes: '',
  area: 'Personal',
  status: 'Todo',
  priority: 'Medium',
  estimatedMinutes: 20,
  alignmentNote: ''
});

export default function TasksScreen() {
  const { data, setData, loading } = useAppData();
  const [draft, setDraft] = useState<Task>(emptyTask());
  if (loading || !data) return null;

  const updateTask = (id: string, patch: Partial<Task>) => {
    setData({ ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, ...patch } : t) });
  };

  const addTask = () => {
    if (!draft.title.trim()) return;
    setData({ ...data, tasks: [{ ...draft, title: draft.title.trim() }, ...data.tasks] });
    setDraft(emptyTask());
  };

  const removeTask = (id: string) => setData({ ...data, tasks: data.tasks.filter(t => t.id !== id) });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tasks</Text>
      <Text style={styles.subtitle}>A visible place for the commitments that need your attention. Keep it small, real, and useful.</Text>

      <Card variant="highlight">
        <Text style={styles.cardTitle}>Add a task</Text>
        <Field label="What needs to be done?" value={draft.title} onChangeText={v => setDraft({ ...draft, title: v })} placeholder="Write the next paper section" />
        <Field label="Why does it matter?" value={draft.alignmentNote ?? ''} onChangeText={v => setDraft({ ...draft, alignmentNote: v })} placeholder="This moves my research identity forward" multiline />
        <Field label="Area" value={draft.area} onChangeText={v => setDraft({ ...draft, area: v as Task['area'] })} placeholder="Personal / Work / Project / Learning / Health / Home / Service" />
        <Field label="Priority" value={draft.priority} onChangeText={v => setDraft({ ...draft, priority: v as Task['priority'] })} placeholder="Low / Medium / High" />
        <Field label="Estimated minutes" value={String(draft.estimatedMinutes ?? '')} onChangeText={v => setDraft({ ...draft, estimatedMinutes: Number(v) || undefined })} placeholder="20" />
        <Button title="Add task" onPress={addTask} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Open tasks</Text>
        {data.tasks.length ? data.tasks.map(task => (
          <View key={task.id} style={styles.taskCard}>
            <Field label="Title" value={task.title} onChangeText={v => updateTask(task.id, { title: v })} />
            <Field label="Alignment note" value={task.alignmentNote ?? ''} onChangeText={v => updateTask(task.id, { alignmentNote: v })} multiline />
            <View style={styles.row}>
              <Button title={task.status === 'Done' ? 'Mark todo' : 'Mark done'} onPress={() => updateTask(task.id, { status: task.status === 'Done' ? 'Todo' : 'Done' })} />
              <Button title="Remove" variant="secondary" onPress={() => removeTask(task.id)} />
            </View>
            <Text style={styles.meta}>{task.area} · {task.priority} priority{task.estimatedMinutes ? ` · ${task.estimatedMinutes} min` : ''}</Text>
          </View>
        )) : <Text style={styles.body}>No tasks yet. Add only what genuinely needs a place to live.</Text>}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  content: { padding: 18, paddingTop: 58, paddingBottom: 44 },
  title: { fontSize: 36, fontWeight: '900', color: '#2f2546' },
  subtitle: { color: '#6b4f3f', marginTop: 8, marginBottom: 16, lineHeight: 22 },
  cardTitle: { fontSize: 22, fontWeight: '900', marginBottom: 12, color: '#2f2546' },
  taskCard: { borderTopWidth: 1, borderTopColor: '#f1e4d0', paddingTop: 14, marginTop: 14 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  meta: { marginTop: 8, color: '#7c6f64', fontWeight: '700' },
  body: { color: '#4b3f38', lineHeight: 22 }
});
