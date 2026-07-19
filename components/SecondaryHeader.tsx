import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppIcon } from './AppIcon';
import { theme } from '../constants/theme';

export function SecondaryHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}>
        <AppIcon name="back" size={20} color={theme.colors.primary} fallbackLabel="<" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, minWidth: 0 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { flex: 1, minWidth: 0, fontSize: 24, lineHeight: 29, fontWeight: '900', color: theme.colors.text }
});
