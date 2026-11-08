/** Soft hyphen: invisible unless the line breaks there, then shown as "-". */
export const SOFT_HYPHEN = '­';

const VOWELS = 'aeiouyäöå';
const LETTER = /[a-zåäöé]/i;

function isVowel(char: string): boolean {
  return VOWELS.includes(char.toLowerCase());
}

/** Words at least this long get break points; shorter words wrap whole. */
const MIN_LENGTH = 9;

/**
 * Inserts soft hyphens at Finnish syllable boundaries using the basic rule:
 * a syllable starts at a consonant followed by a vowel ("to-maat-ti-kas-tik-
 * kees-sa"). Long Finnish compounds then wrap with a hyphen instead of being
 * cut at an arbitrary letter in narrow cards. Vowel sequences are never split.
 */
export function hyphenateFi(text: string): string {
  return text.replace(/[A-Za-zÅÄÖåäöé]+/g, (word) => {
    if (word.length < MIN_LENGTH) return word;
    let result = word[0];
    let seenVowel = isVowel(word[0]);
    for (let i = 1; i < word.length; i++) {
      const char = word[i];
      const next = word[i + 1];
      const breakHere =
        seenVowel &&
        LETTER.test(char) &&
        !isVowel(char) &&
        next !== undefined &&
        isVowel(next) &&
        // Keep at least two letters on each side of a break.
        i >= 2 &&
        word.length - i >= 2;
      result += (breakHere ? SOFT_HYPHEN : '') + char;
      if (isVowel(char)) seenVowel = true;
    }
    return result;
  });
}
