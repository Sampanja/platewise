import { FlexWidget, ImageWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import { format, strings } from '@/i18n';
import { formatDrink } from '@/lib/amounts';

import { widgetModel, type MacroRow, type WidgetModel } from './model';
import { glassesSvg, ringSvg, type HexColor, type WidgetColors, type WidgetSnapshot } from './snapshot';
import { WIDGET_ICON_COLOR, WIDGET_ICONS, WIDGET_MASCOTS, type WidgetIconName } from './widgetArt.generated';

/** The three widget sizes; each has its own layout (not a scaled copy). */
export const WIDGET_NAMES = { small: 'TodaySmall', medium: 'Today', large: 'TodayLarge' } as const;
export type WidgetName = (typeof WIDGET_NAMES)[keyof typeof WIDGET_NAMES];

export const WATER_ADD = 'WATER_ADD';
const URI = {
  diary: 'platepal:///diary',
  photo: 'platepal:///camera?mode=photo',
  speak: 'platepal:///log-text?mode=speak',
  barcode: 'platepal:///camera?mode=barcode',
  water: 'platepal:///water',
  plan: 'platepal:///plan',
} as const;

const icon = (name: WidgetIconName, color: HexColor) => WIDGET_ICONS[name].split(WIDGET_ICON_COLOR).join(color);

type LayoutProps = { snapshot: WidgetSnapshot; colors: WidgetColors; width: number; height: number; now: Date };

/** Picks the layout by widget name; sizes come from the launcher (dp). */
export function PlatePalWidget({ name, ...props }: LayoutProps & { name: string }) {
  if (name === WIDGET_NAMES.small) return <SmallWidget {...props} />;
  if (name === WIDGET_NAMES.large) return <LargeWidget {...props} />;
  return <MediumWidget {...props} />;
}

const CORNER = 28;

function Frame({ colors, children, padding = 14 }: { colors: WidgetColors; children: React.ReactNode; padding?: number }) {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: URI.diary }}
      accessibilityLabel={strings.widget.openA11y}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: colors.surface,
        borderRadius: CORNER,
        padding,
        flexDirection: 'column',
      }}
    >
      {children}
    </FlexWidget>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────────────

type Action = { key: 'photo' | 'speak' | 'barcode' | 'water'; icon: WidgetIconName; label: string; a11y: string };

function actions(snapshot: WidgetSnapshot): Action[] {
  const w = strings.widget;
  return [
    { key: 'photo', icon: 'camera', label: w.photo, a11y: w.photoA11y },
    { key: 'speak', icon: 'mic', label: w.speak, a11y: w.speakA11y },
    { key: 'barcode', icon: 'barcode', label: w.barcode, a11y: w.barcodeA11y },
    { key: 'water', icon: 'water', label: w.waterAdd, a11y: format(w.waterAddA11y, { amount: formatDrink(snapshot.glassMl) }) },
  ];
}

function clickOf(action: Action['key']) {
  return action === 'water'
    ? { clickAction: WATER_ADD, clickActionData: {} }
    : { clickAction: 'OPEN_URI', clickActionData: { uri: URI[action] } };
}

/**
 * A quick action: icon over a short label. On an empty day the buttons are
 * filled with the accent colour to invite the first entry; otherwise soft.
 */
function ActionButton({ action, colors, strong, compact }: { action: Action; colors: WidgetColors; strong: boolean; compact: boolean }) {
  const fg = strong ? colors.onAccent : colors.accentText;
  return (
    <FlexWidget
      {...clickOf(action.key)}
      accessibilityLabel={action.a11y}
      style={{
        flex: 1,
        height: compact ? 40 : 52,
        borderRadius: compact ? 20 : 18,
        backgroundColor: strong ? colors.accent : colors.accentSoft,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <SvgWidget svg={icon(action.icon, fg)} style={{ width: compact ? 20 : 22, height: compact ? 20 : 22 }} />
      {compact ? null : (
        <TextWidget text={action.label} style={{ fontSize: 11, color: fg, fontWeight: '600', marginTop: 2 }} maxLines={1} truncate="END" />
      )}
    </FlexWidget>
  );
}

function ActionRow({ snapshot, colors, model, compact }: { snapshot: WidgetSnapshot; colors: WidgetColors; model: WidgetModel; compact: boolean }) {
  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', flexGap: 8 }}>
      {actions(snapshot).map((action) => (
        <ActionButton key={action.key} action={action} colors={colors} strong={model.empty} compact={compact} />
      ))}
    </FlexWidget>
  );
}

function Bar({ progress, color, track }: { progress: number; color: HexColor; track: HexColor }) {
  const filled = Math.round(progress * 100);
  return (
    <FlexWidget style={{ width: 'match_parent', height: 6, borderRadius: 3, backgroundColor: track, flexDirection: 'row', overflow: 'hidden' }}>
      {filled > 0 ? <FlexWidget style={{ flex: filled, height: 6, borderRadius: 3, backgroundColor: color }} /> : null}
      {filled < 100 ? <FlexWidget style={{ flex: 100 - filled, height: 6 }} /> : null}
    </FlexWidget>
  );
}

function MacroRows({ rows, colors, compact }: { rows: MacroRow[]; colors: WidgetColors; compact: boolean }) {
  const barColor = (key: MacroRow['key']) => (key === 'proteinG' ? colors.second : key === 'carbsG' ? colors.accent : colors.water);
  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'column', flexGap: compact ? 5 : 8 }}>
      {rows.map((row) => (
        <FlexWidget key={row.key} style={{ width: 'match_parent', flexDirection: 'column', flexGap: 3 }}>
          <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between' }}>
            <TextWidget text={row.label} style={{ fontSize: compact ? 12 : 13, color: colors.muted }} maxLines={1} />
            <TextWidget text={row.value} style={{ fontSize: compact ? 12 : 13, color: colors.text, fontWeight: '600' }} maxLines={1} />
          </FlexWidget>
          <Bar progress={row.progress} color={barColor(row.key)} track={colors.track} />
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}

/** Macros as three short columns (label, grams, bar) for the medium widget. */
function MacroColumns({ rows, colors }: { rows: MacroRow[]; colors: WidgetColors }) {
  const barColor = (key: MacroRow['key']) => (key === 'proteinG' ? colors.second : key === 'carbsG' ? colors.accent : colors.water);
  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', flexGap: 10 }}>
      {rows.map((row) => (
        <FlexWidget key={row.key} style={{ flex: 1, flexDirection: 'column', flexGap: 2 }}>
          <TextWidget text={row.label} style={{ fontSize: 11, color: colors.muted }} maxLines={1} truncate="END" />
          <TextWidget text={row.short} style={{ fontSize: 13, color: colors.text, fontWeight: '600' }} maxLines={1} truncate="END" />
          <Bar progress={row.progress} color={barColor(row.key)} track={colors.track} />
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}

function Mascot({ snapshot, mood, size }: { snapshot: WidgetSnapshot; mood: WidgetModel['mood']; size: number }) {
  return <SvgWidget svg={WIDGET_MASCOTS[snapshot.character][mood]} style={{ width: size, height: size }} />;
}

// ── Small (2 × 2) ───────────────────────────────────────────────────────────

/** Energy left as a big ring, the character inside the frame and the camera. */
function SmallWidget({ snapshot, colors, width, height, now }: Omit<LayoutProps, 'name'>) {
  const model = widgetModel(snapshot, now);
  // Room for the camera button in the corner, outside the ring's text.
  const side = Math.max(96, Math.min(width, height) - 34);
  const ring = ringSvg(model.remaining.progress, colors, model.remaining.value, model.remaining.caption, 20, 22, 17);
  const mascotSize = Math.round(side * 0.25);
  const camera = actions(snapshot)[0];
  return (
    <Frame colors={colors} padding={10}>
      <OverlapWidget style={{ width: 'match_parent', height: 'match_parent' }}>
        <FlexWidget style={{ width: 'match_parent', height: 'match_parent', justifyContent: 'center', alignItems: 'center' }}>
          <SvgWidget svg={ring} style={{ width: side, height: side }} />
        </FlexWidget>
        <FlexWidget style={{ width: 'match_parent', height: 'match_parent', justifyContent: 'center', alignItems: 'center' }}>
          <FlexWidget style={{ width: side, height: side, flexDirection: 'column', alignItems: 'center' }}>
            <FlexWidget style={{ width: mascotSize, height: Math.round(side * 0.15) }} />
            <Mascot snapshot={snapshot} mood={model.mood} size={mascotSize} />
          </FlexWidget>
        </FlexWidget>
        <FlexWidget style={{ width: 'match_parent', height: 'match_parent', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <FlexWidget
              {...clickOf('photo')}
              accessibilityLabel={camera.a11y}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' }}
            >
              <SvgWidget svg={icon('camera', colors.onAccent)} style={{ width: 20, height: 20 }} />
            </FlexWidget>
          </FlexWidget>
        </FlexWidget>
      </OverlapWidget>
    </Frame>
  );
}

// ── Medium (4 × 2) ──────────────────────────────────────────────────────────

/** Ring (eaten / goal), macro bars, the character's mood and four quick actions. */
function MediumWidget({ snapshot, colors, width, height, now }: Omit<LayoutProps, 'name'>) {
  const model = widgetModel(snapshot, now);
  const compact = height < 170;
  const padding = compact ? 12 : 14;
  const gap = compact ? 8 : 10;
  // The ring fills the height left after the quick actions, never more.
  const rowHeight = height - padding * 2 - gap - (compact ? 40 : 52);
  const ringSide = Math.max(56, Math.min(rowHeight, width * 0.34, 124));
  const ring = ringSvg(model.eaten.progress, colors, model.eaten.value, model.eaten.caption, 18);
  return (
    <Frame colors={colors} padding={padding}>
      <FlexWidget style={{ width: 'match_parent', flex: 1, flexDirection: 'row', alignItems: 'center', flexGap: 12 }}>
        <SvgWidget svg={ring} style={{ width: ringSide, height: ringSide }} />
        <FlexWidget style={{ flex: 1, height: 'match_parent', flexDirection: 'column', justifyContent: 'center', flexGap: 6 }}>
          <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center' }}>
            <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
              <TextWidget text={model.title} style={{ fontSize: 14, color: colors.text, fontWeight: 'bold' }} maxLines={1} />
              {model.eaten.left ? (
                <TextWidget text={model.eaten.left} style={{ fontSize: 12, color: colors.accentText, fontWeight: '600' }} maxLines={1} truncate="END" />
              ) : null}
            </FlexWidget>
            <Mascot snapshot={snapshot} mood={model.mood} size={compact ? 32 : 38} />
          </FlexWidget>
          {model.macros && !model.empty ? (
            <MacroColumns rows={model.macros} colors={colors} />
          ) : (
            <TextWidget text={model.message} style={{ fontSize: 13, color: colors.text }} maxLines={compact ? 2 : 3} truncate="END" />
          )}
        </FlexWidget>
      </FlexWidget>
      <FlexWidget style={{ width: 'match_parent', height: gap }} />
      <ActionRow snapshot={snapshot} colors={colors} model={model} compact={compact} />
    </Frame>
  );
}

// ── Large (4 × 4) ───────────────────────────────────────────────────────────

/**
 * The medium widget plus the character's message in its own voice, water
 * glasses, streak and quests, and the next planned dinner.
 */
function LargeWidget({ snapshot, colors, width, height, now }: Omit<LayoutProps, 'name'>) {
  const model = widgetModel(snapshot, now);
  const roomy = height >= 420;
  const header = roomy ? 56 : 46;
  const waterRow = 62;
  const nextRow = 44;
  const buttons = roomy ? 52 : 40;
  // What is left for the ring row after the fixed rows and the 8 dp gaps between them.
  const rowHeight = height - 32 - header - waterRow - nextRow - buttons - 8 * 4;
  const ringSide = Math.max(64, Math.min(rowHeight, width * 0.36, 132));
  const ring = ringSvg(model.eaten.progress, colors, model.eaten.value, model.eaten.caption, 18);
  const glasses = glassesSvg(model.water.filled, model.water.total, colors);
  const glassesWidth = Math.min(width - 150, model.water.total * 17);
  return (
    <Frame colors={colors} padding={16}>
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center', flexGap: 10 }}>
        <Mascot snapshot={snapshot} mood={model.mood} size={header} />
        <FlexWidget style={{ flex: 1, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'column' }}>
          <TextWidget text={model.message} style={{ fontSize: 13, color: colors.text }} maxLines={roomy ? 3 : 2} truncate="END" />
          {model.empty ? <TextWidget text={model.emptyHint} style={{ fontSize: 11, color: colors.muted, marginTop: 2 }} maxLines={1} truncate="END" /> : null}
        </FlexWidget>
      </FlexWidget>

      <FlexWidget style={{ width: 'match_parent', height: 8 }} />
      <FlexWidget style={{ width: 'match_parent', flex: 1, flexDirection: 'row', alignItems: 'center', flexGap: 14 }}>
        <SvgWidget svg={ring} style={{ width: ringSide, height: ringSide }} />
        <FlexWidget style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', flexGap: 6 }}>
          {model.eaten.left ? (
            <TextWidget text={model.eaten.left} style={{ fontSize: 13, color: colors.accentText, fontWeight: '600' }} maxLines={1} truncate="END" />
          ) : (
            <TextWidget text={model.title} style={{ fontSize: 15, color: colors.text, fontWeight: 'bold' }} maxLines={1} />
          )}
          {model.macros ? <MacroRows rows={model.macros} colors={colors} compact /> : null}
        </FlexWidget>
      </FlexWidget>
      <FlexWidget style={{ width: 'match_parent', height: 8 }} />

      <FlexWidget
        clickAction={WATER_ADD}
        clickActionData={{}}
        accessibilityLabel={format(strings.widget.waterAddA11y, { amount: formatDrink(snapshot.glassMl) })}
        style={{ width: 'match_parent', height: waterRow, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 12, flexGap: 10 }}
      >
        <FlexWidget style={{ flex: 1, flexDirection: 'column', flexGap: 4 }}>
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 6 }}>
            <SvgWidget svg={icon('water', colors.water)} style={{ width: 16, height: 16 }} />
            <TextWidget text={`${model.water.label} · ${model.water.value}`} style={{ fontSize: 12, color: colors.text, fontWeight: '600' }} maxLines={1} />
          </FlexWidget>
          <SvgWidget svg={glasses} style={{ width: glassesWidth, height: 24 }} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end', flexGap: 4 }}>
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 4 }}>
            <SvgWidget svg={icon('flame', colors.accentText)} style={{ width: 14, height: 14 }} />
            <TextWidget text={model.streak} style={{ fontSize: 12, color: colors.text }} maxLines={1} />
          </FlexWidget>
          {model.quests ? (
            <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 4 }}>
              <SvgWidget svg={icon('target', colors.accentText)} style={{ width: 14, height: 14 }} />
              <TextWidget text={model.quests} style={{ fontSize: 12, color: colors.text }} maxLines={1} />
            </FlexWidget>
          ) : null}
        </FlexWidget>
      </FlexWidget>

      <FlexWidget style={{ width: 'match_parent', height: 8 }} />
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: model.next.recipeId ? `platepal:///recipe/${model.next.recipeId}` : URI.plan }}
        accessibilityLabel={`${model.next.kicker}: ${model.next.title}`}
        style={{ width: 'match_parent', height: nextRow, flexDirection: 'row', alignItems: 'center', flexGap: 10 }}
      >
        {model.next.imageUrl && model.next.imageUrl.startsWith('https:') ? (
          <ImageWidget image={model.next.imageUrl as `https:${string}`} imageWidth={44} imageHeight={44} radius={12} />
        ) : (
          <FlexWidget style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accentSoft, justifyContent: 'center', alignItems: 'center' }}>
            <SvgWidget svg={icon('pot', colors.accentText)} style={{ width: 22, height: 22 }} />
          </FlexWidget>
        )}
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget text={model.next.kicker} style={{ fontSize: 11, color: colors.muted }} maxLines={1} />
          <TextWidget text={model.next.title} style={{ fontSize: 14, color: colors.text, fontWeight: '600' }} maxLines={1} truncate="END" />
        </FlexWidget>
      </FlexWidget>
      <FlexWidget style={{ width: 'match_parent', height: 8 }} />
      <ActionRow snapshot={snapshot} colors={colors} model={model} compact={!roomy} />
    </Frame>
  );
}
