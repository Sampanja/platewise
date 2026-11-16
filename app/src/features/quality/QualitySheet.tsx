import { StyleSheet, View } from 'react-native';

import { openRecipe } from '@/components/RecipeCard';
import { QualityBadge } from '@/components/QualityBadge';
import { Sheet } from '@/components/Sheet';
import { Button, Text } from '@/components/ui';
import type { Recipe } from '@/data/types';
import { explain, type QualityGrade, type QualityPart, type QualityScore } from '@/domain/qualityScore';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { useCharacter } from '@/features/mascot/useCharacter';
import { format, strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.quality;

export type QualitySheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Our own score with its parts; null for a product shown with its official Nutri-Score. */
  score: QualityScore | null;
  grade: QualityGrade;
  /** A similar allowed recipe with a better grade, offered kindly. */
  alternative?: { recipe: Recipe; grade: QualityGrade } | null;
  intro?: string;
};

/** "Miksi tämä arvio?": what raises and lowers the score, in plain words. Never judges. */
export function QualitySheet({ visible, onClose, title, score, grade, alternative, intro }: QualitySheetProps) {
  const { voice } = useCharacter();
  const why = score ? explain(score) : null;
  // One concrete tip for the part that lowers the score most, or the missing raiser.
  const tipPart = why?.lowers[0]?.key ?? (score && !why?.raises.some((p) => p.key === 'fruitVeg') ? 'fruitVeg' : undefined);
  return (
    <Sheet visible={visible} onClose={onClose} title={t.why}>
      <View style={styles.head}>
        <QualityBadge grade={grade} size="large" />
        <View style={styles.flex}>
          <Text variant="bodyStrong">{title}</Text>
          <Text variant="caption" color="textSubtle">
            {score ? (intro ?? t.intro) : t.nutriScore}
          </Text>
        </View>
      </View>
      {why ? (
        <>
          <PartGroup title={t.raises} parts={why.raises} />
          <PartGroup title={t.lowers} parts={why.lowers} />
          {why.raises.length === 0 && why.lowers.length === 0 ? (
            <Text variant="body" color="textMuted">
              {t.none}
            </Text>
          ) : null}
        </>
      ) : null}
      {alternative ? (
        <View style={styles.gap}>
          <MascotSays state="cooking" message={format(voice.quality.better, { recipe: alternative.recipe.title, grade: alternative.grade })} size={52} />
          <Button
            label={alternative.recipe.title}
            variant="secondary"
            size="compact"
            onPress={() => {
              onClose();
              openRecipe(alternative.recipe.id);
            }}
          />
        </View>
      ) : tipPart ? (
        <MascotSays state="encouraging" message={format(voice.quality.tip, { tip: t.tips[tipPart] })} size={52} />
      ) : null}
      {score ? (
        <Text variant="caption" color="textSubtle">
          {t.method}
        </Text>
      ) : null}
    </Sheet>
  );
}

function PartGroup({ title, parts }: { title: string; parts: QualityPart[] }) {
  if (parts.length === 0) return null;
  return (
    <View style={styles.group}>
      <Text variant="label" color="textSubtle">
        {title}
      </Text>
      {parts.map((part) => (
        <View key={part.key} style={styles.part}>
          <Text variant="body" style={styles.flex}>
            {t.parts[part.key]}
          </Text>
          <Text variant="label" color="textMuted">
            {format(t.points, { value: part.points, max: part.max })}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    flex: {
      flex: 1,
    },
    gap: {
      gap: spacing.sm,
    },
    group: {
      gap: spacing.xs,
    },
    part: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 40,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceRaised,
    },
  }),
);
