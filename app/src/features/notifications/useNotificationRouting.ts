import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';

import { usePantryStore } from '@/data/stores/pantry';
import { syncExpiryReminders } from '@/services/pantryReminders';

/** Responses already handled: the root layout remounts on theme changes and must not navigate twice. */
const handled = new Set<string>();

/**
 * A tapped notification with `data.url` (pantry and weekly report reminders)
 * opens that screen once the app is ready.
 */
export function useNotificationRouting(ready: boolean): void {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!ready || !response) return;
    const id = response.notification.request.identifier;
    const url = response.notification.request.content.data?.url;
    if (handled.has(id) || typeof url !== 'string') return;
    handled.add(id);
    router.push(url as Href);
  }, [response, ready]);
}

const SYNC_DELAY_MS = 1500;

/**
 * Keeps the expiry reminders in step with Ruokavarasto: rescheduled a moment
 * after the items or the setting change (one run for a burst of edits).
 */
export function usePantryReminderSync(ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void syncExpiryReminders().catch(() => undefined), SYNC_DELAY_MS);
    };
    schedule();
    const unsubscribe = usePantryStore.subscribe((state, previous) => {
      if (state.items !== previous.items || state.expiryReminders !== previous.expiryReminders) schedule();
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [ready]);
}
