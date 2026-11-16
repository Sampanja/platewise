import { Platform, StyleSheet, View } from 'react-native';
import { requestPinWidget } from 'react-native-android-widget';

import { Sheet } from '@/components/Sheet';
import { Button, Text } from '@/components/ui';
import { strings } from '@/i18n';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles } from '@/theme';

import { updateWidget } from './useWidgetSync';

const t = strings.widget;

/** Profiili → "Kotinäytön widget": how to add it, and on Android a button that asks the launcher to place it. */
export function WidgetGuideSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const pin = async () => {
    try {
      await updateWidget();
      const asked = await requestPinWidget({ widgetName: 'Today' });
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
        <Button label={t.guideAdd} onPress={() => void pin()} />
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
