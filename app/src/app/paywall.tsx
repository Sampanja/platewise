import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoodIllustration } from '@/components/FoodIllustration';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Chip, Icon, OptionRow, Text } from '@/components/ui';
import { strings } from '@/i18n';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.paywall;

/**
 * Paywall preview. Purchases come with RevenueCat later; here the buttons
 * explain that payments are not enabled in the test version.
 */
export default function PaywallScreen() {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const notYet = () => showToast(t.note);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader variant="close" />
      <ScrollView contentContainerStyle={styles.content}>
        <FoodIllustration dishType="salad" protein="none" seed="paywall-hero" style={styles.hero} />
        <View style={styles.titleBlock}>
          <Chip tone="accent" label={strings.common.comingSoon} />
          <Text variant="displayLarge" accessibilityRole="header">
            {t.title}
          </Text>
          <Text variant="body" color="textMuted">
            {t.body}
          </Text>
        </View>
        <View style={styles.features}>
          {[t.feature1, t.feature2, t.feature3, t.feature4].map((feature) => (
            <View key={feature} style={styles.feature}>
              <Icon name="checkCircle" size={22} color="success" />
              <Text variant="body" style={styles.flex}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.plans} accessibilityRole="radiogroup">
          <OptionRow
            title={`${t.yearly} · ${t.yearlyPrice}`}
            hint={`${t.yearlySave} · ${t.trial}`}
            selected={plan === 'yearly'}
            onPress={() => setPlan('yearly')}
          />
          <OptionRow
            title={`${t.monthly} · ${t.monthlyPrice}`}
            hint={t.trial}
            selected={plan === 'monthly'}
            onPress={() => setPlan('monthly')}
          />
        </View>
        <Text variant="caption" color="textSubtle" style={styles.center}>
          {t.note}
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        <Button label={t.cta} onPress={notYet} />
        <Button label={t.restore} variant="ghost" size="compact" onPress={notYet} />
      </View>
    </SafeAreaView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.xl,
    },
    hero: {
      aspectRatio: 16 / 9,
      borderRadius: radii.card,
    },
    titleBlock: {
      gap: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    features: {
      gap: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    plans: {
      gap: spacing.sm,
    },
    center: {
      textAlign: 'center',
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      gap: spacing.xs,
    },
  }),
);
