import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAppData } from '../hooks/useAppData';
import { ModuleConfig } from '../types';

export default function ModulesScreen() {
  const { data, setData, loading } = useAppData();
  if (loading || !data) return null;

  const toggle = (module: ModuleConfig) => {
    setData({ ...data, modules: data.modules.map(m => m.key === module.key ? { ...m, enabled: !m.enabled } : m) });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Modules</Text>
      <Text style={styles.subtitle}>Keep Today simple. Turn extra features on only when they answer a real question.</Text>
      <Card>
        <Text style={styles.cardTitle}>Core principle</Text>
        <Text style={styles.body}>The user should spend less than two minutes per day maintaining the POS. Modules should support Today, not compete with it.</Text>
      </Card>
      {(data.modules ?? []).map(module => (
        <Card key={module.key}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.body}>{module.purpose}</Text>
              <Text style={styles.status}>{module.enabled ? 'Enabled' : 'Hidden from daily use'}</Text>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <Button title={module.enabled ? 'Disable' : 'Enable'} onPress={() => toggle(module)} />
            <Link href={module.route as any} asChild><Button title="Open" onPress={() => {}} /></Link>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { padding: 18, paddingTop: 64, paddingBottom: 40 },
  title: { fontSize: 34, fontWeight: '900', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 6, marginBottom: 16, lineHeight: 21 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  moduleTitle: { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 6 },
  body: { fontSize: 15, color: '#374151', lineHeight: 22 },
  status: { color: '#6b7280', marginTop: 6, fontWeight: '700' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' }
});
