import { describe, expect, it } from '@jest/globals';

import { CHARACTER_IDS, CHARACTER_THEMES } from '@/theme/characters';

import { fiCharacters, type CharacterVoice } from './fiCharacters';

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
// eating less, calories, weight loss or deficits, and no guilt.
const FORBIDDEN = [/kalori/i, /kcal/i, /laihdu/i, /laihtu/i, /(^|[^a-zåäö])paino/i, /vaje/i, /vähemmän/i, /nälkä/i, /dieet/i, /herkuttelit/i, /lipsu/i, /syyllis/i];

describe('character voices', () => {
  it('has a voice and a theme for every character', () => {
    expect(Object.keys(fiCharacters).sort()).toEqual([...CHARACTER_IDS].sort());
    for (const id of CHARACTER_IDS) expect(CHARACTER_THEMES[id].id).toBe(id);
  });

  it('gives every character a unique name', () => {
    const names = CHARACTER_IDS.map((id) => fiCharacters[id].name);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(CHARACTER_IDS)('%s: every line is filled in', (id) => {
    for (const line of lines(fiCharacters[id])) expect(line.trim().length).toBeGreaterThan(0);
  });

  it.each(CHARACTER_IDS)('%s: never talks about eating less, calories or weight', (id) => {
    for (const line of lines(fiCharacters[id])) {
      for (const word of FORBIDDEN) expect({ line, match: word.test(line) }).toEqual({ line, match: false });
    }
  });

  it.each(CHARACTER_IDS)('%s: the chat intro says it is not a doctor', (id) => {
    expect(fiCharacters[id].chat.intro).toMatch(/en ole lääkäri/i);
  });

  it.each(CHARACTER_IDS)('%s: notifications are short and neutral', (id) => {
    for (const line of Object.values(fiCharacters[id].notify)) expect(line.length).toBeLessThanOrEqual(80);
  });

  it.each(CHARACTER_IDS)('%s: names its own name in the picker intro and chat', (id) => {
    const voice = fiCharacters[id];
    expect(voice.intro).toContain(voice.name);
    expect(voice.chat.intro).toContain(voice.name);
    expect(voice.chat.thinking).toContain(voice.name);
  });

  it.each(CHARACTER_IDS)('%s: has exactly three distinct traits', (id) => {
    expect(new Set(fiCharacters[id].traits).size).toBe(3);
  });
});
