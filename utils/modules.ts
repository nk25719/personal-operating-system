import { ModuleKey } from '../types';
import { AppIconName } from './icons';

export type ModuleCardConfig = {
  key: string;
  title: string;
  description: string;
  route: string;
  iconKey: AppIconName;
  moduleKey?: ModuleKey;
  statusLabel?: string;
};

export const moduleCards: ModuleCardConfig[] = [
  {
    key: 'tasks',
    title: 'Tasks / Actions',
    description: 'Add one action, paste a list, or schedule something.',
    route: '/tasks',
    iconKey: 'tasks'
  },
  {
    key: 'habits',
    title: 'Habits',
    description: 'Tiny practices and streaks.',
    route: '/habits',
    iconKey: 'habits',
    moduleKey: 'habits'
  },
  {
    key: 'projects',
    title: 'Projects',
    description: 'Outcomes with next steps.',
    route: '/projects',
    iconKey: 'projects',
    moduleKey: 'projects'
  },
  {
    key: 'capture',
    title: 'Capture',
    description: 'Save a thought quickly.',
    route: '/capture',
    iconKey: 'capture'
  },
  {
    key: 'review',
    title: 'Review',
    description: 'Daily and weekly patterns.',
    route: '/review',
    iconKey: 'review'
  },
  {
    key: 'learning',
    title: 'Learning',
    description: 'Notes and study goals.',
    route: '/learning',
    iconKey: 'learning',
    moduleKey: 'learning'
  },
  {
    key: 'decision',
    title: 'Decision',
    description: 'Choose with less noise.',
    route: '/decision',
    iconKey: 'decision',
    moduleKey: 'decision'
  },
  {
    key: 'health',
    title: 'Health',
    description: 'Body context for plans.',
    route: '/health',
    iconKey: 'health',
    moduleKey: 'health'
  },
  {
    key: 'women-health',
    title: 'Women’s Health',
    description: 'Cycle-aware notes.',
    route: '/women-health',
    iconKey: 'womenHealth',
    moduleKey: 'womenHealth',
    statusLabel: 'Available, basic version'
  },
  {
    key: 'environment',
    title: 'Environment',
    description: 'Spaces that support you.',
    route: '/environment',
    iconKey: 'environment',
    moduleKey: 'environment'
  },
  {
    key: 'relationships',
    title: 'Relationships',
    description: 'Connection and check-ins.',
    route: '/relationships',
    iconKey: 'relationships'
  },
  {
    key: 'builder',
    title: 'Builder / Identity Builder',
    description: 'Shape the person system.',
    route: '/builder',
    iconKey: 'builder',
    moduleKey: 'builder',
    statusLabel: 'Available, basic version'
  },
  {
    key: 'ai',
    title: 'AI Advisor',
    description: 'Optional planning help.',
    route: '/ai',
    iconKey: 'ai',
    moduleKey: 'ai',
    statusLabel: 'Available, basic version'
  },
  {
    key: 'life-clock',
    title: 'Life Clock',
    description: 'Time perspective, gently.',
    route: '/life-clock',
    iconKey: 'lifeClock',
    statusLabel: 'Available, basic version'
  },
  {
    key: 'settings',
    title: 'Settings',
    description: 'Privacy, backup, and tools.',
    route: '/settings',
    iconKey: 'settings'
  },
  {
    key: 'profile',
    title: 'Profile',
    description: 'Your identity and context.',
    route: '/profile',
    iconKey: 'profile'
  }
];
