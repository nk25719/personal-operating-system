import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../constants/theme';

type Props = { title: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'quiet' };

export function Button({ title, onPress, variant = 'primary' }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed]}>
      <Text style={[styles.text, variant !== 'primary' && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.border },
  quiet: { backgroundColor: theme.colors.accentSoft, borderWidth: 1, borderColor: theme.colors.borderSoft },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  text: { color: theme.colors.white, fontWeight: '800', fontSize: 14 },
  secondaryText: { color: theme.colors.primary }
});
