import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { toLocalDate } from '@/lib/dates';

import { forToday, readWidgetSnapshot } from './snapshot';
import { TodayWidget } from './TodayWidget';

/**
 * Runs when Android adds, updates or resizes the widget, also while the app
 * is closed. It draws from the last snapshot the app saved; before the first
 * snapshot there is nothing to show yet, and the app writes one on start.
 * Clicks open the app through deep links (OPEN_URI), handled by Android.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  if (props.widgetAction === 'WIDGET_DELETED' || props.widgetAction === 'WIDGET_CLICK') return;
  const saved = await readWidgetSnapshot();
  if (!saved) return;
  const snapshot = forToday(saved, toLocalDate(new Date()));
  props.renderWidget({
    light: <TodayWidget snapshot={snapshot} colors={snapshot.colors.light} />,
    dark: <TodayWidget snapshot={snapshot} colors={snapshot.colors.dark} />,
  });
}
