import { StyleSheet, Text, TextInput, View } from 'react-native';

export function Field({ label, value, onChangeText, placeholder, multiline = false }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} multiline={multiline} style={[styles.input, multiline && styles.multiline]} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontWeight: '700', marginBottom: 8, color: '#3f4a45', fontSize: 15 },
  input: { backgroundColor: '#f4f1ea', borderRadius: 12, padding: 14, fontSize: 16, minHeight: 44 },
  multiline: { minHeight: 110, textAlignVertical: 'top' }
});
