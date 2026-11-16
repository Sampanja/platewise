import { DEFAULT_CHARACTER, isCharacterId, type CharacterId } from '@/theme/characters';

/**
 * The cast was renewed in November 2026: eight local characters became six
 * internationally known ones. A saved character id from before maps to the
 * closest new one (docs/MASCOT.md, "Siirto vanhoista hahmoista"): the same
 * food and voice where it still exists, otherwise the closest colours or voice.
 */
export const RETIRED_CHARACTERS: Readonly<Record<string, CharacterId>> = {
  porkkis: 'karo',
  aava: 'avo',
  tomppa: 'tomo',
  mustis: 'blu',
  sitru: 'lemo',
  // Chanterelle's gold theme is closest to the carrot's orange.
  kanttu: 'karo',
  // Rye bread's dry humour is closest to the lemon's wit.
  ruis: 'lemo',
};

export type CharacterMigration = {
  id: CharacterId;
  /** True when the saved character no longer exists and the user should be told once. */
  changed: boolean;
};

/** The character to use for a saved id; anything unknown falls back to the default without a notice. */
export function migrateCharacter(saved: unknown): CharacterMigration {
  if (isCharacterId(saved)) return { id: saved, changed: false };
  if (typeof saved === 'string' && saved in RETIRED_CHARACTERS) {
    return { id: RETIRED_CHARACTERS[saved], changed: true };
  }
  return { id: DEFAULT_CHARACTER, changed: false };
}
