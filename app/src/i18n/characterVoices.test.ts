import { describe, expect, it } from '@jest/globals';

import { CHARACTER_IDS, CHARACTER_THEMES } from '@/theme/characters';

import type { CharacterVoice } from './fiCharacters';
import { LANGUAGES, type Language } from './languages';
import { CHARACTER_VOICES } from './registry';

/** Every string a character can say, flattened. */
function lines(voice: CharacterVoice): string[] {
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(voice);
  return out;
}

// Gamification and the characters reward habits only (CLAUDE.md): nothing about
// eating less, calories, weight loss or deficits, and no guilt – in every language.
const FORBIDDEN: Record<Language, RegExp[]> = {
  fi: [/kalori/i, /kcal/i, /laihdu/i, /laihtu/i, /(^|[^a-zåäö])paino/i, /vaje/i, /vähemmän/i, /nälkä/i, /dieet/i, /herkuttelit/i, /lipsu/i, /syyllis/i],
  en: [/calori/i, /kcal/i, /lose weight/i, /weight loss/i, /\bslim/i, /\bweigh/i, /deficit/i, /\beat(ing)? less\b/i, /\bhung(ry|er)\b/i, /\bdiet/i, /\bcheat/i, /\bguilt/i, /\bslip(ped)?\b/i],
  sv: [/kalori/i, /kcal/i, /gå ner i vikt/i, /\bbanta/i, /\bvikt(en|er)?\b/i, /underskott/i, /äta mindre/i, /\bhung(er|rig)/i, /\bdiet/i, /\bfusk/i, /\bskuld/i, /\bslarv/i],
};

const NOT_A_DOCTOR: Record<Language, RegExp> = {
  fi: /en ole lääkäri/i,
  en: /not a doctor/i,
  sv: /inte läkare/i,
};

describe.each(LANGUAGES)('character voices (%s)', (lang) => {
  const voices = CHARACTER_VOICES[lang];

  it('has a voice and a theme for every character', () => {
    expect(Object.keys(voices).sort()).toEqual([...CHARACTER_IDS].sort());
    for (const id of CHARACTER_IDS) expect(CHARACTER_THEMES[id].id).toBe(id);
  });

  it('gives every character a unique name, the same in every language', () => {
    const names = CHARACTER_IDS.map((id) => voices[id].name);
    expect(new Set(names).size).toBe(names.length);
    for (const id of CHARACTER_IDS) expect(voices[id].name).toBe(CHARACTER_VOICES.fi[id].name);
  });

  it.each(CHARACTER_IDS)('%s: every line is filled in', (id) => {
    for (const line of lines(voices[id])) expect(line.trim().length).toBeGreaterThan(0);
  });

  it.each(CHARACTER_IDS)('%s: never talks about eating less, calories or weight', (id) => {
    for (const line of lines(voices[id])) {
      for (const word of FORBIDDEN[lang]) expect({ line, match: word.test(line) }).toEqual({ line, match: false });
    }
  });

  it.each(CHARACTER_IDS)('%s: the chat intro says it is not a doctor', (id) => {
    expect(voices[id].chat.intro).toMatch(NOT_A_DOCTOR[lang]);
  });

  it.each(CHARACTER_IDS)('%s: notifications are short and neutral', (id) => {
    for (const line of Object.values(voices[id].notify)) expect(line.length).toBeLessThanOrEqual(80);
  });

  it.each(CHARACTER_IDS)('%s: names its own name in the picker intro and chat', (id) => {
    const voice = voices[id];
    expect(voice.intro).toContain(voice.name);
    expect(voice.chat.intro).toContain(voice.name);
    expect(voice.chat.thinking).toContain(voice.name);
  });

  it.each(CHARACTER_IDS)('%s: has exactly three distinct traits', (id) => {
    expect(new Set(voices[id].traits).size).toBe(3);
  });
});
