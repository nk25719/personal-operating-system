import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '../constants/theme';
import { AppIcon } from './AppIcon';
import { topActionItems } from '../utils/topActions';

export function HeaderActions() {
  const addTodo = topActionItems.find(item => item.key === 'addTodo');
  const modules = topActionItems.find(item => item.key === 'modules');
  const profile = topActionItems.find(item => item.key === 'profile');
  const settings = topActionItems.find(item => item.key === 'settings');

  return (
    <View style={styles.wrap}>
      <View style={styles.actions}>
        {addTodo ? (
          <Link href={addTodo.href} asChild>
            <Pressable accessibilityLabel="Add to-do" accessibilityRole="button" style={styles.textButton}>
              <Text style={styles.textButtonLabel}>{addTodo.label}</Text>
            </Pressable>
          </Link>
        ) : null}
        {modules ? (
          <Link href={modules.href} asChild>
            <Pressable accessibilityLabel="Open modules" accessibilityRole="button" style={styles.button}>
              <AppIcon name="add" size={24} fallbackLabel="+" />
            </Pressable>
          </Link>
        ) : null}
        {profile ? (
          <Link href={profile.href} asChild>
            <Pressable accessibilityLabel="Open profile" accessibilityRole="button" style={styles.button}>
              <AppIcon name="profile" size={24} fallbackLabel="Me" />
            </Pressable>
          </Link>
        ) : null}
        {settings ? (
          <Link href={settings.href} asChild>
            <Pressable accessibilityLabel="Open settings" accessibilityRole="button" style={styles.button}>
              <AppIcon name="settings" size={22} fallbackLabel="Set" />
            </Pressable>
          </Link>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-end', zIndex: 10 },
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
  },
  textButton: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textButtonLabel: { color: theme.colors.white, fontWeight: '900', fontSize: 13 }
});
