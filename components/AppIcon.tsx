import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export type AppIconName =
  | 'home'
  | 'today'
  | 'plan'
  | 'growth'
  | 'knowledge'
  | 'modules'
  | 'profile'
  | 'settings'
  | 'capture'
  | 'habits'
  | 'projects'
  | 'health'
  | 'relationships'
  | 'learning'
  | 'tasks'
  | 'decisions'
  | 'builder'
  | 'ai'
  | 'environment'
  | 'womenHealth'
  | 'back'
  | 'notes';

const iconMap = {
  home: 'home-outline',
  today: 'calendar-outline',
  plan: 'checkbox-outline',
  growth: 'trending-up-outline',
  knowledge: 'book-outline',
  modules: 'add-circle-outline',
  profile: 'person-circle-outline',
  settings: 'settings-outline',
  capture: 'create-outline',
  habits: 'repeat-outline',
  projects: 'folder-open-outline',
  health: 'heart-outline',
  relationships: 'people-outline',
  learning: 'school-outline',
  tasks: 'checkbox-outline',
  decisions: 'git-branch-outline',
  builder: 'construct-outline',
  ai: 'sparkles-outline',
  environment: 'leaf-outline',
  womenHealth: 'moon-outline',
  back: 'chevron-back-outline',
  notes: 'albums-outline'
} satisfies Record<AppIconName, keyof typeof Ionicons.glyphMap>;

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  fallbackLabel?: string;
};

export function AppIcon({ name, size = 22, color = theme.colors.primary, fallbackLabel }: Props) {
  const iconName = iconMap[name];
  if (!iconName || !(iconName in Ionicons.glyphMap)) {
    return <Text style={{ color, fontSize: Math.max(11, Math.round(size * 0.55)), fontWeight: '900' }}>{fallbackLabel ?? name.slice(0, 2).toUpperCase()}</Text>;
  }
  return <Ionicons name={iconName} size={size} color={color} />;
}
