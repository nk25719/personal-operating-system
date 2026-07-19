import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultData } from '../data/seed';
import { AppData, IntegrationSettings, MutationEvent, PlannerMemoryRecord } from '../types';
import { setSecret } from './secrets';

const APP_DATA_KEY = 'pos-app-data-v2';
const EVENT_LOG_KEY = 'pos-event-log-v1';
const PLANNER_MEMORY_KEY = 'pos-planner-memory-v1';
export const BACKUP_SCHEMA_VERSION = 1;
let activeUserId: string | null = null;
const appDataListeners = new Set<(data: AppData | null, userId: string | null) => void>();
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

export function setStorageUser(userId: string | null) {
  activeUserId = userId;
}

export function getUserScopedStorageKey(baseKey: string, userId = activeUserId): string | null {
  return userId ? `${baseKey}:${userId}` : null;
}

export function getAppDataStorageKey(userId = activeUserId) {
  return getUserScopedStorageKey(APP_DATA_KEY, userId);
}

export async function getAppData(userId = activeUserId): Promise<AppData | null> {
  const key = getAppDataStorageKey(userId);
  if (!key) return null;
  const stored = await getJSON<LegacyAppData | null>(key, null);
  if (!stored) return cloneAppData(defaultData);
  const integrations = await migrateAndSanitizeIntegrations(stored.integrations);
  return {
    ...defaultData,
    ...stored,
    userProfile: { ...defaultData.userProfile, ...stored.userProfile },
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

export async function setAppData(data: AppData, userId = activeUserId): Promise<void> {
  const key = getAppDataStorageKey(userId);
  if (!key) return;
  const sanitized = sanitizeAppData(data);
  await setJSON(key, sanitized);
  notifyAppDataListeners(sanitized, userId);
}

export async function resetAppData(userId = activeUserId): Promise<void> {
  const key = getAppDataStorageKey(userId);
  if (key) await AsyncStorage.removeItem(key);
  notifyAppDataListeners(null, userId);
}

export function subscribeToAppData(listener: (data: AppData | null, userId: string | null) => void): () => void {
  appDataListeners.add(listener);
  return () => {
    appDataListeners.delete(listener);
  };
}

export async function appendMutationEvent(type: MutationEvent['type'], payload?: MutationEvent['payload']): Promise<MutationEvent> {
  const event: MutationEvent = {
    id: `event-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type,
    createdAt: new Date().toISOString(),
    payload
  };
  const existing = await getMutationEvents();
  const key = scopedRequiredKey(EVENT_LOG_KEY);
  if (key) await setJSON(key, [event, ...existing].slice(0, 500));
  return event;
}

export async function getMutationEvents(): Promise<MutationEvent[]> {
  const key = scopedRequiredKey(EVENT_LOG_KEY);
  return key ? getJSON<MutationEvent[]>(key, []) : [];
}

export async function clearMutationEvents(): Promise<void> {
  const key = scopedRequiredKey(EVENT_LOG_KEY);
  if (key) await AsyncStorage.removeItem(key);
}

export async function appendPlannerMemory(record: Omit<PlannerMemoryRecord, 'id' | 'createdAt'>): Promise<PlannerMemoryRecord> {
  const entry: PlannerMemoryRecord = {
    id: `memory-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    ...record
  };
  const existing = await getPlannerMemory();
  const key = scopedRequiredKey(PLANNER_MEMORY_KEY);
  if (key) await setJSON(key, [entry, ...existing].slice(0, 500));
  return entry;
}

export async function getPlannerMemory(): Promise<PlannerMemoryRecord[]> {
  const key = scopedRequiredKey(PLANNER_MEMORY_KEY);
  return key ? getJSON<PlannerMemoryRecord[]>(key, []) : [];
}

export async function updatePlannerMemoryResult(id: string, resultLater: PlannerMemoryRecord['resultLater']): Promise<PlannerMemoryRecord[]> {
  const existing = await getPlannerMemory();
  const next = existing.map(record => record.id === id ? { ...record, resultLater } : record);
  const key = scopedRequiredKey(PLANNER_MEMORY_KEY);
  if (key) await setJSON(key, next);
  return next;
}

export async function exportAppBackup(): Promise<string> {
  const current = await getAppData();
  if (!current) throw new Error('Log in before exporting POS data.');
  const appData = sanitizeAppData(current);
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
  const eventKey = scopedRequiredKey(EVENT_LOG_KEY);
  const memoryKey = scopedRequiredKey(PLANNER_MEMORY_KEY);
  if (eventKey && 'events' in parsed && Array.isArray(parsed.events)) await setJSON(eventKey, parsed.events);
  if (memoryKey && 'plannerMemory' in parsed && Array.isArray(parsed.plannerMemory)) await setJSON(memoryKey, parsed.plannerMemory);
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

function scopedRequiredKey(baseKey: string) {
  return getUserScopedStorageKey(baseKey);
}

function cloneAppData(data: AppData): AppData {
  return JSON.parse(JSON.stringify(data)) as AppData;
}

function notifyAppDataListeners(data: AppData | null, userId: string | null) {
  appDataListeners.forEach(listener => listener(data, userId));
}
