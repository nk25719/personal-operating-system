import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
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
  const { data, updateData, loading } = useAppData();
  const [draft, setDraft] = useState<Task>(emptyTask());
  if (loading || !data) return null;

  const updateTask = (id: string, patch: Partial<Task>) => {
    updateData(current => ({ ...current, tasks: current.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }));
  };

  const addTask = () => {
    if (!draft.title.trim()) return;
    updateData(
      current => ({ ...current, tasks: [{ ...draft, title: draft.title.trim() }, ...current.tasks] }),
      { type: 'task.created', payload: { taskId: draft.id, title: draft.title.trim(), area: draft.area } }
    );
    setDraft(emptyTask());
  };

  const removeTask = (id: string) => updateData(current => ({ ...current, tasks: current.tasks.filter(t => t.id !== id) }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Tasks" />
      <Text style={styles.subtitle}>Keep it honest and small.</Text>

      <Card variant="highlight">
        <Text style={styles.cardTitle}>Add action</Text>
        <Field label="What?" value={draft.title} onChangeText={v => setDraft({ ...draft, title: v })} placeholder="Write the paper section" />
        <Field label="Why?" value={draft.alignmentNote ?? ''} onChangeText={v => setDraft({ ...draft, alignmentNote: v })} placeholder="Moves my research forward" multiline />
        <Field label="Area" value={draft.area} onChangeText={v => setDraft({ ...draft, area: v as Task['area'] })} placeholder="Personal/Work/Project/Learning/Health" />
        <Field label="Priority" value={draft.priority} onChangeText={v => setDraft({ ...draft, priority: v as Task['priority'] })} placeholder="Low/Medium/High" />
        <Field label="Minutes" value={String(draft.estimatedMinutes ?? '')} onChangeText={v => setDraft({ ...draft, estimatedMinutes: Number(v) || undefined })} placeholder="20" />
        <Button title="Add" onPress={addTask} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Open</Text>
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
        )) : <Text style={styles.body}>None yet.</Text>}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f3ec' },
  content: { padding: 16, paddingTop: 56, paddingBottom: 64 },
  title: { fontSize: 32, fontWeight: '900', color: '#24322f', lineHeight: 36 },
  subtitle: { color: '#68766f', marginTop: 8, marginBottom: 16, lineHeight: 21, fontSize: 15 },
  cardTitle: { fontSize: 20, fontWeight: '900', marginBottom: 12, color: '#24322f' },
  taskCard: { borderTopWidth: 1, borderTopColor: '#dde7df', paddingTop: 14, marginTop: 14 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  meta: { marginTop: 8, color: '#68766f', fontWeight: '700' },
  body: { color: '#3f4a45', lineHeight: 22 }
});
