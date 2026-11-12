import { LinearGradient } from 'expo-linear-gradient';
import {
  Apple,
  Banana,
  Bean,
  Beef,
  Carrot,
  CakeSlice,
  Cherry,
  Citrus,
  CookingPot,
  Croissant,
  CupSoda,
  Drumstick,
  Egg,
  EggFried,
  Fish,
  Flame,
  Grape,
  Ham,
  Leaf,
  Milk,
  Nut,
  Salad,
  Sandwich,
  Shrimp,
  Soup,
  Sprout,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from 'lucide-react-native';
import { memo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import type { DishType, MainProtein } from '@/data/types';
import { colors, themedStyles, withAlpha } from '@/theme';

/**
 * Category illustration card: the recipe image until the backend adds a real
 * dish photo. One line-icon style (Lucide), drawn in the active character's
 * two theme colours, so every card fits the chosen theme in light and dark.
 * The layout is seeded by the recipe id: cards in a grid look related but
 * not identical.
 */

/** The main motif per category. */
const CATEGORY_ICON: Record<DishType, LucideIcon> = {
  soup: Soup,
  stew: CookingPot,
  pasta: UtensilsCrossed,
  rice: CookingPot,
  potato: UtensilsCrossed,
  oven: Flame,
  casserole: CookingPot,
  stir_fry: Flame,
  salad: Salad,
  bowl: Salad,
  wrap: Sandwich,
  patty: UtensilsCrossed,
  pie: CakeSlice,
  porridge: Wheat,
  egg: EggFried,
  sandwich: Sandwich,
  pancake: Croissant,
  smoothie: CupSoda,
  snack: Apple,
  other: UtensilsCrossed,
};

/** Small ingredient motifs around the plate, by main protein. */
const PROTEIN_ICONS: Record<MainProtein, LucideIcon[]> = {
  chicken: [Drumstick, Leaf, Citrus],
  beef: [Beef, Sprout, Carrot],
  pork: [Ham, Leaf, Carrot],
  minced_meat: [Beef, Leaf, Wheat],
  fish: [Fish, Citrus, Leaf],
  seafood: [Shrimp, Citrus, Leaf],
  egg: [Egg, Sprout, Wheat],
  dairy: [Milk, Leaf, Cherry],
  legumes: [Bean, Sprout, Carrot],
  tofu: [Bean, Leaf, Sprout],
  none: [Carrot, Leaf, Cherry],
};

/** Breakfast and snack categories get fruit and grain motifs whatever the protein. */
const SWEET: Partial<Record<DishType, LucideIcon[]>> = {
  porridge: [Cherry, Wheat, Nut],
  smoothie: [Banana, Cherry, Grape],
  pancake: [Cherry, Egg, Wheat],
  snack: [Grape, Nut, Cherry],
  pie: [Cherry, Wheat, Egg],
};

/**
 * Positions (fractions of the card) for the three small motifs; one set is
 * picked per recipe. The top band stays free for the buttons that sit over
 * images (back, heart).
 */
const LAYOUTS: readonly [number, number, number][][] = [
  [
    [0.07, 0.36, -18],
    [0.09, 0.72, 12],
    [0.8, 0.66, -10],
  ],
  [
    [0.1, 0.62, 12],
    [0.8, 0.38, -16],
    [0.76, 0.74, 22],
  ],
  [
    [0.06, 0.44, 18],
    [0.82, 0.56, -12],
    [0.2, 0.76, 8],
  ],
];

/** Stable small hash of a string (FNV-1a). */
export function seedOf(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

type Props = {
  dishType: DishType;
  protein: MainProtein;
  /** Varies the layout; usually the recipe id. */
  seed: string;
  style?: StyleProp<ViewStyle>;
};

export const FoodIllustration = memo(function FoodIllustration({ dishType, protein, seed, style }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const hash = seedOf(seed);
  // Alternate which theme colour leads, so a grid of cards is not monotonous.
  const leadIsAccent = hash % 2 === 0;
  const lead = leadIsAccent ? colors.accent : colors.herb;
  const other = leadIsAccent ? colors.herb : colors.accent;
  const Main = CATEGORY_ICON[dishType];
  const motifs = SWEET[dishType] ?? PROTEIN_ICONS[protein];
  const layout = LAYOUTS[hash % LAYOUTS.length];

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (Math.abs(width - size.width) > 1 || Math.abs(height - size.height) > 1) setSize({ width, height });
  };

  const short = Math.min(size.width, size.height);
  const plate = short * 0.62;
  const mainSize = plate * 0.48;
  const motifSize = Math.max(14, short * 0.15);

  return (
    <View style={[styles.wrap, style]} onLayout={onLayout} accessible={false} importantForAccessibility="no-hide-descendants">
      <LinearGradient
        colors={[withAlpha(lead, 0.22), withAlpha(other, 0.1)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {short > 0 ? (
        <>
          {/* Soft halo and the plate. */}
          <View
            style={[
              styles.circle,
              {
                width: plate * 1.35,
                height: plate * 1.35,
                borderRadius: plate,
                backgroundColor: withAlpha(lead, 0.08),
              },
            ]}
          />
          <View
            style={[
              styles.circle,
              styles.plate,
              { width: plate, height: plate, borderRadius: plate / 2 },
            ]}
          >
            <Main size={mainSize} color={lead} strokeWidth={1.6} />
          </View>
          {motifs.map((Motif, i) => {
            const [x, y, rotate] = layout[i];
            return (
              <View
                key={i}
                style={[
                  styles.motif,
                  {
                    left: x * size.width,
                    top: y * size.height,
                    transform: [{ rotate: `${rotate}deg` }],
                  },
                ]}
              >
                <Motif size={motifSize} color={other} strokeWidth={1.8} />
              </View>
            );
          })}
        </>
      ) : null}
    </View>
  );
});

const styles = themedStyles(() =>
  StyleSheet.create({
    wrap: {
      overflow: 'hidden',
      backgroundColor: colors.surfaceRaised,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    plate: {
      backgroundColor: withAlpha(colors.surface, 0.7),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.glassBorder,
    },
    motif: {
      position: 'absolute',
      opacity: 0.55,
    },
  }),
);
