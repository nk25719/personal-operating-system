import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppIcon } from './AppIcon';

export function SecondaryHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}>
        <AppIcon name="back" size={20} color="#36594d" fallbackLabel="<" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e7f0ea', borderWidth: 1, borderColor: '#d8e6de', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 26, fontWeight: '900', color: '#24322f' }
});
