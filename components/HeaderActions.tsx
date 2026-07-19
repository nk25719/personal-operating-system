import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '../constants/theme';
import { topActionItems } from '../utils/topActions';
import { AppIcon } from './AppIcon';

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
              <Text style={styles.textButtonLabel}>Add</Text>
            </Pressable>
          </Link>
        ) : null}
        {modules ? (
          <Link href={modules.href} asChild>
            <Pressable accessibilityLabel="Open modules" accessibilityRole="button" style={styles.secondaryTextButton}>
              <Text style={styles.secondaryTextButtonLabel}>Modules</Text>
            </Pressable>
          </Link>
        ) : null}
        {profile ? (
          <Link href={profile.href} asChild>
            <Pressable accessibilityLabel="Open profile" accessibilityRole="button" style={styles.button}>
              <AppIcon iconKey="profile" size={20} />
            </Pressable>
          </Link>
        ) : null}
        {settings ? (
          <Link href={settings.href} asChild>
            <Pressable accessibilityLabel="Open settings" accessibilityRole="button" style={styles.buttonWide}>
              <AppIcon iconKey="settings" size={20} />
            </Pressable>
          </Link>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-end', zIndex: 10, maxWidth: '100%', minWidth: 0 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'flex-end', maxWidth: '100%' },
  button: {
    minWidth: 44,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  buttonWide: {
    minWidth: 44,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  textButton: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryTextButton: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textButtonLabel: { color: theme.colors.white, fontWeight: '900', fontSize: 13, lineHeight: 17, textAlign: 'center' },
  secondaryTextButtonLabel: { color: theme.colors.primary, fontWeight: '900', fontSize: 13, lineHeight: 17, textAlign: 'center' }
});
