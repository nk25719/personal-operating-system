import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { AppIconName, getAppIconGlyph, isAppIconName } from '../utils/icons';

export type { AppIconName };

const warnedIcons = new Set<string>();

type Props = {
  name: AppIconName | string;
  size?: number;
  color?: string;
  fallbackLabel?: string;
};

function warnIconIssue(name: string) {
  if (warnedIcons.has(name)) return;
  warnedIcons.add(name);
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.warn(`Unknown POS icon: ${name}`);
  }
}

export function AppIcon({ name, size = 22, color = theme.colors.primary, fallbackLabel }: Props) {
  if (!isAppIconName(name)) {
    warnIconIssue(name);
    return <Text style={{ color, fontSize: Math.max(11, Math.round(size * 0.55)), fontWeight: '900' }}>{fallbackLabel ?? name.slice(0, 2).toUpperCase()}</Text>;
  }
  const iconName = getAppIconGlyph(name);
  if (!iconName || !(iconName in Ionicons.glyphMap)) {
    warnIconIssue(`${name}:${iconName}`);
    return <Text style={{ color, fontSize: Math.max(11, Math.round(size * 0.55)), fontWeight: '900' }}>{fallbackLabel ?? name.slice(0, 2).toUpperCase()}</Text>;
  }
  return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
}
