import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { requestPinWidget, WidgetPreview } from 'react-native-android-widget';

import { Sheet } from '@/components/Sheet';
import { Button, Text } from '@/components/ui';
import { format, strings } from '@/i18n';
import { showToast } from '@/lib/toast';
import { activeTheme, colors, radii, spacing, themedStyles } from '@/theme';

import { useWidgetSnapshot } from './WidgetSync';
import { PlatePalWidget, WIDGET_NAMES } from './widgets';

const SIZES = ['medium', 'small', 'large'] as const;

/** Typical launcher sizes (dp), scaled down to the sheet on narrow phones. */
const PREVIEW_SIZES = { small: { width: 160, height: 160 }, medium: { width: 330, height: 180 }, large: { width: 330, height: 380 } } as const;

function previewSize(size: (typeof SIZES)[number], maxWidth: number) {
  const box = PREVIEW_SIZES[size];
  return box.width <= maxWidth ? box : { width: maxWidth, height: Math.round((box.height * maxWidth) / box.width) };
}

const t = strings.widget;

/**
 * Profiili → "Kotinäytön widgetit": how to add them, and on Android a live
 * preview of each size with the user's own day and a button that asks the
 * launcher to place it.
 */
export function WidgetGuideSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const snapshot = useWidgetSnapshot();
  const { width } = useWindowDimensions();
  // The sheet's padding on both sides; previews never overflow a narrow phone.
  const maxWidth = Math.min(340, width - spacing.xl * 2 - spacing.md * 2);
  const now = new Date();
  const pin = async (size: (typeof SIZES)[number]) => {
    try {
      const asked = await requestPinWidget({ widgetName: WIDGET_NAMES[size] });
      if (!asked) showToast(t.guideSteps[0]);
    } catch {
      showToast(t.guideSteps[0]);
    }
  };
  return (
    <Sheet visible={visible} onClose={onClose} title={t.guideTitle}>
      <Text variant="body" color="textMuted">
        {t.guideIntro}
      </Text>
      {t.guideSteps.map((step, index) => (
        <View key={step} style={styles.step}>
          <View style={styles.number}>
            <Text variant="label" color="textOnAccent">
              {String(index + 1)}
            </Text>
          </View>
          <Text variant="body" style={styles.flex}>
            {step}
          </Text>
        </View>
      ))}
      <Text variant="caption" color="textSubtle">
        {t.guideHidden}
      </Text>
      {Platform.OS === 'android' ? (
        <View style={styles.sizes}>
          {SIZES.map((size, index) => {
            const box = previewSize(size, maxWidth);
            return (
              <View key={size} style={styles.size}>
                <Text variant="overline" color="textSubtle" accessibilityRole="header">
                  {t.guideSizes[size]}
                </Text>
                <View style={styles.preview} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <WidgetPreview
                    width={box.width}
                    height={box.height}
                    renderWidget={(props) => (
                      <PlatePalWidget
                        name={WIDGET_NAMES[size]}
                        snapshot={snapshot}
                        colors={snapshot.colors[activeTheme()]}
                        now={now}
                        width={props.width}
                        height={props.height}
                      />
                    )}
                  />
                </View>
                <Button
                  label={format(t.guideAdd, { size: t.guideSizes[size] })}
                  variant={index === 0 ? 'primary' : 'secondary'}
                  size="compact"
                  onPress={() => void pin(size)}
                />
              </View>
            );
          })}
        </View>
      ) : (
        <Text variant="caption" color="textSubtle">
          {t.guideIos}
        </Text>
      )}
    </Sheet>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    sizes: {
      gap: spacing.xl,
    },
    size: {
      gap: spacing.sm,
      alignItems: 'center',
    },
    // A home screen-like backdrop so the widget's own edges show.
    preview: {
      padding: spacing.md,
      borderRadius: radii.card,
      backgroundColor: colors.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    step: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.xs,
    },
    number: {
      width: 28,
      height: 28,
      borderRadius: radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    flex: {
      flex: 1,
    },
  }),
);
