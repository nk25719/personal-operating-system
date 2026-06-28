import { Pressable, StyleSheet, Text } from 'react-native';

export function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.button}><Text style={styles.text}>{title}</Text></Pressable>;
}
const styles = StyleSheet.create({ button: { backgroundColor: '#111827', borderRadius: 14, padding: 13, alignItems: 'center', marginVertical: 6 }, text: { color: 'white', fontWeight: '800', fontSize: 16 } });
