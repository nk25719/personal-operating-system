import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type CardProps = PropsWithChildren<{ variant?: 'default' | 'soft' | 'highlight'; style?: ViewStyle }>;

export function Card({ children, variant = 'default', style }: CardProps) {
  return <View style={[styles.card, variant === 'soft' && styles.soft, variant === 'highlight' && styles.highlight, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffaf3',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1e4d0',
    shadowColor: '#7c2d12',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  soft: {
    backgroundColor: '#f7f0ff',
    borderColor: '#e9d5ff'
  },
  highlight: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa'
  }
});
