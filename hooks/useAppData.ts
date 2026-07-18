import { useEffect, useState } from 'react';
import { AppData, Character, MutationEvent } from '../types';
import { appendMutationEvent, getAppData, setAppData } from '../utils/storage';
import { applyCharacterUpdate, applyDataUpdate, DataRecipe } from '../utils/mutations';
type MutationMeta = { type?: MutationEvent['type']; payload?: MutationEvent['payload'] };

export function useAppData() {
  const [data, setDataState] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppData().then(value => {
      setDataState(value);
      setLoading(false);
    });
  }, []);

  const setData = async (next: AppData) => {
    setDataState(next);
    await setAppData(next);
  };

  const updateData = async (recipe: DataRecipe, mutation?: MutationMeta) => {
    if (!data) return;
    const next = applyDataUpdate(data, recipe);
    setDataState(next);
    await setAppData(next);
    if (mutation?.type) await appendMutationEvent(mutation.type, mutation.payload);
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
