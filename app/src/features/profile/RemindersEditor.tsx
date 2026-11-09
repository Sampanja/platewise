import { useEffect, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { Button, Card, Stepper, SwitchRow, Text } from '@/components/ui';
import { useRemindersStore } from '@/data/stores/reminders';
import type { DiaryMeal } from '@/data/types';
import { DIARY_MEALS } from '@/domain/diary';
import { format, strings } from '@/i18n';
import { ensurePermission, scheduleMealReminders } from '@/services/reminders';
import { colors, spacing, themedStyles } from '@/theme';

const t = strings.reminders;
/** Minutes from midnight in 15-minute steps. */
const STEP = 15;

function timeLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}.${String(m).padStart(2, '0')}`;
}

/** Meal reminders: off by default; each meal has its own switch and time. Changes reschedule at once. */
export function RemindersEditor() {
  const { enabled, times, setEnabled, setTime } = useRemindersStore();
  const [denied, setDenied] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    // Skip the first run: opening the screen must not reschedule or ask for permission.
    if (first.current) {
      first.current = false;
      return;
    }
    void scheduleMealReminders(enabled, times);
  }, [enabled, times]);

  const toggle = async (value: boolean) => {
    if (value) {
      const granted = await ensurePermission();
      setDenied(!granted);
      if (!granted) return;
    }
    setEnabled(value);
  };

  return (
    <View style={styles.gap}>
      <Card padding="flush">
        <View style={styles.row}>
          <SwitchRow label={t.enable} hint={t.enableHint} value={enabled} onValueChange={(v) => void toggle(v)} />
        </View>
      </Card>
      {denied ? (
        <Card style={styles.gap}>
          <Text variant="body" color="textMuted">
            {t.denied}
          </Text>
          <Button label={t.openSettings} variant="secondary" size="compact" onPress={() => void Linking.openSettings()} />
        </Card>
      ) : null}
      {enabled ? (
        <Card padding="flush">
          {DIARY_MEALS.map((meal: DiaryMeal, i) => {
            const time = times[meal];
            const minutes = time.hour * 60 + time.minute;
            return (
              <View key={meal} style={[styles.row, i < DIARY_MEALS.length - 1 && styles.divider]}>
                <SwitchRow
                  label={strings.diaryMeals[meal]}
                  value={time.on}
                  onValueChange={(on) => setTime(meal, { on })}
                />
                {time.on ? (
                  <Stepper
                    value={minutes}
                    min={5 * 60}
                    max={23 * 60}
                    step={STEP}
                    format={timeLabel}
                    accessibilityLabel={format(t.timeA11y, { meal: strings.diaryMeals[meal] })}
                    onChange={(value) => setTime(meal, { hour: Math.floor(value / 60), minute: value % 60 })}
                  />
                ) : null}
              </View>
            );
          })}
        </Card>
      ) : null}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    gap: {
      gap: spacing.md,
    },
    row: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
  }),
);
