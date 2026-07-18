import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export function HeaderActions() {
  return (
    <View style={styles.actions}>
      <Link href="/modules" asChild>
        <Pressable accessibilityLabel="Open modules" accessibilityRole="button" style={styles.button}>
          <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
        </Pressable>
      </Link>
      <Link href="/profile" asChild>
        <Pressable accessibilityLabel="Open profile" accessibilityRole="button" style={styles.button}>
          <Ionicons name="person-circle" size={24} color={theme.colors.primary} />
        </Pressable>
      </Link>
      <Link href="/settings" asChild>
        <Pressable accessibilityLabel="Open settings" accessibilityRole="button" style={styles.button}>
          <Ionicons name="settings" size={22} color={theme.colors.primary} />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  }
});
