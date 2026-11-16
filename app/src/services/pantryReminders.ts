import * as Notifications from 'expo-notifications';

import { INGREDIENTS_BY_ID, RECIPES } from '@/data/catalog';
import { usePantryStore } from '@/data/stores/pantry';
import { useProfileStore } from '@/data/stores/profile';
import { EXPIRY_REMINDER_HOUR, expiryReminderPlan, pantrySuggestions } from '@/domain/pantry';
import { isRecipeAllowed } from '@/domain/recipes';
import { currentCharacter } from '@/features/mascot/useCharacter';
import { format } from '@/i18n';
import { parseLocalDate, today } from '@/lib/dates';

import { ensureReminderChannel } from './reminders';

/**
 * "Kerma vanhenee huomenna, kokeile näitä": a local notification the morning
 * before an item's best-before date, with a recipe idea that uses it. Only
 * allowed recipes are suggested (isRecipeAllowed). The user can turn it off in
 * Ruokavarasto. Tapping opens Reseptit → Varastosta.
 */

const TAG = 'platepal-pantry';
const CHANNEL = 'meal-reminders';

/** Replaces the scheduled expiry reminders with ones for the current pantry. Never asks for permission. */
export async function syncExpiryReminders(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled.filter((n) => n.content.data?.tag === TAG).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  const { items, expiryReminders } = usePantryStore.getState();
  if (!expiryReminders) return 0;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return 0;
  await ensureReminderChannel();

  const now = new Date();
  const plan = expiryReminderPlan(items, today(), now.getHours());
  if (plan.length === 0) return 0;
  const profile = useProfileStore.getState();
  const rules = { allergens: profile.allergens, diets: profile.diets };
  const allowed = RECIPES.filter((recipe) => isRecipeAllowed(recipe, rules, INGREDIENTS_BY_ID));
  const staples = new Set(profile.pantry);
  const { voice } = currentCharacter();

  for (const reminder of plan) {
    const first = reminder.ingredientIds[0];
    const name = INGREDIENTS_BY_ID[first]?.name ?? '';
    const suggestions = pantrySuggestions(allowed, items, staples, reminder.date);
    const idea = [...suggestions.ready, ...suggestions.almost].find((s) => s.used.includes(first));
    const body = idea
      ? format(voice.pantry.expiring, { item: name, recipe: idea.recipe.title })
      : format(voice.pantry.expiringPlain, { item: name });
    const when = parseLocalDate(reminder.date);
    when.setHours(EXPIRY_REMINDER_HOUR, 0, 0, 0);
    await Notifications.scheduleNotificationAsync({
      content: { title: voice.name, body, data: { tag: TAG, url: '/recipes?segment=pantry' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL },
    });
  }
  return plan.length;
}
