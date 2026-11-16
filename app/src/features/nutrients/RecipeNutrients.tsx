import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, PressableScale, Text } from '@/components/ui';
import { useNutrientReference } from '@/data/hooks';
import type { Macros } from '@/data/types';
import { strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

import { NutrientList } from './NutrientList';

const t = strings.nutrientInfo;

/** Reseptisivu: vitamins and minerals per serving behind one tap, as a share of the daily reference. */
export function RecipeNutrients({ perServing }: { perServing: Macros }) {
  const reference = useNutrientReference();
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      <PressableScale
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.toggle}
      >
        <Icon name="leaf" size={18} color="accentText" />
        <Text variant="bodyStrong" color="accentText" style={styles.flex}>
          {open ? t.hide : t.show}
        </Text>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={18} color="accentText" />
      </PressableScale>
      {open ? (
        <View style={styles.body}>
          <Text variant="caption" color="textSubtle">
            {t.recipeIntro}
          </Text>
          <NutrientList values={perServing} reference={reference} mode="share" />
        </View>
      ) : null}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    wrap: {
      gap: spacing.sm,
    },
    toggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 48,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.accentSoft,
    },
    flex: {
      flex: 1,
    },
    body: {
      gap: spacing.sm,
    },
  }),
);
