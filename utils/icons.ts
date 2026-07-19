export const appIconRegistry = {
  home: 'home-outline',
  today: 'calendar-outline',
  plan: 'checkbox-outline',
  review: 'analytics-outline',
  growth: 'trending-up-outline',
  knowledge: 'book-outline',
  modules: 'grid-outline',
  add: 'add-circle-outline',
  profile: 'person-circle-outline',
  settings: 'settings-outline',
  capture: 'create-outline',
  habits: 'repeat-outline',
  projects: 'folder-open-outline',
  health: 'heart-outline',
  relationships: 'people-outline',
  learning: 'school-outline',
  tasks: 'list-outline',
  decision: 'git-branch-outline',
  builder: 'construct-outline',
  ai: 'sparkles-outline',
  environment: 'leaf-outline',
  womenHealth: 'flower-outline',
  lifeClock: 'time-outline',
  back: 'chevron-back-outline',
  notes: 'albums-outline'
} satisfies Record<string, string>;

export type AppIconName = keyof typeof appIconRegistry;

export function isAppIconName(name: string): name is AppIconName {
  return name in appIconRegistry;
}

export function getAppIconGlyph(name: AppIconName) {
  return appIconRegistry[name];
}
