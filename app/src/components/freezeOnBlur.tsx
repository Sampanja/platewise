import { useIsFocused } from 'expo-router';
import { memo, useEffect, useState, type ComponentType } from 'react';
import { Freeze } from 'react-freeze';

/** Long enough for a stack push or tab fade to finish before the screen below freezes. */
const FREEZE_DELAY_MS = 450;

/**
 * Tab screens stay mounted when another tab or a stacked screen is open.
 * Without this, every store change (an allergy toggle, a diary entry)
 * re-rendered all of them in the background, e.g. the Reseptit list with its
 * illustrations, and a tap took most of a second. A frozen screen skips
 * renders until it is focused again and then renders once with the latest
 * state. Freezing waits for the transition, so the screen underneath does not
 * blank out while the next one slides in; unfreezing is immediate.
 *
 * Expo Router ignores the navigators' `freezeOnBlur` option, hence this.
 */
export function withFreezeOnBlur<P extends object>(Screen: ComponentType<P>): ComponentType<P> {
  // Memoised, so a focus change alone does not re-render the whole screen.
  const Inner = memo(Screen) as unknown as ComponentType<P>;
  function Frozen(props: P) {
    const focused = useIsFocused();
    const [frozen, setFrozen] = useState(false);
    // Focus again: thaw now, so the next blur waits for its transition too.
    if (focused && frozen) setFrozen(false);
    useEffect(() => {
      if (focused) return;
      const timer = setTimeout(() => setFrozen(true), FREEZE_DELAY_MS);
      return () => clearTimeout(timer);
    }, [focused]);
    return (
      <Freeze freeze={!focused && frozen}>
        <Inner {...props} />
      </Freeze>
    );
  }
  Frozen.displayName = `withFreezeOnBlur(${Screen.displayName ?? Screen.name})`;
  return Frozen;
}
