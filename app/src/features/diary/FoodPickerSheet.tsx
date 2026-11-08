import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import { Icon, PressableScale, Text, TextField } from '@/components/ui';
import { FOODS } from '@/data/catalog';
import { format, formatInteger, strings } from '@/i18n';
import { colors, spacing } from '@/theme';

import { searchFoods } from './searchFoods';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onPick: (foodId: string) => void;
};

/** Bottom sheet with a food search, e.g. to correct a recognised food. */
export function FoodPickerSheet({ visible, title, onClose, onPick }: Props) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchFoods(FOODS, query).slice(0, 20), [query]);

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <TextField
        icon="search"
        value={query}
        onChangeText={setQuery}
        placeholder={strings.diaryAdd.searchPlaceholder}
        accessibilityLabel={strings.diaryAdd.searchPlaceholder}
        autoCorrect={false}
      />
      <View>
        {results.map((food) => (
          <PressableScale
            key={food.id}
            onPress={() => {
              setQuery('');
              onPick(food.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={food.name}
            style={styles.row}
          >
            <View style={styles.flex}>
              <Text variant="body">{food.name}</Text>
              <Text variant="caption" color="textSubtle">
                {format(strings.diaryAdd.per100, { kcal: formatInteger(food.per100g.kcal) })}
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color="textSubtle" />
          </PressableScale>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
