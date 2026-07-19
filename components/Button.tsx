import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../constants/theme';

type Props = { title: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'quiet'; disabled?: boolean };

export function Button({ title, onPress, variant = 'primary', disabled = false }: Props) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, styles[variant], pressed && !disabled && styles.pressed, disabled && styles.disabled]}>
      <Text style={[styles.text, variant !== 'primary' && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    minWidth: 44,
    maxWidth: '100%',
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.border },
  quiet: { backgroundColor: theme.colors.accentSoft, borderWidth: 1, borderColor: theme.colors.borderSoft },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
  text: { color: theme.colors.white, fontWeight: '800', fontSize: 15, textAlign: 'center', flexShrink: 1 },
  secondaryText: { color: theme.colors.primary }
});
