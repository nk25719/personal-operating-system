import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { AuthGate } from '../components/AuthGate';
import { AppIcon } from '../components/AppIcon';

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
          minHeight: 58 + Math.max(insets.bottom, 0)
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800'
        }
      }}>
        <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <AppIcon iconKey="home" color={color} size={size} /> }} />
        <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: ({ color, size }) => <AppIcon iconKey="today" color={color} size={size} /> }} />
        <Tabs.Screen name="plan" options={{ title: 'Plan', tabBarIcon: ({ color, size }) => <AppIcon iconKey="plan" color={color} size={size} /> }} />
        <Tabs.Screen name="growth" options={{ title: 'Growth', tabBarIcon: ({ color, size }) => <AppIcon iconKey="growth" color={color} size={size} /> }} />
        <Tabs.Screen name="knowledge" options={{ title: 'Knowledge', tabBarIcon: ({ color, size }) => <AppIcon iconKey="knowledge" color={color} size={size} /> }} />
        <Tabs.Screen name="relationships" options={{ href: null }} />
        <Tabs.Screen name="modules" options={{ href: null }} />
        <Tabs.Screen name="capture" options={{ href: null }} />
        <Tabs.Screen name="review" options={{ href: null }} />
        <Tabs.Screen name="auth" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="onboarding" options={{ href: null }} />

        <Tabs.Screen name="tasks" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="habits" options={{ href: null }} />
        <Tabs.Screen name="projects" options={{ href: null }} />
        <Tabs.Screen name="learning" options={{ href: null }} />
        <Tabs.Screen name="decision" options={{ href: null }} />
        <Tabs.Screen name="life-clock" options={{ href: null }} />
        <Tabs.Screen name="women-health" options={{ href: null }} />
        <Tabs.Screen name="health" options={{ href: null }} />
        <Tabs.Screen name="environment" options={{ href: null }} />
        <Tabs.Screen name="builder" options={{ href: null }} />
        <Tabs.Screen name="ai" options={{ href: null }} />
      </Tabs>
      <AuthGate />
    </>
  );
}
