import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../hooks/useAuth';
import { shouldShowOnboarding } from '../services/onboarding';
import { theme } from '../constants/theme';

export function AuthGate() {
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const { user, loading: authLoading, configured } = useAuth();
  const { data, loading: dataLoading } = useAppData();
  const route = segments[0];
  const isAuthRoute = route === 'auth';
  const isOnboardingRoute = route === 'onboarding';
  const ready = Boolean(rootNavigationState?.key) && !authLoading && !dataLoading;

  useEffect(() => {
    if (!ready) return;
    if (!configured || !user) {
      if (!isAuthRoute) router.replace('/auth');
      return;
    }
    if (data && shouldShowOnboarding(data)) {
      if (!isOnboardingRoute) router.replace('/onboarding');
      return;
    }
    if (isAuthRoute || isOnboardingRoute) router.replace('/');
  }, [configured, data, isAuthRoute, isOnboardingRoute, ready, user]);

  if (!configured && ready && isAuthRoute) return null;
  if (!ready) return <AuthLoadingScreen />;
  return null;
}

function AuthLoadingScreen() {
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Opening POS</Text>
      <Text style={styles.body}>Checking your session.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '900' },
  body: { color: theme.colors.textMuted, marginTop: 8, fontWeight: '700' }
});
