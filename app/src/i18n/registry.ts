import type { CharacterId } from '@/theme/characters';

import { en } from './en';
import { enCharacters } from './enCharacters';
import { fi } from './fi';
import { fiCharacters, type CharacterVoice } from './fiCharacters';
import type { Language } from './languages';
import { activeLanguage } from './locale';
import { sv } from './sv';
import { svCharacters } from './svCharacters';
import type { Strings } from './types';

/**
 * Every language's tables. A new language adds its files and one line in
 * each record; i18n/keys.test.ts checks that the keys match Finnish.
 */
export const STRING_TABLES: Readonly<Record<Language, Strings>> = { fi, en, sv };

export const CHARACTER_VOICES: Readonly<Record<Language, Readonly<Record<CharacterId, CharacterVoice>>>> = {
  fi: fiCharacters,
  en: enCharacters,
  sv: svCharacters,
};

export function activeTable(): Strings {
  return STRING_TABLES[activeLanguage()];
}

export function activeCharacterVoices(): Readonly<Record<CharacterId, CharacterVoice>> {
  return CHARACTER_VOICES[activeLanguage()];
}
