import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';
import { LearningTopic } from '../types';

const newTopic = (): LearningTopic => ({ id: `topic-${Date.now()}`, name: 'New topic', day: 'Any day', nextAction: 'Choose next lesson', resources: [] });

export default function LearningScreen() {
  const { data, setData, loading } = useAppData();
  if (loading || !data) return null;
  const update = (id: string, patch: Partial<LearningTopic>) => setData({ ...data, learningTopics: data.learningTopics.map(t => t.id === id ? { ...t, ...patch } : t) });
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Learning Plan</Text>
      <Text style={styles.subtitle}>Editable learning map for workday pockets and weekend deep work.</Text>
      <Button title="Add topic" onPress={() => setData({ ...data, learningTopics: [...data.learningTopics, newTopic()] })} />
      {data.learningTopics.map(t => (
        <Card key={t.id}>
          <Field label="Topic" value={t.name} onChangeText={v => update(t.id, { name: v })} />
          <Field label="Day / cadence" value={t.day} onChangeText={v => update(t.id, { day: v })} />
          <Field label="Next action" value={t.nextAction} onChangeText={v => update(t.id, { nextAction: v })} />
          <Field label="Resources / subtopics, comma separated" value={t.resources.join(', ')} onChangeText={v => update(t.id, { resources: v.split(',').map(x => x.trim()).filter(Boolean) })} multiline />
          <Button title="Delete" onPress={() => setData({ ...data, learningTopics: data.learningTopics.filter(x => x.id !== t.id) })} />
        </Card>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f2f2f7' }, content: { padding: 18, paddingTop: 64 }, title: { fontSize: 32, fontWeight: '800' }, subtitle: { color: '#6b7280', marginBottom: 16, marginTop: 6 } });
