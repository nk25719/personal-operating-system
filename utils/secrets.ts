import * as SecureStore from 'expo-secure-store';

export type SecretKey = 'openaiApiKey' | 'notionToken';

const keyMap: Record<SecretKey, string> = {
  openaiApiKey: 'pos.secret.openaiApiKey',
  notionToken: 'pos.secret.notionToken'
};

const memoryFallback = new Map<string, string>();

export async function getSecret(key: SecretKey): Promise<string> {
  const secureKey = keyMap[key];
  if (!(await canUseSecureStore())) return memoryFallback.get(secureKey) ?? '';
  return (await SecureStore.getItemAsync(secureKey)) ?? '';
}

export async function setSecret(key: SecretKey, value: string): Promise<void> {
  const trimmed = value.trim();
  if (!trimmed) {
    await deleteSecret(key);
    return;
  }
  const secureKey = keyMap[key];
  if (!(await canUseSecureStore())) {
    memoryFallback.set(secureKey, trimmed);
    return;
  }
  await SecureStore.setItemAsync(secureKey, trimmed);
}

export async function deleteSecret(key: SecretKey): Promise<void> {
  const secureKey = keyMap[key];
  memoryFallback.delete(secureKey);
  if (await canUseSecureStore()) await SecureStore.deleteItemAsync(secureKey);
}

export async function getIntegrationSecrets() {
  const [openaiApiKey, notionToken] = await Promise.all([
    getSecret('openaiApiKey'),
    getSecret('notionToken')
  ]);
  return { openaiApiKey, notionToken };
}

async function canUseSecureStore() {
  if (!SecureStore.isAvailableAsync) return true;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}
