import { StyleSheet, Text, View } from 'react-native';
import { Project } from '../types';

export function ProjectBrief({ project }: { project: Project }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>{project.name}</Text>
        <Text style={styles.progress}>{project.progress}%</Text>
      </View>
      <Text style={styles.body}>{project.nextAction}</Text>
      <Text style={styles.muted}>{project.why}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fffdf8', borderRadius: 18, borderWidth: 1, borderColor: '#dde7df', padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '900', color: '#24322f' },
  progress: { color: '#5f7f71', fontWeight: '800' },
  body: { fontSize: 14, lineHeight: 20, color: '#3f4a45' },
  muted: { marginTop: 4, fontSize: 13, lineHeight: 18, color: '#68766f' }
});
