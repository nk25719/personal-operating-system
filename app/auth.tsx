import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { Chip } from '../components/Visual';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseConfigured, logInWithEmail, logInWithGoogle, signUpWithEmail } from '../services/firebase';
import { shouldShowOnboarding } from '../services/onboarding';
import { theme } from '../constants/theme';

export default function AuthScreen() {
  const { data, updateData } = useAppData();
  const { configured } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const firebaseReady = configured && isFirebaseConfigured();

  const saveUser = async (user: { uid: string; email: string | null; displayName: string | null }) => {
    await updateData(current => ({
      ...current,
      userProfile: {
        ...current.userProfile,
        authUserId: user.uid,
        email: user.email,
        username: username.trim() || current.userProfile?.username || user.displayName || '',
        displayName: displayName.trim() || user.displayName || current.userProfile?.displayName || ''
      },
      preferences: {
        ...current.preferences,
        preferredName: displayName.trim() || user.displayName || current.preferences.preferredName
      }
    }), { type: 'data.updated', payload: { reason: 'auth.profile_saved' } });
    router.replace(data && shouldShowOnboarding(data) ? '/onboarding' : '/');
  };

  const submit = async () => {
    if (!firebaseReady) {
      setMessage('Firebase config is needed before login can run.');
      return;
    }
    try {
      const user = mode === 'signup'
        ? await signUpWithEmail(email, password, displayName || username)
        : await logInWithEmail(email, password);
      await saveUser(user);
    } catch (error) {
      setMessage(getAuthMessage(error));
    }
  };

  const google = async () => {
    try {
      await saveUser(await logInWithGoogle());
    } catch (error) {
      setMessage(getAuthMessage(error));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>POS</Text>
      <Text style={styles.title}>{mode === 'signup' ? 'Create your space.' : 'Welcome back.'}</Text>
      <View style={styles.chips}>
        <Chip label="Firebase Auth" />
        <Chip label="Local profile" />
      </View>

      {!firebaseReady ? (
        <Card variant="highlight">
          <Text style={styles.cardTitle}>Firebase setup needed</Text>
          <Text style={styles.body}>Add your Firebase web config as `EXPO_PUBLIC_FIREBASE_*` values, then enable Email/Password in Firebase Auth.</Text>
        </Card>
      ) : null}

      <Card>
        {mode === 'signup' ? (
          <>
            <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Nagham" />
            <Field label="Username" value={username} onChangeText={setUsername} placeholder="nagham" />
          </>
        ) : null}
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Button title={mode === 'signup' ? 'Create account' : 'Log in'} onPress={submit} />
        <View style={styles.row}>
          <Button title={mode === 'signup' ? 'I have an account' : 'Create account'} variant="secondary" onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')} />
          <Button title="Google" variant="secondary" onPress={google} />
        </View>
      </Card>
    </ScrollView>
  );
}

function getAuthMessage(error: unknown) {
  return error instanceof Error ? error.message.replace('Firebase: ', '') : 'Auth could not finish. Try again.';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 18, paddingTop: 72, paddingBottom: 48 },
  eyebrow: { color: theme.colors.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 },
  title: { fontSize: 34, fontWeight: '900', color: theme.colors.text, lineHeight: 38, marginTop: 8 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12, marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.text, marginBottom: 8 },
  body: { color: theme.colors.text, lineHeight: 22 },
  message: { color: theme.colors.warning, lineHeight: 20, marginBottom: 12, fontWeight: '800' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }
});
