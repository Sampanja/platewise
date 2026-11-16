import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Icon, PressableScale, Text } from '@/components/ui';
import { useNutrientReference } from '@/data/hooks';
import type { Macros } from '@/data/types';
import { lowNutrients } from '@/domain/nutrients';
import { strings } from '@/i18n';
import { spacing, themedStyles } from '@/theme';

import { NutrientList } from './NutrientList';

const t = strings.nutrientInfo;

export type DayNutrientsCardProps = {
  totals: Macros;
  entryCount: number;
  /** Some entries have no nutrient data (quick entries): the totals may be low. */
  partial: boolean;
};

/** Päiväkirja → Tänään: "Ravintoaineet", folded by default so the day stays easy to read. */
export function DayNutrientsCard({ totals, entryCount, partial }: DayNutrientsCardProps) {
  const reference = useNutrientReference();
  const [open, setOpen] = useState(false);
  // One gentle hint for the first nutrient clearly under its recommendation.
  const low = entryCount > 0 ? lowNutrients(totals, reference)[0] : undefined;
  return (
    <Card style={styles.card}>
      <PressableScale
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${t.title}. ${open ? t.hide : t.show}`}
        style={styles.header}
      >
        <View style={styles.flex}>
          <Text variant="heading" accessibilityRole="header">
            {t.title}
          </Text>
          <Text variant="caption" color="textSubtle" numberOfLines={open ? undefined : 2}>
            {entryCount === 0 ? t.empty : low ? t.sources[low] : t.intro}
          </Text>
        </View>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={20} color="textSubtle" />
      </PressableScale>
      {open && entryCount > 0 ? (
        <>
          <Text variant="caption" color="textMuted">
            {t.intro}
          </Text>
          <NutrientList values={totals} reference={reference} />
          {partial ? (
            <Text variant="caption" color="textSubtle">
              {t.partial}
            </Text>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    card: {
      gap: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    flex: {
      flex: 1,
      gap: spacing.xxs,
    },
  }),
);
