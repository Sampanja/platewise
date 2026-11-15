import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, haptics, Text } from '@/components/ui';
import { useLanguage } from '@/data/hooks';
import { useProfileStore } from '@/data/stores/profile';
import { strings } from '@/i18n';
import { colors, spacing, themedStyles } from '@/theme';

import { LanguageOptions } from './LanguageOptions';

/**
 * The very first screen: the phone's language is preselected (English if it
 * is not supported). Tapping a language switches the whole app at once, so
 * this screen and everything after it is already in the chosen language.
 */
export function LanguageStep() {
  const language = useLanguage();
  const update = useProfileStore((s) => s.update);
  const t = strings.language;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="display" accessibilityRole="header">
            {t.pickerTitle}
          </Text>
          <Text variant="body" color="textMuted">
            {t.pickerBody}
          </Text>
        </View>
        <LanguageOptions value={language} onChange={(next) => update({ language: next })} />
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label={t.continue}
          haptic="none"
          onPress={() => {
            haptics.success();
            update({ language, languageChosen: true });
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: spacing.xl,
      paddingTop: spacing.xxl,
      gap: spacing.xl,
    },
    header: {
      gap: spacing.sm,
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
    },
  }),
);
