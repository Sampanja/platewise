import { useDeferredValue, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import { Icon, IconButton, PressableScale, Text, TextField } from '@/components/ui';
import { searchIngredients } from '@/data/catalog/search';
import { strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.pantry;

export type IngredientPickerSheetProps = {
  visible: boolean;
  title?: string;
  /** Prefilled query, e.g. a barcode product's name. */
  initialQuery?: string;
  onPick: (ingredientId: string) => void;
  onClose: () => void;
};

/**
 * Picks an ingredient from the closed ingredient table with a fuzzy search in
 * every language. Results are capped at 20, so a plain list is enough.
 */
export function IngredientPickerSheet({ visible, title, initialQuery = '', onPick, onClose }: IngredientPickerSheetProps) {
  const [query, setQuery] = useState(initialQuery);
  const [seenInitial, setSeenInitial] = useState(initialQuery);
  // A new prefill (another barcode) replaces the query.
  if (seenInitial !== initialQuery) {
    setSeenInitial(initialQuery);
    setQuery(initialQuery);
  }
  const deferred = useDeferredValue(query);
  const results = useMemo(() => searchIngredients(deferred, 20), [deferred]);

  return (
    <Sheet visible={visible} onClose={onClose} title={title ?? t.addTitle}>
      <TextField
        icon="search"
        value={query}
        onChangeText={setQuery}
        placeholder={t.searchPlaceholder}
        accessibilityLabel={t.searchPlaceholder}
        autoCorrect={false}
        autoFocus={!initialQuery}
        returnKeyType="search"
        trailing={
          query ? (
            <IconButton icon="close" variant="plain" size={32} accessibilityLabel={strings.recipes.clearSearch} onPress={() => setQuery('')} />
          ) : null
        }
      />
      {query.trim() === '' ? (
        <Text variant="caption" color="textSubtle" style={styles.hint}>
          {t.searchHint}
        </Text>
      ) : results.length === 0 ? (
        <Text variant="body" color="textMuted" style={styles.hint}>
          {t.noResults}
        </Text>
      ) : (
        <View style={styles.list}>
          {results.map(({ item }) => (
            <PressableScale
              key={item.id}
              haptic="select"
              onPress={() => onPick(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              style={styles.row}
            >
              <Text variant="body" style={styles.flex} numberOfLines={2}>
                {item.name}
              </Text>
              <Icon name="plus" size={20} color="accentText" />
            </PressableScale>
          ))}
        </View>
      )}
    </Sheet>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    hint: {
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.sm,
    },
    list: {
      gap: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 52,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceRaised,
    },
    flex: {
      flex: 1,
    },
  }),
);
