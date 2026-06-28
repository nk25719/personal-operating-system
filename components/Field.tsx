import { StyleSheet, Text, TextInput, View } from 'react-native';

export function Field({ label, value, onChangeText, placeholder, multiline = false }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} multiline={multiline} style={[styles.input, multiline && styles.multiline]} />
    </View>
  );
}
const styles = StyleSheet.create({ wrap: { marginBottom: 10 }, label: { fontWeight: '700', marginBottom: 5, color: '#374151' }, input: { backgroundColor: '#f2f2f7', borderRadius: 12, padding: 12, fontSize: 16 }, multiline: { minHeight: 86, textAlignVertical: 'top' } });
