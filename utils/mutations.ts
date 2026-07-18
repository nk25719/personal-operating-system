import { AppData, Character } from '../types';

export type DataRecipe = (current: AppData) => AppData;

export function applyDataUpdate(current: AppData, recipe: DataRecipe): AppData {
  return recipe(current);
}

export function applyCharacterUpdate(current: AppData, characterId: string, patch: Partial<Character>): AppData {
  return {
    ...current,
    characters: current.characters.map(character => character.id === characterId ? { ...character, ...patch } : character)
  };
}
