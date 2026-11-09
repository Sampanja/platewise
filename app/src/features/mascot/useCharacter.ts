import { useProfileStore } from '@/data/stores/profile';
import { fiCharacters, type CharacterVoice } from '@/i18n/fiCharacters';
import { DEFAULT_CHARACTER, isCharacterId, type CharacterId } from '@/theme/characters';

export type ActiveCharacter = { id: CharacterId; voice: CharacterVoice };

function resolve(id: unknown): ActiveCharacter {
  const safe = isCharacterId(id) ? id : DEFAULT_CHARACTER;
  return { id: safe, voice: fiCharacters[safe] };
}

/** The character the user picked: its id and voice. Re-renders when it changes. */
export function useCharacter(): ActiveCharacter {
  const id = useProfileStore((s) => s.characterId);
  return resolve(id);
}

/** Same outside React (notifications, services). */
export function currentCharacter(): ActiveCharacter {
  return resolve(useProfileStore.getState().characterId);
}

export function characterVoice(id: CharacterId): CharacterVoice {
  return fiCharacters[id];
}
