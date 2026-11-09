import { ScrollView, StyleSheet, View } from 'react-native';

import { RecipeCard } from '@/components/RecipeCard';
import { Skeleton, Text } from '@/components/ui';
import type { Recipe } from '@/data/types';
import { strings } from '@/i18n';
import { spacing, themedStyles } from '@/theme';

export type RecipeRowItem = { key: string; recipe: Recipe; overline?: string };

type Props = {
  title: string;
  hint?: string;
  items: readonly RecipeRowItem[];
  loading?: boolean;
};

const CARD_WIDTH = 176;

/** Horizontally scrolling strip of recipe cards with a heading. */
export function RecipeRow({ title, hint, items, loading = false }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        {hint ? (
          <Text variant="caption" color="textSubtle">
            {hint}
          </Text>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.strip}
      >
        {loading ? (
          <View
            style={styles.skeletons}
            accessible
            accessibilityLabel={strings.common.loading}
            accessibilityState={{ busy: true }}
          >
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <Skeleton height={CARD_WIDTH / 1.1} />
                <Skeleton height={16} width="85%" />
                <Skeleton height={14} width="50%" />
              </View>
            ))}
          </View>
        ) : (
          items.map((item) => (
            <RecipeCard key={item.key} recipe={item.recipe} overline={item.overline} style={styles.card} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    section: {
      gap: spacing.md,
    },
    heading: {
      paddingHorizontal: spacing.lg + spacing.xs,
      gap: spacing.xxs,
    },
    strip: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      gap: spacing.md,
    },
    card: {
      width: CARD_WIDTH,
    },
    skeletons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    skeletonCard: {
      width: CARD_WIDTH,
      gap: spacing.sm,
    },
  }),
);
