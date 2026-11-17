import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, haptics, IconButton, Text } from '@/components/ui';
import { useUnits } from '@/data/hooks';
import { useProfileStore } from '@/data/stores/profile';
import type { UnitPrefs } from '@/domain/units';
import { strings } from '@/i18n';
import { colors, spacing, themedStyles } from '@/theme';

import { UnitsEditor } from './UnitsEditor';

/**
 * Second screen of the first run, right after the language: the phone's
 * region suggests the units (metric almost everywhere, imperial in the US),
 * and the user sees and confirms them. Nothing is applied until confirmed,
 * so the examples on this screen are the only place the choice shows.
 */
export function UnitsStep() {
  const suggested = useUnits();
  const update = useProfileStore((s) => s.update);
  const [draft, setDraft] = useState<UnitPrefs>(suggested);
  const t = strings.unitSystems;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <IconButton
          icon="chevronLeft"
          variant="plain"
          accessibilityLabel={strings.common.back}
          onPress={() => update({ languageChosen: false })}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="display" accessibilityRole="header">
            {t.title}
          </Text>
          <Text variant="body" color="textMuted">
            {t.onboardingBody}
          </Text>
        </View>
        <UnitsEditor value={draft} onChange={setDraft} />
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label={t.confirm}
          haptic="none"
          onPress={() => {
            haptics.success();
            update({ units: draft, unitsChosen: true });
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
    topBar: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    content: {
      padding: spacing.xl,
      paddingTop: spacing.md,
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
