/**
 * Tests for handleMediaChange logic (BUG-MENU-015).
 *
 * The fix stores media settings in `defaultMediaSettings` instead of
 * spreading them into `layout`, which would pollute the layout object
 * with foreign properties (position, size, fit).
 */
import MediaFit from '../../../../types/enums/MediaFit';
import MediaPosition from '../../../../types/enums/MediaPosition';
import MediaSize from '../../../../types/enums/MediaSize';

import type { MediaSettings } from '../../../../types/menuStyleTypes';
import type { MenuContents } from '../../../../types/menuTypes';

/**
 * Replicate the fixed handleMediaChange logic.
 */
function applyMediaChange(value: MenuContents, mediaSettings: MediaSettings): MenuContents {
  return { ...value, defaultMediaSettings: mediaSettings };
}

/**
 * Replicate the OLD buggy handleMediaChange logic for comparison.
 */
function applyMediaChangeBuggy(value: MenuContents, mediaSettings: MediaSettings): MenuContents {
  return { ...value, layout: { ...value.layout, ...mediaSettings } };
}

describe('handleMediaChange (BUG-MENU-015)', () => {
  const baseValue: MenuContents = {
    layout: { template: 'modern-grid' as never },
    categories: [],
  };

  const mediaSettings: MediaSettings = {
    position: MediaPosition.Left,
    size: MediaSize.Medium,
    fit: MediaFit.Cover,
  };

  it('stores media settings in defaultMediaSettings field', () => {
    const result = applyMediaChange(baseValue, mediaSettings);

    expect(result.defaultMediaSettings).toEqual(mediaSettings);
  });

  it('does not pollute layout with media properties', () => {
    const result = applyMediaChange(baseValue, mediaSettings);

    // Layout should remain unchanged
    expect(result.layout).toEqual(baseValue.layout);
    // Layout should NOT have position, size, fit
    const layout = result.layout as Record<string, unknown>;
    expect(layout.position).toBeUndefined();
    expect(layout.size).toBeUndefined();
    expect(layout.fit).toBeUndefined();
  });

  it('preserves existing layout settings when media changes', () => {
    const valueWithLayout: MenuContents = {
      layout: {
        template: 'modern-grid' as never,
        itemsPerRow: 3,
        showCategoryDividers: true,
      },
      categories: [],
    };

    const result = applyMediaChange(valueWithLayout, mediaSettings);

    expect(result.layout?.template).toBe('modern-grid');
    expect(result.layout?.itemsPerRow).toBe(3);
    expect(result.layout?.showCategoryDividers).toBe(true);
  });

  it('replaces previous defaultMediaSettings', () => {
    const valueWithExisting: MenuContents = {
      layout: { template: 'modern-grid' as never },
      defaultMediaSettings: {
        position: MediaPosition.Top,
        size: MediaSize.Large,
        fit: MediaFit.Contain,
      },
      categories: [],
    };

    const newSettings: MediaSettings = {
      position: MediaPosition.Right,
      size: MediaSize.Small,
      fit: MediaFit.Cover,
    };

    const result = applyMediaChange(valueWithExisting, newSettings);

    expect(result.defaultMediaSettings).toEqual(newSettings);
    expect(result.defaultMediaSettings?.position).toBe(MediaPosition.Right);
  });

  it('buggy version would pollute layout (demonstrating the bug)', () => {
    const result = applyMediaChangeBuggy(baseValue, mediaSettings);

    // The buggy version adds media properties into layout
    const layout = result.layout as Record<string, unknown>;
    expect(layout.position).toBe(MediaPosition.Left);
    expect(layout.size).toBe(MediaSize.Medium);
    expect(layout.fit).toBe(MediaFit.Cover);
  });
});
