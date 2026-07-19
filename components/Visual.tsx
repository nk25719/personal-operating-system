import { PropsWithChildren, useState } from 'react';
import { DimensionValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

export function Chip({ label }: { label: string }) {
  return <View style={styles.chip}><Text style={styles.chipText}>{label}</Text></View>;
}

export function ProgressBar({ value }: { value: number }) {
  const width = `${Math.max(0, Math.min(100, value))}%` as DimensionValue;
  return <View style={styles.track}><View style={[styles.fill, { width }]} /></View>;
}

export function StatCard({ label, value, progress }: { label: string; value: string; progress?: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {typeof progress === 'number' ? <ProgressBar value={progress} /> : null}
    </View>
  );
}

export function Details({ title = 'Details', children }: PropsWithChildren<{ title?: string }>) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.details}>
      <Pressable accessibilityRole="button" onPress={() => setOpen(value => !value)}>
        <Text style={styles.detailsTitle}>{open ? 'Hide' : title}</Text>
      </Pressable>
      {open ? <View style={styles.detailsBody}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start', maxWidth: '100%', backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.chip, paddingHorizontal: 9, paddingVertical: 5 },
  chipText: { color: theme.colors.primary, fontSize: 11, lineHeight: 15, fontWeight: '800', flexShrink: 1 },
  track: { height: 8, borderRadius: 4, backgroundColor: theme.colors.border, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 4, backgroundColor: theme.colors.primary },
  stat: { flex: 1, minWidth: 96, backgroundColor: theme.colors.background, borderRadius: 14, padding: 12 },
  statValue: { fontSize: 18, lineHeight: 22, fontWeight: '800', color: theme.colors.text },
  statLabel: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 15, fontWeight: '700', marginTop: 2 },
  details: { marginTop: 12 },
  detailsTitle: { color: theme.colors.primary, fontWeight: '900' },
  detailsBody: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border }
});
