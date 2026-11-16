import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { QualityBadge } from '@/components/QualityBadge';
import { PressableScale, Text } from '@/components/ui';
import type { QualityGrade, QualityScore } from '@/domain/qualityScore';
import { strings } from '@/i18n';
import { spacing, themedStyles } from '@/theme';

import { QualitySheet } from './QualitySheet';

/** The grade with "Miksi tämä arvio?" next to it; opens the explanation. Products show their official Nutri-Score (score null). */
export function QualityButton({ title, grade, score }: { title: string; grade: QualityGrade; score: QualityScore | null }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PressableScale onPress={() => setOpen(true)} accessibilityRole="button" accessibilityHint={strings.quality.why} style={styles.row}>
        <QualityBadge grade={grade} />
        <View>
          <Text variant="label">{score ? strings.quality.title : strings.quality.nutriScoreName}</Text>
          <Text variant="caption" color="accentText">
            {strings.quality.why}
          </Text>
        </View>
      </PressableScale>
      <QualitySheet visible={open} onClose={() => setOpen(false)} title={title} score={score} grade={grade} />
    </>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      alignSelf: 'flex-start',
      minHeight: 44,
    },
  }),
);
