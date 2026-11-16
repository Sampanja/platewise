import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import { Button, haptics, IconButton, Stepper, Text } from '@/components/ui';
import { INGREDIENTS_BY_ID } from '@/data/catalog';
import { usePantryStore } from '@/data/stores/pantry';
import type { Recipe } from '@/data/types';
import { plannedDeductions } from '@/domain/pantry';
import { format, strings } from '@/i18n';
import { formatAmount } from '@/lib/amounts';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles } from '@/theme';

import { ingredientName } from './format';

const t = strings.cook;

export type CookSheetProps = {
  recipe: Recipe;
  visible: boolean;
  initialServings: number;
  onClose: () => void;
};

/**
 * "Tein tämän": marks the recipe cooked and takes the ingredients it used out
 * of Ruokavarasto. The user sees each deduction and can drop rows first; the
 * toast offers undo.
 */
export function CookSheet({ recipe, visible, initialServings, onClose }: CookSheetProps) {
  const items = usePantryStore((s) => s.items);
  const cook = usePantryStore((s) => s.cook);
  const undoCook = usePantryStore((s) => s.undoCook);
  const [servings, setServings] = useState(initialServings);
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());
  const planned = useMemo(() => plannedDeductions(recipe, servings, items, INGREDIENTS_BY_ID), [recipe, servings, items]);
  const deductions = planned.filter((d) => !skipped.has(d.ingredientId));

  const confirm = () => {
    const before = usePantryStore.getState().items;
    const entry = cook({ date: today(), recipeId: recipe.id, servings }, deductions);
    haptics.success();
    onClose();
    setSkipped(new Set());
    showToast(deductions.length > 0 ? format(t.doneWithPantry, { count: deductions.length }) : t.done, {
      label: strings.common.undo,
      onPress: () => undoCook(entry.id, before),
    });
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t.title}>
      <View style={styles.servings}>
        <Text variant="bodyStrong" style={styles.flex}>
          {t.servings}
        </Text>
        <Stepper value={servings} min={1} max={12} onChange={setServings} accessibilityLabel={t.servings} />
      </View>
      <Text variant="body" color="textMuted">
        {planned.length > 0 ? t.body : t.none}
      </Text>
      {deductions.map((d) => {
        const name = ingredientName(d.ingredientId);
        return (
          <View key={d.ingredientId} style={styles.row}>
            <View style={styles.flex}>
              <Text variant="body">{name}</Text>
              <Text variant="caption" color="textSubtle">
                {`−${formatAmount(INGREDIENTS_BY_ID[d.ingredientId], d.grams)}`}
              </Text>
            </View>
            <IconButton
              icon="close"
              variant="plain"
              accessibilityLabel={format(t.removeA11y, { name })}
              onPress={() => setSkipped((set) => new Set([...set, d.ingredientId]))}
            />
          </View>
        );
      })}
      <Button label={t.confirm} onPress={confirm} />
    </Sheet>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    servings: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 52,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceRaised,
    },
  }),
);
