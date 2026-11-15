import { describe, expect, it } from '@jest/globals';

import { LANGUAGES } from './languages';
import { CHARACTER_VOICES, STRING_TABLES } from './registry';

/** Every leaf path with its value: "recipes.title" → "Reseptit"; arrays by index plus their length. */
function leaves(node: unknown, path = ''): Map<string, unknown> {
  const out = new Map<string, unknown>();
  const walk = (value: unknown, at: string) => {
    if (Array.isArray(value)) {
      out.set(`${at}.length`, value.length);
      value.forEach((item, index) => walk(item, `${at}[${index}]`));
    } else if (typeof value === 'object' && value !== null) {
      for (const [key, child] of Object.entries(value)) walk(child, at ? `${at}.${key}` : key);
    } else {
      out.set(at, value);
    }
  };
  walk(node, path);
  return out;
}

const placeholders = (text: unknown) =>
  typeof text === 'string' ? [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort() : [];

const reference = leaves(STRING_TABLES.fi);
const referenceVoices = leaves(CHARACTER_VOICES.fi);

describe.each(LANGUAGES.filter((lang) => lang !== 'fi'))('%s strings', (lang) => {
  const table = leaves(STRING_TABLES[lang]);
  const voices = leaves(CHARACTER_VOICES[lang]);

  it('has exactly the Finnish keys', () => {
    expect([...table.keys()].filter((key) => !reference.has(key))).toEqual([]);
    expect([...reference.keys()].filter((key) => !table.has(key))).toEqual([]);
  });

  it('keeps every placeholder', () => {
    const broken = [...reference].filter(([key, value]) => placeholders(value).join() !== placeholders(table.get(key)).join());
    expect(broken.map(([key]) => key)).toEqual([]);
  });

  it('has no empty strings', () => {
    expect([...table].filter(([, value]) => value === '').map(([key]) => key)).toEqual([]);
  });

  it('has a voice for every character with the same lines', () => {
    expect([...voices.keys()].filter((key) => !referenceVoices.has(key))).toEqual([]);
    expect([...referenceVoices.keys()].filter((key) => !voices.has(key))).toEqual([]);
    const empty = [...voices].filter(([, value]) => value === '').map(([key]) => key);
    expect(empty).toEqual([]);
  });
});
