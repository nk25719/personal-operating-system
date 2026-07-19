import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { HeaderActions } from '../components/HeaderActions';
import { theme } from '../constants/theme';
import { useAppData } from '../hooks/useAppData';
import { AppIcon } from '../components/AppIcon';
import { moduleCards } from '../utils/modules';

export default function ModulesScreen() {
  const { data } = useAppData();
  const recommended = new Set(data?.preferences.recommendedModules ?? []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Modules</Text>
          <Text style={styles.title}>All tools</Text>
        </View>
        <HeaderActions />
      </View>
      <View style={styles.list}>
        {moduleCards.map(item => {
          const isRecommended = item.moduleKey ? recommended.has(item.moduleKey) : false;
          return (
            <Card key={item.key} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.icon}>
                  <AppIcon name={item.iconKey} size={22} />
                </View>
                <View style={styles.copy}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {isRecommended ? <Text style={styles.badge}>Recommended</Text> : null}
                  </View>
                  <Text style={styles.subtitle}>{item.statusLabel ?? item.description}</Text>
                </View>
              </View>
              <View style={styles.open}>
                <Link href={item.route as any} asChild>
                  <Button title="Open" variant="secondary" />
                </Link>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center', padding: theme.spacing.screen, paddingTop: 48, paddingBottom: 64 },
  topRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  titleBlock: { flex: 1, minWidth: 0 },
  eyebrow: { color: theme.colors.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 11 },
  title: { fontSize: 24, lineHeight: 29, fontWeight: '800', color: theme.colors.text, flexShrink: 1 },
  list: { gap: 10 },
  card: { gap: 12 },
  cardRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  badge: { color: theme.colors.accent, backgroundColor: theme.colors.accentSoft, overflow: 'hidden', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8, fontSize: 11, fontWeight: '900' },
  cardTitle: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '900', color: theme.colors.text, lineHeight: 22 },
  subtitle: { color: theme.colors.textMuted, lineHeight: 19, marginTop: 4 },
  open: { alignSelf: 'flex-start' }
});
