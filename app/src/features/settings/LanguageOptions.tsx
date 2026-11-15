import { View } from 'react-native';

import { OptionRow } from '@/components/ui';
import { LANGUAGE_NAMES, LANGUAGES, type Language } from '@/i18n';
import { spacing } from '@/theme';

/**
 * One row per supported language, each in its own language ("Suomi",
 * "English", "Svenska") so anyone can find theirs whatever the UI shows.
 */
export function LanguageOptions({ value, onChange }: { value: Language; onChange: (language: Language) => void }) {
  return (
    <View style={{ gap: spacing.md }} accessibilityRole="radiogroup">
      {LANGUAGES.map((language) => (
        <OptionRow
          key={language}
          icon="language"
          title={LANGUAGE_NAMES[language]}
          selected={value === language}
          onPress={() => onChange(language)}
        />
      ))}
    </View>
  );
}
