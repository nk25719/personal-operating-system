import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

type Props = { time?: string; title: string; detail?: string; done: boolean; onPress: () => void };

export function ChecklistRow({ time, title, detail, done, onPress }: Props) {
  const [bounceAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!done) return;
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 0, duration: 220, useNativeDriver: true })
    ]).start();
  }, [done, bounceAnim]);

  const scale = bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, done && styles.doneRow, pressed && styles.pressed]}>
      <Animated.View style={[styles.check, done && styles.checkDone, done ? { transform: [{ scale }] } : null]}>
        <Text style={styles.checkText}>{done ? '✓' : ''}</Text>
      </Animated.View>
      <View style={styles.copy}>
        {time ? <Text style={styles.time}>{time}</Text> : null}
        <Text style={[styles.title, done && styles.doneText]}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    minHeight: 56,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  doneRow: { opacity: 0.66 },
  pressed: { opacity: 0.7 },
  check: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: theme.colors.surface,
    flexShrink: 0
  },
  checkDone: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  checkText: { color: theme.colors.surface, fontWeight: '900' },
  copy: { flex: 1 },
  time: { color: theme.colors.accent, fontSize: 12, fontWeight: '800', marginBottom: 2 },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  doneText: { textDecorationLine: 'line-through', color: theme.colors.textMuted },
  detail: { color: theme.colors.primary, fontWeight: '800', marginTop: 3, fontSize: 12 }
});
