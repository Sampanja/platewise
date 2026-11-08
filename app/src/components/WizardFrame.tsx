import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton, PressableScale, ProgressMeter, Text, useReducedMotion } from '@/components/ui';
import { format, strings } from '@/i18n';
import { colors, spacing, touchTarget } from '@/theme';

export type WizardFrameProps = {
  /** 1-based. */
  step: number;
  total: number;
  /** Changes on every step; drives the slide transition. */
  stepKey: string;
  /** +1 forwards, −1 backwards. */
  direction: 1 | -1;
  title: string;
  body?: string;
  onBack?: () => void;
  onClose?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
  /** The step's main action, kept above the keyboard. */
  footer: ReactNode;
  children: ReactNode;
};

/**
 * Frame for one-question-per-screen flows (onboarding, Suunnittele): progress
 * bar, back, skip or close, the question, and one primary action.
 */
export function WizardFrame({
  step,
  total,
  stepKey,
  direction,
  title,
  body,
  onBack,
  onClose,
  onSkip,
  skipLabel = strings.common.skip,
  footer,
  children,
}: WizardFrameProps) {
  const progressLabel = format(strings.plan.progress, { step, total });
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {onBack ? (
          <IconButton icon="chevronLeft" accessibilityLabel={strings.common.back} onPress={onBack} />
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <View style={styles.progress}>
          <ProgressMeter value={step / total} size="thin" accessibilityLabel={progressLabel} />
        </View>
        {onSkip ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={skipLabel}
            onPress={onSkip}
            style={styles.skip}
          >
            <Text variant="label" color="textMuted">
              {skipLabel}
            </Text>
          </PressableScale>
        ) : onClose ? (
          <IconButton icon="close" accessibilityLabel={strings.plan.exit} onPress={onClose} />
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepTransition key={stepKey} direction={direction}>
            <View style={styles.question}>
              <Text variant="overline" color="accentText">
                {progressLabel}
              </Text>
              <Text variant="display" accessibilityRole="header">
                {title}
              </Text>
              {body ? (
                <Text variant="body" color="textMuted">
                  {body}
                </Text>
              ) : null}
            </View>
            {children}
          </StepTransition>
        </ScrollView>
        <View style={styles.footer}>{footer}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepTransition({ direction, children }: { direction: 1 | -1; children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: reducedMotion ? 0 : 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reducedMotion]);

  return (
    <Animated.View
      style={[
        styles.step,
        {
          opacity: progress,
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [direction * 36, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerSpacer: {
    width: touchTarget,
  },
  progress: {
    flex: 1,
  },
  skip: {
    minHeight: touchTarget,
    minWidth: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  step: {
    gap: spacing.xl,
  },
  question: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
});
