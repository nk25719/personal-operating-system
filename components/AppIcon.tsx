import { Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../constants/theme';
import { AppIconName, getAppIconGlyph, isAppIconName } from '../utils/icons';

export type { AppIconName };

const warnedIcons = new Set<string>();

type Props = {
  iconKey?: AppIconName | string;
  name?: AppIconName | string;
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

export function AppIcon({ iconKey: explicitIconKey, name, size = 22, color = theme.colors.primary, fallbackLabel }: Props) {
  const iconKey = explicitIconKey ?? name ?? '';
  const fallbackStyle = {
    color,
    fontSize: Math.max(14, Math.min(22, Math.round(size * 0.82))),
    fontWeight: '900' as const,
    minWidth: size,
    height: size,
    lineHeight: size,
    paddingHorizontal: 2,
    textAlign: 'center' as const
  };

  if (!isAppIconName(iconKey)) {
    warnIconIssue(iconKey || 'missing');
    return <Text style={fallbackStyle}>{fallbackLabel ?? '?'}</Text>;
  }
  return (
    <Ionicons
      name={getAppIconGlyph(iconKey) as keyof typeof Ionicons.glyphMap}
      size={size}
      color={color}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
