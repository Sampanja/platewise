import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SelectChip, Text, TextField } from '@/components/ui';
import { INGREDIENTS_BY_ID } from '@/data/catalog';
import { PANTRY_LEVELS, type PantryAmount } from '@/data/types';
import { levelGrams } from '@/domain/pantry';
import { parseAmount } from '@/domain/nutrition';
import { strings } from '@/i18n';
import { foodInputText, foodUnitLabel, gramsFromInput } from '@/lib/amounts';
import { spacing, themedStyles } from '@/theme';

const t = strings.pantry;

export type AmountPickerProps = {
  ingredientId: string;
  amount: PantryAmount;
  onChange: (amount: PantryAmount) => void;
};

/** "Vähän / Puolet / Paljon" or an exact amount in grams (stored metric). */
export function AmountPicker({ ingredientId, amount, onChange }: AmountPickerProps) {
  const ingredient = INGREDIENTS_BY_ID[ingredientId];
  // Typed in the user's units (g or oz); stored in grams.
  const toText = (grams: number) => foodInputText(grams);
  const [text, setText] = useState(amount.kind === 'grams' ? toText(amount.grams) : '');
  const exact = amount.kind === 'grams';

  const chooseExact = () => {
    const grams = amount.kind === 'level' && ingredient ? levelGrams(amount.level, ingredient) : 0;
    setText(toText(grams));
    onChange({ kind: 'grams', grams });
  };
  const changeGrams = (value: string) => {
    const clean = value.replace(/[^\d,.]/g, '');
    setText(clean);
    const typed = parseAmount(clean) ?? 0;
    onChange({ kind: 'grams', grams: gramsFromInput(typed) });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={t.amount}>
        {PANTRY_LEVELS.map((level) => (
          <SelectChip
            key={level}
            role="radio"
            label={t.levels[level]}
            selected={amount.kind === 'level' && amount.level === level}
            onPress={() => onChange({ kind: 'level', level })}
          />
        ))}
        <SelectChip role="radio" label={t.exactShort} selected={exact} onPress={chooseExact} />
      </View>
      {exact ? (
        <View style={styles.exact}>
          <TextField
            value={text}
            onChangeText={changeGrams}
            keyboardType="decimal-pad"
            accessibilityLabel={t.gramsLabel}
            placeholder="0"
            style={styles.field}
          />
          <Text variant="body" color="textMuted">
            {foodUnitLabel()}
          </Text>
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
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    exact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    field: {
      flex: 1,
    },
  }),
);
