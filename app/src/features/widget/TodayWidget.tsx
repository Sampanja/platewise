import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import { format } from '@/i18n';

import { WIDGET_MASCOTS } from './mascotSvgs.generated';
import { ringSvg, type WidgetColors, type WidgetSnapshot } from './snapshot';

const PHOTO_URI = 'platepal:///camera?mode=photo';
const SPEAK_URI = 'platepal:///log-text?mode=speak';
const DIARY_URI = 'platepal:///diary';

const round = (value: number) => String(Math.round(value));

/**
 * The home screen widget (Android): today's calories as a ring and the
 * macros, the user's character, and two quick actions that open the app
 * straight at photo or voice logging. With "Piilota kalorit" it shows the
 * number of entries only.
 */
export function TodayWidget({ snapshot, colors }: { snapshot: WidgetSnapshot; colors: WidgetColors }) {
  const { labels } = snapshot;
  const progress = snapshot.goalKcal ? snapshot.kcal / snapshot.goalKcal : 0;
  const ring = snapshot.hideCalories
    ? ringSvg(0, colors, String(snapshot.entryCount), labels.title)
    : ringSvg(progress, colors, round(snapshot.kcal), snapshot.goalKcal ? `/ ${round(snapshot.goalKcal)} ${labels.kcal}` : labels.eaten);
  const macroText = `${labels.protein} ${round(snapshot.proteinG)} g   ${labels.carbs} ${round(snapshot.carbsG)} g   ${labels.fat} ${round(snapshot.fatG)} g`;
  const buttonStyle = {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  } as const;
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: DIARY_URI }}
      style={{ height: 'match_parent', width: 'match_parent', backgroundColor: colors.bg, borderRadius: 24, padding: 12, flexDirection: 'column' }}
    >
      <FlexWidget style={{ flex: 1, width: 'match_parent', flexDirection: 'row', alignItems: 'center' }}>
        <SvgWidget svg={ring} style={{ width: 84, height: 84 }} />
        <FlexWidget style={{ flex: 1, flexDirection: 'column', paddingLeft: 12, justifyContent: 'center' }}>
          <TextWidget text={labels.title} style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }} />
          <TextWidget
            text={snapshot.hideCalories ? format(labels.entries, { count: snapshot.entryCount }) : macroText}
            style={{ fontSize: 13, color: colors.muted }}
          />
        </FlexWidget>
        <SvgWidget svg={WIDGET_MASCOTS[snapshot.character]} style={{ width: 60, height: 60 }} />
      </FlexWidget>
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', marginTop: 8 }}>
        <FlexWidget clickAction="OPEN_URI" clickActionData={{ uri: PHOTO_URI }} accessibilityLabel={labels.photo} style={buttonStyle}>
          <TextWidget text={labels.photo} style={{ fontSize: 14, fontWeight: 'bold', color: colors.onAccent }} />
        </FlexWidget>
        <FlexWidget style={{ width: 8, height: 8 }} />
        <FlexWidget clickAction="OPEN_URI" clickActionData={{ uri: SPEAK_URI }} accessibilityLabel={labels.speak} style={buttonStyle}>
          <TextWidget text={labels.speak} style={{ fontSize: 14, fontWeight: 'bold', color: colors.onAccent }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
