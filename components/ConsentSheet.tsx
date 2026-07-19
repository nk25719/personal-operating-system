import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

export function ConsentSheet({ title, summary, onAllow, onDecline }: { title: string; summary: string; onAllow?: () => void; onDecline?: () => void }) {
  const [choice, setChoice] = useState<'allow' | 'decline' | null>(null);

  const handleAllow = () => {
    setChoice('allow');
    onAllow?.();
  };

  const handleDecline = () => {
    setChoice('decline');
    onDecline?.();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Privacy-first consent</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{summary}</Text>
      <Text style={styles.muted}>This asks only for what is clearly useful, stays local when possible, and can be revoked later.</Text>
      <View style={styles.actions}>
        <Button title={choice === 'allow' ? 'Enabled' : 'Allow'} variant="primary" onPress={handleAllow} />
        <Button title={choice === 'decline' ? 'Declined' : 'Not now'} variant="secondary" onPress={handleDecline} />
      </View>
      {choice ? <Text style={styles.status}>{choice === 'allow' ? 'You enabled a light, privacy-first option.' : 'You chose to keep this off for now.'}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#f6f3ec', borderRadius: 24, borderWidth: 1, borderColor: '#eadfce', padding: 18, marginBottom: 14 },
  eyebrow: { color: '#9a6b4f', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '900', color: '#24322f', marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 22, color: '#3f4a45' },
  muted: { marginTop: 8, fontSize: 14, lineHeight: 20, color: '#68766f' },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 12 },
  status: { marginTop: 8, fontSize: 14, color: '#7b5b3f', fontWeight: '700' }
});
