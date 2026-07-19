import { useEffect, useState } from 'react';
import { AppData, Character, MutationEvent } from '../types';
import { appendMutationEvent, getAppData, setAppData, setStorageUser, subscribeToAppData } from '../utils/storage';
import { applyCharacterUpdate, applyDataUpdate, DataRecipe } from '../utils/mutations';
import { useAuth } from './useAuth';
type MutationMeta = { type?: MutationEvent['type']; payload?: MutationEvent['payload'] };

export function useAppData() {
  const { user, loading: authLoading } = useAuth();
  const [data, setDataState] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) {
      setLoading(true);
      return () => { cancelled = true; };
    }
    if (!user) {
      setStorageUser(null);
      setDataState(null);
      setLoading(false);
      return () => { cancelled = true; };
    }
    setLoading(true);
    setStorageUser(user.uid);
    getAppData(user.uid).then(value => {
      if (cancelled) return;
      setDataState(value ? attachAuthUser(value, user) : null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [authLoading, user]);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeToAppData((next, userId) => {
      if (userId !== user.uid) return;
      setDataState(next ? attachAuthUser(next, user) : null);
      setLoading(false);
    });
  }, [user]);

  const setData = async (next: AppData): Promise<AppData | null> => {
    if (!user) return null;
    const attached = attachAuthUser(next, user);
    setDataState(attached);
    await setAppData(attached, user.uid);
    return attached;
  };

  const updateData = async (recipe: DataRecipe, mutation?: MutationMeta): Promise<AppData | null> => {
    if (!data || !user) return null;
    const next = applyDataUpdate(data, recipe);
    const attached = attachAuthUser(next, user);
    setDataState(attached);
    await setAppData(attached, user.uid);
    if (mutation?.type) await appendMutationEvent(mutation.type, mutation.payload);
    return attached;
  };

  const updateCharacter = async (characterId: string, patch: Partial<Character>, mutation?: MutationMeta) => {
    await updateData(
      current => applyCharacterUpdate(current, characterId, patch),
      mutation ?? { type: 'character.updated', payload: { characterId, fields: Object.keys(patch) } }
    );
  };

  const updateIntegrations = async (patch: Partial<AppData['integrations']>) => {
    await updateData(current => ({
      ...current,
      integrations: { ...current.integrations, ...patch }
    }));
  };

  return { data, setData, updateData, updateCharacter, updateIntegrations, loading };
}

function attachAuthUser(data: AppData, user: { uid: string; email: string | null; displayName: string | null }) {
  return {
    ...data,
    userProfile: {
      ...data.userProfile,
      authUserId: user.uid,
      email: user.email ?? data.userProfile?.email ?? '',
      displayName: data.userProfile?.displayName || user.displayName || ''
    }
  };
}
