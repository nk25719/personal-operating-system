import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { Chip } from '../components/Visual';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseConfigured, logInWithEmail, logInWithGoogle, signUpWithEmail } from '../services/firebase';
import { shouldShowOnboarding } from '../services/onboarding';
import { getAuthMessage } from '../services/authErrors';
import { getAppData, setAppData, setStorageUser } from '../utils/storage';
import { theme } from '../constants/theme';

export default function AuthScreen() {
  const { configured } = useAuth();
  const [mode, setMode] = useState<'landing' | 'login' | 'signup'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const firebaseReady = configured && isFirebaseConfigured();

  const saveUser = async (user: { uid: string; email: string | null; displayName: string | null }) => {
    setStorageUser(user.uid);
    const current = await getAppData(user.uid);
    if (!current) return;
    const next = {
      ...current,
      userProfile: {
        ...current.userProfile,
        authUserId: user.uid,
        email: user.email,
        username: username.trim() || current.userProfile?.username || user.displayName || '',
        displayName: user.displayName || username.trim() || current.userProfile?.displayName || ''
      },
      preferences: {
        ...current.preferences,
        preferredName: user.displayName || username.trim() || current.preferences.preferredName
      }
    };
    await setAppData(next, user.uid);
    router.replace(shouldShowOnboarding(next) ? '/onboarding' : '/');
  };

  const submit = async () => {
    if (saving) return;
    if (!firebaseReady) {
      setMessage('Firebase config is needed before login can run.');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    try {
      setSaving(true);
      setMessage('');
      const user = mode === 'signup'
        ? await signUpWithEmail(email, password, username)
        : await logInWithEmail(email, password);
      await saveUser(user);
    } catch (error) {
      setMessage(getAuthMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const google = async () => {
    try {
      setSaving(true);
      setMessage('');
      await saveUser(await logInWithGoogle());
    } catch (error) {
      setMessage(getAuthMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>POS</Text>
      <Text style={styles.title}>{mode === 'landing' ? 'Start with your own space.' : mode === 'signup' ? 'Create account.' : 'Log in.'}</Text>
      <View style={styles.chips}>
        <Chip label="Private account" />
        <Chip label="Local data" />
      </View>

      {!firebaseReady ? (
        <Card variant="highlight">
          <Text style={styles.cardTitle}>Firebase setup needed</Text>
          <Text style={styles.body}>Add your Firebase web config as `EXPO_PUBLIC_FIREBASE_*` values, then enable Email/Password in Firebase Auth.</Text>
        </Card>
      ) : null}

      <Card>
        {mode === 'landing' ? (
          <>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <Button title="Create account" onPress={() => { setMessage(''); setMode('signup'); }} />
            <View style={styles.row}>
              <Button title="Log in" variant="secondary" onPress={() => { setMessage(''); setMode('login'); }} />
              <Button title="Google" variant="secondary" onPress={google} disabled={saving || !firebaseReady} />
            </View>
          </>
        ) : mode === 'signup' ? (
          <>
            <Field label="Username" value={username} onChangeText={setUsername} placeholder="yourname" />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
            <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat password" secureTextEntry />
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <Button title={saving ? 'Creating...' : 'Create account'} onPress={submit} disabled={saving} />
            <View style={styles.row}>
              <Button title="Log in instead" variant="secondary" onPress={() => { setMessage(''); setMode('login'); }} />
              <Button title="Google" variant="secondary" onPress={google} disabled={saving || !firebaseReady} />
            </View>
          </>
        ) : (
          <>
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <Button title={saving ? 'Logging in...' : 'Log in'} onPress={submit} disabled={saving} />
            <View style={styles.row}>
              <Button title="Create account" variant="secondary" onPress={() => { setMessage(''); setMode('signup'); }} />
              <Button title="Google" variant="secondary" onPress={google} disabled={saving || !firebaseReady} />
            </View>
          </>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center', padding: theme.spacing.screen, paddingTop: 56, paddingBottom: 48 },
  eyebrow: { color: theme.colors.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 },
  title: { fontSize: 24, lineHeight: 29, fontWeight: '800', color: theme.colors.text, marginTop: 8, flexShrink: 1 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12, marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '900', color: theme.colors.text, marginBottom: 8, flexShrink: 1 },
  body: { color: theme.colors.text, lineHeight: 22 },
  message: { color: theme.colors.warning, lineHeight: 20, marginBottom: 12, fontWeight: '800' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }
});
