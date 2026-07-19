import { Text } from 'react-native';
import { theme } from '../constants/theme';
import { AppIconName, getAppIconFallback, isAppIconName } from '../utils/icons';

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
  const iconStyle = {
    color,
    fontSize: Math.max(16, Math.min(28, Math.round(size * 0.92))),
    fontWeight: '900' as const,
    width: size + 6,
    height: size + 6,
    lineHeight: size + 4,
    paddingHorizontal: 2,
    textAlign: 'center' as const,
    includeFontPadding: false
  };

  if (!isAppIconName(iconKey)) {
    warnIconIssue(iconKey || 'missing');
    return <Text style={iconStyle}>{fallbackLabel ?? '•'}</Text>;
  }
  return <Text style={iconStyle}>{getAppIconFallback(iconKey)}</Text>;
}
