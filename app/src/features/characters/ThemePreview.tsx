import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { strings } from '@/i18n';
import { radii, spacing, type Palette } from '@/theme';

const t = strings.characters.preview;

/**
 * A miniature of the app drawn with a given palette (not the active one), so
 * the character picker can show each theme before it is chosen. Colours come
 * only from the palette's tokens.
 */
export function ThemePreview({ palette }: { palette: Palette }) {
  const p = palette;
  return (
    <View
      style={[styles.frame, { backgroundColor: p.bg, borderColor: p.border }]}
      accessible
      accessibilityLabel={strings.characters.previewLabel}
    >
      <View style={[styles.card, { backgroundColor: p.surface, borderColor: p.border }]}>
        <View style={styles.row}>
          <Text variant="cardTitle" style={{ color: p.text }}>
            {t.today}
          </Text>
          <View style={[styles.chip, { backgroundColor: p.accentSoft }]}>
            <Icon name="flame" size={12} tint={p.accentText} />
            <Text variant="caption" style={{ color: p.accentText }}>
              {t.streak}
            </Text>
          </View>
        </View>
        <View style={[styles.track, { backgroundColor: p.surfaceRaised }]}>
          <View style={[styles.fill, { backgroundColor: p.accent }]} />
        </View>
        <Text variant="caption" style={{ color: p.textMuted }}>
          {t.progress}
        </Text>
      </View>

      <View style={[styles.card, styles.recipe, { backgroundColor: p.surface, borderColor: p.border }]}>
        <View style={[styles.thumb, { backgroundColor: p.herbSoft }]}>
          <Icon name="pot" size={18} tint={p.herb} />
        </View>
        <View style={styles.flex}>
          <Text variant="cardTitle" style={{ color: p.text }} numberOfLines={1}>
            {t.recipe}
          </Text>
          <Text variant="caption" style={{ color: p.textSubtle }} numberOfLines={1}>
            {t.recipeMeta}
          </Text>
        </View>
        <Icon name="heart" size={16} tint={p.accentText} />
      </View>

      <View style={[styles.button, { backgroundColor: p.accent }]}>
        <Text variant="label" style={{ color: p.textOnAccent }} numberOfLines={1}>
          {t.cta}
        </Text>
      </View>

      <View style={[styles.tabs, { backgroundColor: p.surface, borderColor: p.border }]}>
        <Icon name="home" size={16} tint={p.accentText} />
        <Icon name="recipes" size={16} tint={p.textSubtle} />
        <View style={[styles.center, { backgroundColor: p.accent }]}>
          <Icon name="sparkles" size={14} tint={p.textOnAccent} />
        </View>
        <Icon name="diary" size={16} tint={p.textSubtle} />
        <Icon name="profile" size={16} tint={p.textSubtle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  card: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  track: {
    height: 8,
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginTop: spacing.xxs,
  },
  fill: {
    width: '65%',
    height: '100%',
    borderRadius: radii.pill,
  },
  recipe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  button: {
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 44,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  center: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
