import { afterEach, describe, expect, it } from '@jest/globals';

import { OCCUPATION_IDS } from '@/domain/occupations';
import { LANGUAGES } from '@/i18n/languages';
import { setActiveLanguage } from '@/i18n/locale';
import { STRING_TABLES } from '@/i18n/registry';

import { occupationName, searchOccupations } from './occupationSearch';

const first = (query: string) => searchOccupations(query)[0];

describe('occupation search', () => {
  afterEach(() => setActiveLanguage('fi'));

  it('has about a hundred occupations, each named in every language', () => {
    expect(OCCUPATION_IDS.length).toBeGreaterThanOrEqual(100);
    for (const language of LANGUAGES) {
      for (const id of OCCUPATION_IDS) expect(STRING_TABLES[language].occupations[id].split('|')[0].trim()).not.toBe('');
    }
  });

  it('finds occupations in every language, whatever the UI language', () => {
    expect(first('sairaanhoitaja')).toMatchObject({ id: 'nurse', level: 3 });
    expect(first('nurse')).toMatchObject({ id: 'nurse', level: 3 });
    expect(first('sjuksköterska')).toMatchObject({ id: 'nurse', level: 3 });
    expect(first('koodari')).toMatchObject({ id: 'developer', level: 1 });
    expect(first('rakennus')).toMatchObject({ id: 'construction', level: 4 });
    expect(first('metsuri')).toMatchObject({ id: 'forestry', level: 5 });
  });

  it('puts pupils and students at the sitting level', () => {
    expect(first('opiskelija')).toMatchObject({ id: 'student', level: 1 });
    expect(first('lukio')).toMatchObject({ id: 'pupil', level: 1 });
    expect(first('student')).toMatchObject({ level: 1 });
  });

  it('finds life situations too', () => {
    expect(first('eläkkeellä')).toMatchObject({ kind: 'situation', id: 'retired' });
    expect(first('vuorotyö')).toMatchObject({ kind: 'situation', id: 'shift' });
    expect(first('retired')).toMatchObject({ kind: 'situation', id: 'retired' });
  });

  it('tolerates typos and returns nothing for nonsense', () => {
    expect(first('sairanhoitaja')).toMatchObject({ id: 'nurse' });
    expect(searchOccupations('qwxyz')).toEqual([]);
    expect(searchOccupations('')).toEqual([]);
  });

  it('shows the first name in the UI language', () => {
    expect(occupationName({ kind: 'occupation', id: 'nurse' })).toBe('Sairaanhoitaja');
    setActiveLanguage('en');
    expect(occupationName({ kind: 'occupation', id: 'nurse' })).toBe('Nurse');
    expect(occupationName({ kind: 'situation', id: 'home' })).toBe('At home with children');
  });
});
