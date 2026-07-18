import { StyleSheet, Text, View } from 'react-native';
import { Character } from '../types';

export function IdentityCard({ character }: { character: Character }) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Identity</Text>
      <Text style={styles.title}>{character.name}</Text>
      <Text style={styles.body}>{character.identity}</Text>
      {character.desiredPerson ? <Text style={styles.muted}>You are building toward: {character.desiredPerson}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#eef5f1', borderRadius: 24, borderWidth: 1, borderColor: '#d8e6de', padding: 18, marginBottom: 14 },
  eyebrow: { color: '#5f7f71', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '900', color: '#24322f', marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 22, color: '#3f4a45' },
  muted: { marginTop: 8, fontSize: 14, lineHeight: 20, color: '#68766f' }
});
