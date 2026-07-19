import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

type CardProps = PropsWithChildren<{ variant?: 'default' | 'soft' | 'highlight'; style?: ViewStyle }>;

export function Card({ children, variant = 'default', style }: CardProps) {
  return <View style={[styles.card, variant === 'soft' && styles.soft, variant === 'highlight' && styles.highlight, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.card,
    marginBottom: 12,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  soft: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.primarySoft
  },
  highlight: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.borderSoft
  }
});
