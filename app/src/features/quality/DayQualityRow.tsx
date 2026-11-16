import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { QualityBadge } from '@/components/QualityBadge';
import { PressableScale, Text } from '@/components/ui';
import type { DiaryEntry } from '@/data/types';
import { strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

import { dayQuality } from './entryQuality';
import { QualitySheet } from './QualitySheet';

const t = strings.quality;

/** Päiväkirja → Tänään: the day's combined quality score, explained on tap. Hidden until something is logged. */
export function DayQualityRow({ entries }: { entries: readonly DiaryEntry[] }) {
  const score = useMemo(() => dayQuality(entries), [entries]);
  const [open, setOpen] = useState(false);
  if (!score) return null;
  return (
    <>
      <PressableScale onPress={() => setOpen(true)} accessibilityRole="button" accessibilityHint={t.why} style={styles.row}>
        <QualityBadge grade={score.grade} />
        <View style={styles.flex}>
          <Text variant="bodyStrong">{t.dayTitle}</Text>
          <Text variant="caption" color="accentText">
            {t.why}
          </Text>
        </View>
      </PressableScale>
      <QualitySheet visible={open} onClose={() => setOpen(false)} title={t.dayTitle} score={score} grade={score.grade} intro={t.dayIntro} />
    </>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 56,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
    },
    flex: {
      flex: 1,
    },
  }),
);
