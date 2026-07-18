import { StyleSheet, Text, View } from 'react-native';

export function InterventionBanner({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#f3eee6', borderRadius: 18, borderWidth: 1, borderColor: '#eadfce', padding: 14, marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '900', color: '#7b5b3f', marginBottom: 4 },
  body: { fontSize: 14, lineHeight: 20, color: '#7b5b3f' }
});
