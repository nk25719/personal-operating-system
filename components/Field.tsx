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
  wrap: { marginBottom: 14 },
  label: { fontWeight: '700', marginBottom: 8, color: theme.colors.text, fontSize: 15 },
  input: { backgroundColor: theme.colors.background, borderRadius: 12, padding: 14, fontSize: 16, minHeight: 44, color: theme.colors.text },
  multiline: { minHeight: 110, textAlignVertical: 'top' }
});
