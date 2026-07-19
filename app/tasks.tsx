import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { alignmentLabel, createRepeatingAction, createTaskFromInput, evaluateTodoAlignment, parseBulkActions } from '../services/actions';
import { DayOfWeek, ModuleKey, Task } from '../types';
import { theme } from '../constants/theme';

type Mode = 'one' | 'bulk' | 'scheduled' | 'repeat';
const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const moduleOptions: ModuleKey[] = ['habits', 'projects', 'learning', 'health', 'environment', 'decision'];

export default function TasksScreen() {
  const { data, updateData, loading } = useAppData();
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode = params.mode === 'bulk' ? 'bulk' : params.mode === 'scheduled' ? 'scheduled' : params.mode === 'repeat' ? 'repeat' : 'one';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [duration, setDuration] = useState('');
  const [moduleId, setModuleId] = useState<ModuleKey | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>();
  const [bulkText, setBulkText] = useState('');
  const [bulkItems, setBulkItems] = useState<string[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState('3');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [minimum, setMinimum] = useState('');
  const [message, setMessage] = useState('');

  const parsedBulk = useMemo(() => parseBulkActions(bulkText), [bulkText]);
  if (loading || !data) return null;

  const saveOne = async () => {
    if (!title.trim()) return setMessage('Add a title first.');
    const task = createTaskFromInput({ title, notes, scheduledTime, dueDate, durationMinutes: toNumber(duration), moduleId, projectId });
    await updateData(
      current => ({ ...current, tasks: [task, ...current.tasks] }),
      { type: 'task.created', payload: { taskId: task.id, title: task.title, moduleId, projectId } }
    );
    clearDraft();
    setMessage('Action added.');
  };

  const previewBulk = () => {
    setBulkItems(parsedBulk);
    setMessage(parsedBulk.length ? `We found ${parsedBulk.length} actions.` : 'Paste one action per line.');
  };

  const saveBulk = async () => {
    const items = bulkItems.length ? bulkItems : parsedBulk;
    if (!items.length) return setMessage('Paste one action per line.');
    const tasks = items.map((item, index) => createTaskFromInput({ title: item, notes, scheduledTime, dueDate, durationMinutes: toNumber(duration), moduleId, projectId }, Date.now() + index));
    await updateData(
      current => ({ ...current, tasks: [...tasks, ...current.tasks] }),
      { type: 'task.bulk_created', payload: { count: tasks.length, moduleId, projectId } }
    );
    setBulkText('');
    setBulkItems([]);
    setMessage(`${tasks.length} actions added.`);
  };

  const saveRepeating = async () => {
    if (!title.trim()) return setMessage('Add a title first.');
    const { habit, routine } = createRepeatingAction({
      title,
      notes,
      scheduledTime,
      durationMinutes: toNumber(duration),
      moduleId,
      projectId,
      timesPerWeek: toNumber(timesPerWeek) ?? 1,
      daysOfWeek: selectedDays.length ? selectedDays : undefined,
      minimum
    });
    await updateData(
      current => ({ ...current, habits: [habit, ...current.habits], routine: [routine, ...current.routine] }),
      { type: 'habit.created', payload: { habitId: habit.id, routineId: routine.id, timesPerWeek: habit.repeat?.timesPerWeek } }
    );
    await updateData(
      current => current,
      { type: 'routine.created', payload: { routineId: routine.id, habitId: habit.id } }
    );
    clearDraft();
    setMessage('Repeating action added.');
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    updateData(current => ({ ...current, tasks: current.tasks.map(task => task.id === id ? { ...task, ...patch } : task) }));
  };

  const removeTask = (id: string) => updateData(current => ({ ...current, tasks: current.tasks.filter(task => task.id !== id) }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Tasks" />
      <Text style={styles.subtitle}>Create one step, a list, or a repeating action.</Text>
      {message ? <Card><Text style={styles.message}>{message}</Text></Card> : null}

      <Card variant="highlight">
        <Text style={styles.cardTitle}>Add action</Text>
        <View style={styles.row}>
          <Button title="One" variant={mode === 'one' ? 'primary' : 'secondary'} onPress={() => setMode('one')} />
          <Button title="Paste list" variant={mode === 'bulk' ? 'primary' : 'secondary'} onPress={() => setMode('bulk')} />
          <Button title="Schedule" variant={mode === 'scheduled' ? 'primary' : 'secondary'} onPress={() => setMode('scheduled')} />
          <Button title="Repeat" variant={mode === 'repeat' ? 'primary' : 'secondary'} onPress={() => setMode('repeat')} />
        </View>

        {mode === 'one' ? (
          <>
            <Field label="Title" value={title} onChangeText={setTitle} placeholder="Call the clinic" />
            {title.trim() ? <DraftAlignment title={title} notes={notes} data={data} /> : null}
            <SharedFields data={data} scheduledTime="" setScheduledTime={setScheduledTime} dueDate={dueDate} setDueDate={setDueDate} duration={duration} setDuration={setDuration} moduleId={moduleId} setModuleId={setModuleId} projectId={projectId} setProjectId={setProjectId} hideTime />
            <Field label="Notes optional" value={notes} onChangeText={setNotes} multiline />
            <Button title="Add action" onPress={saveOne} />
          </>
        ) : null}

        {mode === 'scheduled' ? (
          <>
            <Field label="Title" value={title} onChangeText={setTitle} placeholder="German practice" />
            {title.trim() ? <DraftAlignment title={title} notes={notes} data={data} /> : null}
            <SharedFields data={data} scheduledTime={scheduledTime} setScheduledTime={setScheduledTime} dueDate={dueDate} setDueDate={setDueDate} duration={duration} setDuration={setDuration} moduleId={moduleId} setModuleId={setModuleId} projectId={projectId} setProjectId={setProjectId} />
            <Field label="Notes optional" value={notes} onChangeText={setNotes} multiline />
            <Button title="Schedule action" onPress={saveOne} />
          </>
        ) : null}

        {mode === 'bulk' ? (
          <>
            <Field label="Paste a list" value={bulkText} onChangeText={setBulkText} multiline placeholder={'- Email Sam\n1. Prepare slides\n* Buy groceries'} />
            <SharedFields data={data} scheduledTime={scheduledTime} setScheduledTime={setScheduledTime} dueDate={dueDate} setDueDate={setDueDate} duration={duration} setDuration={setDuration} moduleId={moduleId} setModuleId={setModuleId} projectId={projectId} setProjectId={setProjectId} />
            <View style={styles.row}>
              <Button title="Preview" variant="secondary" onPress={previewBulk} />
              <Button title="Save list" onPress={saveBulk} />
            </View>
            {(bulkItems.length ? bulkItems : parsedBulk).length ? <Text style={styles.preview}>We found {(bulkItems.length ? bulkItems : parsedBulk).length} actions</Text> : null}
            {(bulkItems.length ? bulkItems : parsedBulk).slice(0, 6).map(item => <DraftAlignment key={`align-${item}`} title={item} notes={notes} data={data} />)}
            {bulkItems.map((item, index) => (
              <View key={`${item}-${index}`} style={styles.previewRow}>
                <Field label={`Action ${index + 1}`} value={item} onChangeText={value => setBulkItems(current => current.map((entry, entryIndex) => entryIndex === index ? value : entry))} />
                <Button title="Delete" variant="secondary" onPress={() => setBulkItems(current => current.filter((_, entryIndex) => entryIndex !== index))} />
              </View>
            ))}
          </>
        ) : null}

        {mode === 'repeat' ? (
          <>
            <Field label="Title" value={title} onChangeText={setTitle} placeholder="Stretch" />
            <Field label="How many times per week" value={timesPerWeek} onChangeText={setTimesPerWeek} placeholder="3" />
            <Field label="Minimum version optional" value={minimum} onChangeText={setMinimum} placeholder="2 minutes" />
            <SharedFields data={data} scheduledTime={scheduledTime} setScheduledTime={setScheduledTime} dueDate={dueDate} setDueDate={setDueDate} duration={duration} setDuration={setDuration} moduleId={moduleId} setModuleId={setModuleId} projectId={projectId} setProjectId={setProjectId} />
            <Text style={styles.label}>Preferred days</Text>
            <View style={styles.row}>
              {days.map(day => <Button key={day} title={day} variant={selectedDays.includes(day) ? 'primary' : 'secondary'} onPress={() => setSelectedDays(current => current.includes(day) ? current.filter(item => item !== day) : [...current, day])} />)}
            </View>
            <Button title="Save repeating action" onPress={saveRepeating} />
          </>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Open</Text>
        {data.tasks.length ? data.tasks.map(task => (
          <View key={task.id} style={styles.taskCard}>
            <AlignmentCue task={task} data={data} />
            <Field label="Title" value={task.title} onChangeText={value => updateTask(task.id, { title: value })} />
            <View style={styles.row}>
              <Button title={isDone(task) ? 'Mark open' : 'Done'} onPress={() => updateTask(task.id, { status: isDone(task) ? 'open' : 'done', completedAt: isDone(task) ? undefined : new Date().toISOString() })} />
              <Button title="Remove" variant="secondary" onPress={() => removeTask(task.id)} />
            </View>
            <Text style={styles.meta}>{task.type ?? 'todo'} · {task.priority} priority{task.scheduledTime ? ` · ${task.scheduledTime}` : ''}{task.dueDate ? ` · due ${task.dueDate}` : ''}{task.durationMinutes ? ` · ${task.durationMinutes} min` : ''}</Text>
          </View>
        )) : <Text style={styles.body}>None yet.</Text>}
      </Card>
    </ScrollView>
  );

  function clearDraft() {
    setTitle('');
    setNotes('');
    setScheduledTime('');
    setDueDate('');
    setDuration('');
    setMinimum('');
    setSelectedDays([]);
  }
}

function DraftAlignment({ title, notes, data }: { title: string; notes?: string; data: NonNullable<ReturnType<typeof useAppData>['data']> }) {
  const alignment = evaluateTodoAlignment({ title, notes, area: 'Personal' }, data);
  return (
    <View style={styles.alignment}>
      <Text style={styles.alignmentLabel}>{alignmentLabel(alignment)}</Text>
      <Text style={styles.alignmentReason}>{alignment.reason}</Text>
      {alignment.suggestedRewrite ? <Text style={styles.alignmentReason}>Suggested: {alignment.suggestedRewrite}</Text> : null}
    </View>
  );
}

function SharedFields({ data, scheduledTime, setScheduledTime, dueDate, setDueDate, duration, setDuration, moduleId, setModuleId, projectId, setProjectId, hideTime = false }: {
  data: NonNullable<ReturnType<typeof useAppData>['data']>;
  scheduledTime: string;
  setScheduledTime: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  moduleId?: ModuleKey;
  setModuleId: (value: ModuleKey | undefined) => void;
  projectId?: string;
  setProjectId: (value: string | undefined) => void;
  hideTime?: boolean;
}) {
  return (
    <>
      {hideTime ? null : <Field label="Time optional" value={scheduledTime} onChangeText={setScheduledTime} placeholder="09:30" />}
      <Field label="Due date optional" value={dueDate} onChangeText={setDueDate} placeholder="2026-07-19" />
      <Field label="Duration optional" value={duration} onChangeText={setDuration} placeholder="20" />
      <Text style={styles.label}>Module optional</Text>
      <View style={styles.row}>{moduleOptions.map(option => <Button key={option} title={option} variant={moduleId === option ? 'primary' : 'secondary'} onPress={() => setModuleId(moduleId === option ? undefined : option)} />)}</View>
      {data.projects.length ? (
        <>
          <Text style={styles.label}>Project optional</Text>
          <View style={styles.row}>{data.projects.map(project => <Button key={project.id} title={project.name} variant={projectId === project.id ? 'primary' : 'secondary'} onPress={() => setProjectId(projectId === project.id ? undefined : project.id)} />)}</View>
        </>
      ) : null}
    </>
  );
}

function AlignmentCue({ task, data }: { task: Task; data: NonNullable<ReturnType<typeof useAppData>['data']> }) {
  const alignment = evaluateTodoAlignment(task, data);
  return (
    <View style={styles.alignment}>
      <Text style={styles.alignmentLabel}>{alignmentLabel(alignment)}</Text>
      <Text style={styles.alignmentReason}>{alignment.reason}</Text>
    </View>
  );
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function isDone(task: Task) {
  return task.status === 'done' || task.status === 'Done';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center', padding: theme.spacing.screen, paddingTop: 48, paddingBottom: 64 },
  subtitle: { color: theme.colors.textMuted, marginTop: 8, marginBottom: 16, lineHeight: 21, fontSize: 15 },
  cardTitle: { fontSize: 20, fontWeight: '900', marginBottom: 12, color: theme.colors.text },
  taskCard: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 14, marginTop: 14 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12, minWidth: 0 },
  meta: { marginTop: 8, color: theme.colors.textMuted, fontWeight: '700' },
  body: { color: theme.colors.text, lineHeight: 22 },
  message: { color: theme.colors.primary, fontWeight: '800', lineHeight: 20 },
  label: { color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12, marginBottom: 8 },
  preview: { color: theme.colors.primary, fontWeight: '900', marginBottom: 10 },
  previewRow: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10, marginTop: 10 },
  alignment: { backgroundColor: theme.colors.primarySoft, borderRadius: 12, padding: 10, marginBottom: 10 },
  alignmentLabel: { color: theme.colors.primary, fontWeight: '900' },
  alignmentReason: { color: theme.colors.textMuted, marginTop: 3, lineHeight: 18 }
});
