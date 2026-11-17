import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { useWaterStore } from '@/data/stores/water';
import { setActiveLanguage, setActiveUnits } from '@/i18n/locale';
import { toLocalDate } from '@/lib/dates';

import { forToday, readWidgetSnapshot, saveWidgetSnapshot, type WidgetSnapshot } from './snapshot';
import { DEFAULT_SIZES, drawWidgets } from './WidgetSync';
import { PlatePalWidget, WATER_ADD } from './widgets';

/**
 * Adds one glass of water from the widget without opening the app. The water
 * store is persisted, so this works whether the app is running (same store)
 * or not (it loads the saved state first). The snapshot gets the new amount
 * so every widget shows it at once.
 */
async function addWater(snapshot: WidgetSnapshot): Promise<WidgetSnapshot> {
  await useWaterStore.persist.rehydrate();
  const store = useWaterStore.getState();
  const added = store.add(snapshot.date, store.glassMl, 'water');
  if (!added) return snapshot;
  const next = { ...snapshot, waterMl: snapshot.waterMl + added.ml, glassMl: store.glassMl };
  await saveWidgetSnapshot(next);
  return next;
}

/**
 * Runs when Android adds, updates, resizes or taps a widget, also while the
 * app is closed. It draws from the last snapshot the app saved (formatted in
 * the snapshot's language and units); before the first snapshot there is
 * nothing to show yet, and the app writes one on start. Taps on quick actions
 * open the app through deep links (OPEN_URI, handled by Android); "Vesi +1"
 * is handled here.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  if (props.widgetAction === 'WIDGET_DELETED') return;
  const saved = await readWidgetSnapshot();
  if (!saved) return;
  setActiveLanguage(saved.language);
  setActiveUnits(saved.units);
  let snapshot = forToday(saved, toLocalDate(new Date()));

  if (props.widgetAction === 'WIDGET_CLICK') {
    if (props.clickAction !== WATER_ADD) return;
    snapshot = await addWater(snapshot);
    // The other widgets on the home screen show the new amount too.
    await drawWidgets(snapshot);
    return;
  }

  const { widgetName, width, height } = props.widgetInfo;
  const size = width > 0 ? { width, height } : (DEFAULT_SIZES[widgetName] ?? { width: 330, height: 180 });
  const now = new Date();
  const light = <PlatePalWidget name={widgetName} snapshot={snapshot} colors={snapshot.colors.light} now={now} {...size} />;
  const dark = <PlatePalWidget name={widgetName} snapshot={snapshot} colors={snapshot.colors.dark} now={now} {...size} />;
  props.renderWidget(snapshot.themePreference === 'light' ? light : snapshot.themePreference === 'dark' ? dark : { light, dark });
}
