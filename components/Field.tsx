import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';

export function Field({ label, value, onChangeText, placeholder, multiline = false, secureTextEntry = false }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; multiline?: boolean; secureTextEntry?: boolean }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} multiline={multiline} secureTextEntry={secureTextEntry} style={[styles.input, multiline && styles.multiline]} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { width: '100%', minWidth: 0, marginBottom: 14 },
  label: { fontWeight: '700', marginBottom: 8, color: theme.colors.text, fontSize: 14, lineHeight: 18, flexShrink: 1 },
  input: { width: '100%', minWidth: 0, backgroundColor: theme.colors.background, borderRadius: 12, padding: 12, fontSize: 15, lineHeight: 20, minHeight: 44, color: theme.colors.text },
  multiline: { minHeight: 110, textAlignVertical: 'top' }
});
