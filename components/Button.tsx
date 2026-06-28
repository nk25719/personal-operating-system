import { Pressable, StyleSheet, Text } from 'react-native';

type Props = { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'quiet' };

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
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: { backgroundColor: '#7c3aed' },
  secondary: { backgroundColor: '#ede9fe', borderWidth: 1, borderColor: '#ddd6fe' },
  quiet: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  text: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  secondaryText: { color: '#5b21b6' }
});
