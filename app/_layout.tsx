import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#111827' }}>
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color, size }) => <Ionicons name="today" color={color} size={size} /> }} />
      <Tabs.Screen name="capture" options={{ title: 'Capture', tabBarIcon: ({ color, size }) => <Ionicons name="mic-circle" color={color} size={size} /> }} />
      <Tabs.Screen name="modules" options={{ title: 'Modules', tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} /> }} />

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
  );
}
