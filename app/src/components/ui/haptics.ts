import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Semantic haptics. Components call these instead of expo-haptics directly so
 * the feel stays consistent. Haptics are a nicety: failures are ignored.
 */
function run(effect: () => Promise<void>): void {
  if (Platform.OS === 'web') return;
  effect().catch(() => undefined);
}

export const haptics = {
  /** Light tap for ordinary presses. */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Crisp tick for toggles such as shopping list checkboxes. */
  select: () => run(() => Haptics.selectionAsync()),
  /** Celebratory pulse when something is completed (list done, week planned). */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
