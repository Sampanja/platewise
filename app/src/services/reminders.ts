import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import type { ReminderTime } from '@/data/stores/reminders';
import type { DiaryMeal } from '@/data/types';
import { useRemindersStore } from '@/data/stores/reminders';
import { useWaterStore } from '@/data/stores/water';
import { currentCharacter } from '@/features/mascot/useCharacter';
import { strings } from '@/i18n';
import { reminderHours } from '@/domain/hydration';

import { syncExpiryReminders } from './pantryReminders';

/**
 * Meal reminders as local notifications (no server, no push token). The
 * reminder text is neutral and never mentions calories or weight. The text
 * is in the chosen character's voice (rescheduled when the character changes).
 */

const CHANNEL = 'meal-reminders';
const TAG = 'platepal-meal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** The Android channel every reminder uses (meals, water, pantry, weekly report). */
export async function ensureReminderChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: strings.reminders.channelName,
    importance: AndroidImportance.DEFAULT,
  });
}

export async function ensurePermission(): Promise<boolean> {
  await ensureReminderChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Replaces all meal reminders with the given ones. Returns how many were scheduled. */
export async function scheduleMealReminders(
  enabled: boolean,
  times: Readonly<Record<DiaryMeal, ReminderTime>>,
): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.tag === TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!enabled) return 0;
  const { voice } = currentCharacter();
  const entries = (Object.entries(times) as [DiaryMeal, ReminderTime][]).filter(([, time]) => time.on);
  for (const [meal, time] of entries) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: voice.name,
        body: voice.notify[meal],
        data: { tag: TAG, meal },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
        channelId: CHANNEL,
      },
    });
  }
  return entries.length;
}

const WATER_TAG = 'platepal-water';

/**
 * Gentle drink reminders through the day, in the character's voice. The text
 * never mentions amounts. Replaces any earlier water reminders; returns how
 * many daily reminders were scheduled.
 */
export async function scheduleWaterReminders(settings: {
  on: boolean;
  startHour: number;
  endHour: number;
  everyHours: number;
}): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.tag === WATER_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!settings.on) return 0;
  const { voice } = currentCharacter();
  const hours = reminderHours(settings.startHour, settings.endHour, settings.everyHours);
  for (const hour of hours) {
    await Notifications.scheduleNotificationAsync({
      content: { title: voice.name, body: voice.notify.water, data: { tag: WATER_TAG } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0, channelId: CHANNEL },
    });
  }
  return hours.length;
}

/**
 * Reschedules every enabled reminder with the current texts. Scheduled
 * notifications keep the words they were created with, so this runs when
 * the character or the language changes.
 */
export function rescheduleReminders(): void {
  const meals = useRemindersStore.getState();
  if (meals.enabled) void scheduleMealReminders(true, meals.times);
  const water = useWaterStore.getState().reminders;
  if (water.on) void scheduleWaterReminders(water);
  void syncExpiryReminders();
  if (meals.weeklyReport) void scheduleWeeklyReport(true);
}

const REPORT_TAG = 'platepal-report';
/** Expo weekly triggers count weekdays from Sunday = 1, so Monday is 2. */
const MONDAY = 2;

/** "Viikkoraportti valmis" on Monday mornings at 9, opening Päiväkirja → Raportit. Replaces any earlier one. */
export async function scheduleWeeklyReport(on: boolean): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled.filter((n) => n.content.data?.tag === REPORT_TAG).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!on) return false;
  if (!(await ensurePermission())) return false;
  const { voice } = currentCharacter();
  await Notifications.scheduleNotificationAsync({
    content: { title: voice.name, body: strings.reports.notifyBody, data: { tag: REPORT_TAG, url: '/diary?segment=reports' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: MONDAY, hour: 9, minute: 0, channelId: CHANNEL },
  });
  return true;
}
