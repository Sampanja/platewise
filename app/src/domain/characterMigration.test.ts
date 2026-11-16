import { describe, expect, it } from '@jest/globals';

import { CHARACTER_IDS } from '@/theme/characters';

import { migrateCharacter, RETIRED_CHARACTERS } from './characterMigration';

describe('migrateCharacter', () => {
  it('keeps a current character without a notice', () => {
    for (const id of CHARACTER_IDS) expect(migrateCharacter(id)).toEqual({ id, changed: false });
  });

  it('moves every retired character to an existing one and asks for a notice', () => {
    for (const [old, next] of Object.entries(RETIRED_CHARACTERS)) {
      expect(CHARACTER_IDS).toContain(next);
      expect(migrateCharacter(old)).toEqual({ id: next, changed: true });
    }
  });

  it('keeps the same food where it still exists', () => {
    expect(migrateCharacter('porkkis').id).toBe('karo');
    expect(migrateCharacter('aava').id).toBe('avo');
    expect(migrateCharacter('tomppa').id).toBe('tomo');
    expect(migrateCharacter('mustis').id).toBe('blu');
    expect(migrateCharacter('sitru').id).toBe('lemo');
  });

  it('falls back to the default for anything unknown, without a notice', () => {
    expect(migrateCharacter(undefined)).toEqual({ id: 'nuppu', changed: false });
    expect(migrateCharacter(42)).toEqual({ id: 'nuppu', changed: false });
    expect(migrateCharacter('dragonfruit')).toEqual({ id: 'nuppu', changed: false });
  });
});
