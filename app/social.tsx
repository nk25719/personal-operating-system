import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { Field } from '../components/Field';
import { useAppData } from '../hooks/useAppData';

export default function SocialScreen() {
  const { data, updateData, loading } = useAppData();
  const [email, setEmail] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  if (loading || !data) return null;

  const connectAccount = () => {
    if (!email.trim()) return;
    const account = {
      id: `account-${Date.now()}`,
      provider: 'gmail' as const,
      email: email.trim(),
      connectedAt: new Date().toISOString(),
      visible: true
    };
    updateData(current => ({ ...current, connectedAccounts: [account, ...(current.connectedAccounts ?? [])] }));
    setEmail('');
  };

  const inviteFriend = () => {
    if (!friendEmail.trim()) return;
    const connection = {
      id: `friend-${Date.now()}`,
      name: friendEmail.trim().split('@')[0],
      email: friendEmail.trim(),
      status: 'pending' as const,
      sharedHabits: []
    };
    updateData(current => ({ ...current, friends: [connection, ...(current.friends ?? [])] }));
    setFriendEmail('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SecondaryHeader title="Care" />
      <Text style={styles.subtitle}>Small-scale accountability only. No feeds, follower counts, leaderboards, or public streaks.</Text>

      <Card variant="highlight">
        <Text style={styles.cardTitle}>Draft a future account link</Text>
        <Text style={styles.muted}>This MVP stores the address locally. Real Gmail access should use explicit OAuth scopes and a revocable integration ledger.</Text>
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="name@gmail.com" />
        <Button title="Save locally" onPress={connectAccount} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Connected accounts</Text>
        {(data.connectedAccounts ?? []).length ? data.connectedAccounts.map(account => (
          <View key={account.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.body}>{account.email}</Text>
              <Text style={styles.muted}>Google account · {account.visible ? 'visible to selected friends' : 'private'}</Text>
            </View>
          </View>
        )) : <Text style={styles.body}>No accounts connected yet.</Text>}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Invite a friend</Text>
        <Text style={styles.muted}>Use this as a private accountability placeholder. No message is sent yet.</Text>
        <Field label="Friend email" value={friendEmail} onChangeText={setFriendEmail} placeholder="friend@example.com" />
        <Button title="Add accountability draft" onPress={inviteFriend} />
        {(data.friends ?? []).length ? data.friends.map(friend => (
          <View key={friend.id} style={styles.friendRow}>
            <Text style={styles.body}>{friend.name}</Text>
            <Text style={styles.muted}>{friend.status} · {friend.sharedHabits.length ? friend.sharedHabits.join(', ') : 'No habits shared yet'}</Text>
          </View>
        )) : <Text style={styles.body}>No invitations yet.</Text>}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f3ec' },
  content: { padding: 18, paddingTop: 58, paddingBottom: 44 },
  title: { fontSize: 34, fontWeight: '900', color: '#24322f' },
  subtitle: { color: '#68766f', marginTop: 8, marginBottom: 16, lineHeight: 22 },
  cardTitle: { fontSize: 20, fontWeight: '900', marginBottom: 10, color: '#24322f' },
  body: { fontSize: 15, lineHeight: 22, color: '#3f4a45' },
  muted: { color: '#68766f', marginTop: 4, lineHeight: 20 },
  row: { borderTopWidth: 1, borderTopColor: '#dde7df', paddingTop: 10, marginTop: 10 },
  friendRow: { borderTopWidth: 1, borderTopColor: '#dde7df', paddingTop: 10, marginTop: 10 }
});
