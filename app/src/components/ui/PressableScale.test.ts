import { describe, expect, it } from '@jest/globals';

import { splitPressableStyle } from './PressableScale';

describe('splitPressableStyle', () => {
  it('puts flex layout on the Pressable so it fills its slot in a row', () => {
    const { outer, inner } = splitPressableStyle([{ flex: 1, height: 66, alignItems: 'center' }]);
    expect(outer).toEqual({ flex: 1 });
    expect(inner).toEqual({ height: 66, alignItems: 'center', flexGrow: 1 });
  });

  it('keeps margins and position outside and visuals inside', () => {
    const { outer, inner } = splitPressableStyle({
      marginTop: 8,
      position: 'absolute',
      top: 4,
      backgroundColor: 'red',
      borderRadius: 10,
      padding: 12,
    });
    expect(outer).toEqual({ marginTop: 8, position: 'absolute', top: 4 });
    expect(inner).toEqual({ backgroundColor: 'red', borderRadius: 10, padding: 12 });
  });

  it('sizes the inner view to the Pressable when a width is given', () => {
    const { outer, inner } = splitPressableStyle({ width: '47%', minHeight: 48 });
    expect(outer).toEqual({ width: '47%' });
    expect(inner).toEqual({ width: '100%', minHeight: 48 });
  });

  it('handles no style', () => {
    expect(splitPressableStyle(undefined)).toEqual({ outer: {}, inner: {} });
  });
});
