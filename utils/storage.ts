import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultData } from '../data/seed';
import { AppData } from '../types';

const APP_DATA_KEY = 'pos-app-data-v2';

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getAppData(): Promise<AppData> {
  const stored = await getJSON<AppData | null>(APP_DATA_KEY, null);
  if (!stored) return defaultData;
  return {
    ...defaultData,
    ...stored,
    lifeProfile: { ...defaultData.lifeProfile, ...stored.lifeProfile },
    womenHealth: { ...defaultData.womenHealth, ...stored.womenHealth },
    preferences: { ...defaultData.preferences, ...stored.preferences },
    tasks: stored.tasks ?? defaultData.tasks,
    integrations: { ...defaultData.integrations, ...stored.integrations },
    modules: stored.modules ?? defaultData.modules,
    captureInbox: stored.captureInbox ?? defaultData.captureInbox
  };
}

export async function setAppData(data: AppData): Promise<void> {
  await setJSON(APP_DATA_KEY, data);
}

export async function resetAppData(): Promise<void> {
  await AsyncStorage.removeItem(APP_DATA_KEY);
}
