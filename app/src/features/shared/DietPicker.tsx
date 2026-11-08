import { StyleSheet, View } from 'react-native';

import { SelectChip, Text } from '@/components/ui';
import { ALLERGENS, DIETS } from '@/data/catalog';
import type { AllergenCode, DietCode } from '@/data/types';
import { strings } from '@/i18n';
import { spacing } from '@/theme';

type Props = {
  allergens: readonly AllergenCode[];
  diets: readonly DietCode[];
  onToggleAllergen: (code: AllergenCode) => void;
  onToggleDiet: (code: DietCode) => void;
  /** Codes that are always on and cannot be removed here (profile values in the questionnaire). */
  lockedAllergens?: readonly AllergenCode[];
  lockedDiets?: readonly DietCode[];
};

/** Allergen and diet chips. Locked chips show as selected and do nothing when tapped. */
export function DietPicker({
  allergens,
  diets,
  onToggleAllergen,
  onToggleDiet,
  lockedAllergens = [],
  lockedDiets = [],
}: Props) {
  return (
    <View style={styles.sections}>
      <View style={styles.section}>
        <Text variant="overline" color="textSubtle" accessibilityRole="header">
          {strings.plan.diet.allergens}
        </Text>
        <View style={styles.chips}>
          {ALLERGENS.map((code) => {
            const locked = lockedAllergens.includes(code);
            return (
              <SelectChip
                key={code}
                label={strings.allergens[code]}
                selected={locked || allergens.includes(code)}
                disabled={locked}
                accessibilityHint={locked ? strings.plan.diet.fromProfileHint : undefined}
                onPress={() => onToggleAllergen(code)}
              />
            );
          })}
        </View>
      </View>
      <View style={styles.section}>
        <Text variant="overline" color="textSubtle" accessibilityRole="header">
          {strings.plan.diet.diets}
        </Text>
        <View style={styles.chips}>
          {DIETS.map((code) => {
            const locked = lockedDiets.includes(code);
            return (
              <SelectChip
                key={code}
                label={strings.diets[code]}
                selected={locked || diets.includes(code)}
                disabled={locked}
                accessibilityHint={locked ? strings.plan.diet.fromProfileHint : strings.dietHints[code]}
                onPress={() => onToggleDiet(code)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sections: {
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
});
