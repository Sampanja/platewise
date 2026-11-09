import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Chip, Text } from '@/components/ui';
import { strings } from '@/i18n';
import { colors, spacing, themedStyles } from '@/theme';

type Doc = 'privacy' | 'terms' | 'sources';

const DOCS: Record<Doc, { title: string; body: string; placeholder: boolean }> = {
  privacy: { title: strings.legal.privacyTitle, body: strings.legal.privacyBody, placeholder: true },
  terms: { title: strings.legal.termsTitle, body: strings.legal.termsBody, placeholder: true },
  sources: { title: strings.legal.sourcesTitle, body: strings.legal.sourcesBody, placeholder: false },
};

/** Privacy policy, terms and sources. The first two are placeholders until launch. */
export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: Doc }>();
  const content = DOCS[doc] ?? DOCS.sources;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={content.title} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          {content.placeholder ? <Chip tone="accent" label={strings.common.comingSoon} /> : null}
          <Text variant="display" accessibilityRole="header">
            {content.title}
          </Text>
        </View>
        <Text variant="body" color="textMuted">
          {content.body}
        </Text>
      </ScrollView>
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
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
      gap: spacing.lg,
    },
    titleBlock: {
      gap: spacing.sm,
    },
  }),
);
