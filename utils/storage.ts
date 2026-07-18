import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultData } from '../data/seed';
import { AppData, IntegrationSettings, MutationEvent, PlannerMemoryRecord } from '../types';
import { setSecret } from './secrets';

const APP_DATA_KEY = 'pos-app-data-v2';
const EVENT_LOG_KEY = 'pos-event-log-v1';
const PLANNER_MEMORY_KEY = 'pos-planner-memory-v1';
export const BACKUP_SCHEMA_VERSION = 1;
type LegacyIntegrationSettings = IntegrationSettings & { aiApiKey?: string; notionToken?: string };
type LegacyAppData = Omit<AppData, 'integrations'> & { integrations?: LegacyIntegrationSettings };
type AppBackup = {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  appData: AppData;
  events: MutationEvent[];
  plannerMemory: PlannerMemoryRecord[];
};
export type BackupPreview = {
  schemaVersion: number | 'legacy';
  charactersCount: number;
  habitsCount: number;
  projectsCount: number;
  tasksCount: number;
  warning: string;
};

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getAppData(): Promise<AppData> {
  const stored = await getJSON<LegacyAppData | null>(APP_DATA_KEY, null);
  if (!stored) return defaultData;
  const integrations = await migrateAndSanitizeIntegrations(stored.integrations);
  return {
    ...defaultData,
    ...stored,
    lifeProfile: { ...defaultData.lifeProfile, ...stored.lifeProfile },
    womenHealth: { ...defaultData.womenHealth, ...stored.womenHealth },
    preferences: {
      ...defaultData.preferences,
      ...stored.preferences,
      onboardingCompleted: stored.preferences?.onboardingCompleted ?? true
    },
    tasks: stored.tasks ?? defaultData.tasks,
    integrations,
    modules: stored.modules ?? defaultData.modules,
    captureInbox: stored.captureInbox ?? defaultData.captureInbox,
    connectedAccounts: stored.connectedAccounts ?? defaultData.connectedAccounts,
    friends: stored.friends ?? defaultData.friends
  };
}

export async function setAppData(data: AppData): Promise<void> {
  await setJSON(APP_DATA_KEY, sanitizeAppData(data));
}

export async function resetAppData(): Promise<void> {
  await AsyncStorage.removeItem(APP_DATA_KEY);
}

export async function appendMutationEvent(type: MutationEvent['type'], payload?: MutationEvent['payload']): Promise<MutationEvent> {
  const event: MutationEvent = {
    id: `event-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type,
    createdAt: new Date().toISOString(),
    payload
  };
  const existing = await getMutationEvents();
  await setJSON(EVENT_LOG_KEY, [event, ...existing].slice(0, 500));
  return event;
}

export async function getMutationEvents(): Promise<MutationEvent[]> {
  return getJSON<MutationEvent[]>(EVENT_LOG_KEY, []);
}

export async function clearMutationEvents(): Promise<void> {
  await AsyncStorage.removeItem(EVENT_LOG_KEY);
}

export async function appendPlannerMemory(record: Omit<PlannerMemoryRecord, 'id' | 'createdAt'>): Promise<PlannerMemoryRecord> {
  const entry: PlannerMemoryRecord = {
    id: `memory-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    ...record
  };
  const existing = await getPlannerMemory();
  await setJSON(PLANNER_MEMORY_KEY, [entry, ...existing].slice(0, 500));
  return entry;
}

export async function getPlannerMemory(): Promise<PlannerMemoryRecord[]> {
  return getJSON<PlannerMemoryRecord[]>(PLANNER_MEMORY_KEY, []);
}

export async function updatePlannerMemoryResult(id: string, resultLater: PlannerMemoryRecord['resultLater']): Promise<PlannerMemoryRecord[]> {
  const existing = await getPlannerMemory();
  const next = existing.map(record => record.id === id ? { ...record, resultLater } : record);
  await setJSON(PLANNER_MEMORY_KEY, next);
  return next;
}

export async function exportAppBackup(): Promise<string> {
  const appData = sanitizeAppData(await getAppData());
  const events = await getMutationEvents();
  const plannerMemory = await getPlannerMemory();
  const backup: AppBackup = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appData,
    events,
    plannerMemory
  };
  return JSON.stringify(backup, null, 2);
}

export async function importAppBackup(raw: string): Promise<AppData> {
  const { incoming, parsed } = parseBackup(raw);
  const sanitized = sanitizeAppData({
    ...defaultData,
    ...incoming,
    integrations: sanitizeIntegrations(incoming.integrations)
  });
  await setAppData(sanitized);
  if ('events' in parsed && Array.isArray(parsed.events)) await setJSON(EVENT_LOG_KEY, parsed.events);
  if ('plannerMemory' in parsed && Array.isArray(parsed.plannerMemory)) await setJSON(PLANNER_MEMORY_KEY, parsed.plannerMemory);
  await appendMutationEvent('backup.imported', { schemaVersion: 'schemaVersion' in parsed ? parsed.schemaVersion : 'legacy' });
  return sanitized;
}

export function previewAppBackup(raw: string): BackupPreview {
  const { incoming, parsed } = parseBackup(raw);
  return {
    schemaVersion: 'schemaVersion' in parsed && typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 'legacy',
    charactersCount: incoming.characters?.length ?? 0,
    habitsCount: incoming.habits?.length ?? 0,
    projectsCount: incoming.projects?.length ?? 0,
    tasksCount: incoming.tasks?.length ?? 0,
    warning: 'Importing this backup will replace the current local POS data on this device. Provider secrets are not included.'
  };
}

export function sanitizeAppData(data: AppData): AppData {
  return {
    ...data,
    integrations: sanitizeIntegrations(data.integrations as LegacyIntegrationSettings)
  };
}

export function sanitizeIntegrations(integrations?: LegacyIntegrationSettings): IntegrationSettings {
  const { aiApiKey: _aiApiKey, notionToken: _notionToken, ...safe } = integrations ?? {};
  return {
    ...defaultData.integrations,
    ...safe
  };
}

async function migrateAndSanitizeIntegrations(integrations?: LegacyIntegrationSettings): Promise<IntegrationSettings> {
  if (integrations?.aiApiKey) await setSecret('openaiApiKey', integrations.aiApiKey);
  if (integrations?.notionToken) await setSecret('notionToken', integrations.notionToken);
  return sanitizeIntegrations(integrations);
}

function parseBackup(raw: string): { parsed: Partial<AppBackup> | LegacyAppData; incoming: LegacyAppData } {
  const parsed = JSON.parse(raw) as Partial<AppBackup> | LegacyAppData;
  const incoming = 'appData' in parsed && parsed.appData ? parsed.appData as LegacyAppData : parsed as LegacyAppData;
  return { parsed, incoming };
}
