import { StyleSheet, View } from 'react-native';

import { Card, IconButton, SelectChip, Stepper, Text, TextField } from '@/components/ui';
import type { DiaryMeal, FoodPortion, Macros } from '@/data/types';
import { DIARY_MEALS } from '@/domain/diary';
import { format, formatInteger, strings } from '@/i18n';
import { formatCount } from '@/lib/amounts';
import { spacing } from '@/theme';

type FoodProps = {
  kind: 'food';
  grams: number;
  onGramsChange: (grams: number) => void;
  portions: readonly FoodPortion[];
};

type RecipeProps = {
  kind: 'recipe';
  servings: number;
  onServingsChange: (servings: number) => void;
};

type Props = (FoodProps | RecipeProps) & {
  meal: DiaryMeal;
  onMealChange: (meal: DiaryMeal) => void;
  /** Macros for the chosen amount. */
  preview: Macros;
};

const MAX_GRAMS = 2000;
const HUNDRED_G = format(strings.units.g, { value: 100 });

/** Amount (portion chips + grams, or servings), meal choice and a macro preview. */
export function AmountEditor(props: Props) {
  const { meal, onMealChange, preview } = props;
  const t = strings.food;

  return (
    <View style={styles.wrap}>
      {props.kind === 'food' ? (
        <View style={styles.section}>
          <Text variant="overline" color="textSubtle" accessibilityRole="header">
            {t.portions}
          </Text>
          <View style={styles.chips}>
            {[...props.portions, { label: HUNDRED_G, grams: 100 }].map((portion) => (
              <SelectChip
                key={portion.label}
                role="radio"
                label={portion.label === HUNDRED_G ? portion.label : `${portion.label} · ${format(strings.units.g, { value: formatInteger(portion.grams) })}`}
                selected={Math.round(props.grams) === Math.round(portion.grams)}
                onPress={() => props.onGramsChange(portion.grams)}
              />
            ))}
          </View>
          <Text variant="overline" color="textSubtle">
            {t.grams}
          </Text>
          <View style={styles.gramsRow}>
            <IconButton
              icon="minus"
              haptic="select"
              accessibilityLabel={t.minus10}
              disabled={props.grams <= 0}
              onPress={() => props.onGramsChange(Math.max(0, Math.round(props.grams) - 10))}
            />
            <TextField
              value={props.grams > 0 ? String(Math.round(props.grams)) : ''}
              onChangeText={(text) => {
                const value = Number(text.replace(/\D/g, ''));
                props.onGramsChange(Math.min(MAX_GRAMS, value));
              }}
              keyboardType="number-pad"
              accessibilityLabel={t.gramsA11y}
              maxLength={4}
              style={styles.flex}
              trailing={
                <Text variant="label" color="textSubtle">
                  {strings.common.gUnit}
                </Text>
              }
            />
            <IconButton
              icon="plus"
              haptic="select"
              accessibilityLabel={t.plus10}
              disabled={props.grams >= MAX_GRAMS}
              onPress={() => props.onGramsChange(Math.min(MAX_GRAMS, Math.round(props.grams) + 10))}
            />
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <Text variant="overline" color="textSubtle" accessibilityRole="header">
            {t.servings}
          </Text>
          <Stepper
            size="large"
            value={props.servings}
            min={0.5}
            max={6}
            step={0.5}
            onChange={props.onServingsChange}
            format={(v) => formatCount(v)}
            accessibilityLabel={t.servings}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text variant="overline" color="textSubtle" accessibilityRole="header">
          {strings.diaryAdd.meal}
        </Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {DIARY_MEALS.map((option) => (
            <SelectChip
              key={option}
              role="radio"
              label={strings.diaryMeals[option]}
              selected={option === meal}
              onPress={() => onMealChange(option)}
            />
          ))}
        </View>
      </View>

      <Card style={styles.preview}>
        <Text variant="overline" color="textSubtle">
          {t.preview}
        </Text>
        <View style={styles.macros}>
          <MacroCell value={preview.kcal} unit={strings.common.kcalUnit} label={strings.macros.energy} />
          <MacroCell value={preview.proteinG} unit={strings.common.gUnit} label={strings.macros.protein} />
          <MacroCell value={preview.carbsG} unit={strings.common.gUnit} label={strings.macros.carbs} />
          <MacroCell value={preview.fatG} unit={strings.common.gUnit} label={strings.macros.fat} />
        </View>
      </Card>
    </View>
  );
}

function MacroCell({ value, unit, label }: { value: number; unit: string; label: string }) {
  return (
    <View
      style={styles.cell}
      accessible
      accessibilityLabel={`${label} ${formatInteger(value)} ${unit}`}
    >
      <Text variant="number">
        {formatInteger(value)}
        <Text variant="caption" color="textSubtle">
          {' '}
          {unit}
        </Text>
      </Text>
      <Text variant="caption" color="textSubtle" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gramsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  preview: {
    gap: spacing.md,
  },
  macros: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    gap: spacing.xxs,
  },
});
