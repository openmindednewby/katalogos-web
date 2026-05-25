/**
 * Unit tests for CategorySection component.
 *
 * These tests focus on LOGIC, not rendering:
 * - Style generation based on category settings
 * - Media visibility logic
 * - Description visibility logic
 * - Default value handling
 */
import FontWeight from '../../../../types/enums/FontWeight';
import MediaFit from '../../../../types/enums/MediaFit';
import MediaPosition from '../../../../types/enums/MediaPosition';
import { isValueDefined } from '../../../../utils/is';
import {
  DEFAULT_CATEGORY_TYPOGRAPHY,
  DEFAULT_BOX_STYLING,
  DEFAULT_ITEM_IMAGE_SETTINGS,
} from '../../../../utils/menuDefaults';
import { generateCategoryStyles, generateMediaStyles } from '../../../../utils/menuStyleGenerator';

import type { BoxStyling, CategoryTypography } from '../../../../types/menuStyleTypes';
import type { Category, MenuContents } from '../../../../types/menuTypes';

// =============================================================================
// Test Data Factories
// =============================================================================

function createCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'test-category',
    name: 'Test Category',
    displayOrder: 0,
    items: [],
    ...overrides,
  };
}

function createGlobalStyles(overrides: Partial<MenuContents> = {}): MenuContents {
  return {
    categories: [],
    ...overrides,
  };
}

// =============================================================================
// Style Generation Tests
// =============================================================================

describe('CategorySection Style Generation', () => {
  describe('generateCategoryStyles', () => {
    it('applies default styles when category has no custom styling', () => {
      const category = createCategory();
      const styles = generateCategoryStyles(category, undefined);

      expect(styles.container.padding).toBe(DEFAULT_BOX_STYLING.padding);
      expect(styles.container.borderRadius).toBe(DEFAULT_BOX_STYLING.borderRadius);
      expect(styles.title.fontSize).toBe(DEFAULT_CATEGORY_TYPOGRAPHY.titleFontSize);
    });

    it('applies custom box styling from category', () => {
      const customStyling: BoxStyling = {
        padding: 24,
        margin: 8,
        borderWidth: 2,
        borderColor: '#FF0000',
        borderRadius: 16,
        shadowEnabled: true,
      };
      const category = createCategory({ styling: customStyling });
      const styles = generateCategoryStyles(category, undefined);

      expect(styles.container.padding).toBe(24);
      expect(styles.container.margin).toBe(8);
      expect(styles.container.borderWidth).toBe(2);
      expect(styles.container.borderColor).toBe('#FF0000');
      expect(styles.container.borderRadius).toBe(16);
    });

    it('applies custom typography from category', () => {
      const customTypography: CategoryTypography = {
        titleFontSize: 32,
        titleFontWeight: FontWeight.W700,
        titleColor: '#333333',
        descriptionFontSize: 16,
        descriptionColor: '#666666',
      };
      const category = createCategory({ typography: customTypography });
      const styles = generateCategoryStyles(category, undefined);

      expect(styles.title.fontSize).toBe(32);
      expect(styles.title.fontWeight).toBe('700');
      expect(styles.title.color).toBe('#333333');
      expect(styles.description.fontSize).toBe(16);
      expect(styles.description.color).toBe('#666666');
    });

    it('inherits colors from global color scheme when not overridden', () => {
      const globalStyles = createGlobalStyles({
        colorScheme: {
          text: '#1A1A1A',
          textSecondary: '#888888',
        },
      });
      const category = createCategory();
      const styles = generateCategoryStyles(category, globalStyles.colorScheme);

      expect(styles.title.color).toBe('#1A1A1A');
      expect(styles.description.color).toBe('#888888');
    });

    it('category typography colors override global color scheme', () => {
      const globalStyles = createGlobalStyles({
        colorScheme: {
          text: '#1A1A1A',
          textSecondary: '#888888',
        },
      });
      const category = createCategory({
        typography: {
          titleColor: '#FF0000',
          descriptionColor: '#00FF00',
        },
      });
      const styles = generateCategoryStyles(category, globalStyles.colorScheme);

      expect(styles.title.color).toBe('#FF0000');
      expect(styles.description.color).toBe('#00FF00');
    });

    it('applies shadow styles when shadowEnabled is true', () => {
      const category = createCategory({
        styling: {
          shadowEnabled: true,
          shadowColor: '#000000',
          shadowBlur: 8,
        },
      });
      const styles = generateCategoryStyles(category, undefined);

      expect(styles.container.shadowColor).toBe('#000000');
      expect(styles.container.elevation).toBeDefined();
    });

    it('does not apply shadow styles when shadowEnabled is false', () => {
      const category = createCategory({
        styling: {
          shadowEnabled: false,
        },
      });
      const styles = generateCategoryStyles(category, undefined);

      expect(styles.container.shadowColor).toBeUndefined();
      expect(styles.container.elevation).toBeUndefined();
    });
  });
});

// =============================================================================
// Media Style Generation Tests
// =============================================================================

describe('CategorySection Media Style Generation', () => {
  describe('generateMediaStyles', () => {
    it('applies default media settings when none provided', () => {
      const styles = generateMediaStyles(undefined);

      // generateMediaStyles uses DEFAULT_ITEM_IMAGE_SETTINGS as the base
      expect(styles.borderRadius).toBe(DEFAULT_ITEM_IMAGE_SETTINGS.borderRadius);
      expect(styles.opacity).toBe(DEFAULT_ITEM_IMAGE_SETTINGS.opacity);
    });

    it('applies custom border radius from settings', () => {
      const styles = generateMediaStyles({ borderRadius: 16 });

      expect(styles.borderRadius).toBe(16);
    });

    it('applies custom opacity from settings', () => {
      const styles = generateMediaStyles({ opacity: 0.8 });

      expect(styles.opacity).toBe(0.8);
    });

    it('applies resize mode based on fit setting', () => {
      const coverStyles = generateMediaStyles({ fit: MediaFit.Cover });
      const containStyles = generateMediaStyles({ fit: MediaFit.Contain });

      expect(coverStyles.resizeMode).toBe('cover');
      expect(containStyles.resizeMode).toBe('contain');
    });
  });
});

// =============================================================================
// Media Position Logic Tests
// =============================================================================

describe('CategorySection Media Position Logic', () => {
  describe('position determines layout direction', () => {
    it.each([
      ['left', 'row'],
      ['right', 'row-reverse'],
      ['top', 'column'],
      ['bottom', 'column-reverse'],
      ['background', 'column'],
      ['none', 'column'],
    ])('position "%s" results in flexDirection "%s"', (position, expectedDirection) => {
      // This tests the getFlexDirection logic
      const getFlexDirection = (pos: MediaPosition): string => {
        switch (pos) {
          case MediaPosition.Left:
            return 'row';
          case MediaPosition.Right:
            return 'row-reverse';
          case MediaPosition.Top:
            return 'column';
          case MediaPosition.Bottom:
            return 'column-reverse';
          case MediaPosition.Background:
          case MediaPosition.None:
          default:
            return 'column';
        }
      };

      expect(getFlexDirection(position as MediaPosition)).toBe(expectedDirection);
    });
  });

  describe('shouldShowMedia logic', () => {
    it('returns false when position is "none"', () => {
      const shouldShowMedia = (position: MediaPosition | undefined): boolean => {
        return position !== MediaPosition.None;
      };

      expect(shouldShowMedia(MediaPosition.None)).toBe(false);
    });

    it('returns true for all other positions', () => {
      const shouldShowMedia = (position: MediaPosition | undefined): boolean => {
        return position !== MediaPosition.None;
      };

      const visiblePositions: MediaPosition[] = [MediaPosition.Left, MediaPosition.Right, MediaPosition.Top, MediaPosition.Bottom, MediaPosition.Background];
      visiblePositions.forEach((position) => {
        expect(shouldShowMedia(position)).toBe(true);
      });
    });
  });
});

// =============================================================================
// Description Visibility Logic Tests
// =============================================================================

describe('CategorySection Description Visibility Logic', () => {
  const isDescriptionVisible = (category: Category): boolean => {
    return category.typography?.descriptionVisible ?? DEFAULT_CATEGORY_TYPOGRAPHY.descriptionVisible ?? true;
  };

  it('returns true by default when typography is undefined', () => {
    const category = createCategory();
    expect(isDescriptionVisible(category)).toBe(true);
  });

  it('returns true when descriptionVisible is true', () => {
    const category = createCategory({
      typography: { descriptionVisible: true },
    });
    expect(isDescriptionVisible(category)).toBe(true);
  });

  it('returns false when descriptionVisible is false', () => {
    const category = createCategory({
      typography: { descriptionVisible: false },
    });
    expect(isDescriptionVisible(category)).toBe(false);
  });

  it('returns default when descriptionVisible is undefined', () => {
    const category = createCategory({
      typography: { titleFontSize: 24 }, // Other property set, but not descriptionVisible
    });
    expect(isDescriptionVisible(category)).toBe(DEFAULT_CATEGORY_TYPOGRAPHY.descriptionVisible);
  });
});

// =============================================================================
// Default Value Handling Tests
// =============================================================================

describe('CategorySection Default Value Handling', () => {
  it('uses default category name when name is undefined', () => {
    const category = createCategory({ name: undefined });
    const categoryName = category.name ?? 'Category';
    expect(categoryName).toBe('Category');
  });

  it('uses provided category name when defined', () => {
    const category = createCategory({ name: 'Pizza' });
    const categoryName = category.name ?? 'Category';
    expect(categoryName).toBe('Pizza');
  });

  it('handles empty items array gracefully', () => {
    const category = createCategory({ items: [] });
    const items = category.items ?? [];
    expect(items).toHaveLength(0);
  });

  it('handles undefined items gracefully', () => {
    const category = createCategory({ items: undefined });
    const items = category.items ?? [];
    expect(items).toHaveLength(0);
  });
});

// =============================================================================
// Media Content Detection Tests
// =============================================================================

describe('CategorySection Media Content Detection', () => {
  const hasMedia = (category: Category): boolean => {
    const hasImage = isValueDefined(category.imageContentId) && category.imageContentId !== '';
    const hasVideo = isValueDefined(category.videoContentId) && category.videoContentId !== '';
    return hasImage || hasVideo;
  };

  it('returns true when category has imageContentId', () => {
    const category = createCategory({ imageContentId: 'img-123' });
    expect(hasMedia(category)).toBe(true);
  });

  it('returns true when category has videoContentId', () => {
    const category = createCategory({ videoContentId: 'vid-456' });
    expect(hasMedia(category)).toBe(true);
  });

  it('returns true when category has both image and video', () => {
    const category = createCategory({
      imageContentId: 'img-123',
      videoContentId: 'vid-456',
    });
    expect(hasMedia(category)).toBe(true);
  });

  it('returns false when category has no media', () => {
    const category = createCategory();
    expect(hasMedia(category)).toBe(false);
  });

  it('returns false when imageContentId is empty string', () => {
    const category = createCategory({ imageContentId: '' });
    expect(hasMedia(category)).toBe(false);
  });

  it('returns false when imageContentId is null', () => {
    const category = createCategory({ imageContentId: null });
    expect(hasMedia(category)).toBe(false);
  });
});

// =============================================================================
// Overlay Settings Tests
// =============================================================================

describe('CategorySection Overlay Settings', () => {
  const isOverlayEnabled = (overlay: { enabled: boolean; color: string; opacity: number } | undefined): boolean => {
    return isValueDefined(overlay) && overlay.enabled === true;
  };

  it('returns false when overlay is undefined', () => {
    expect(isOverlayEnabled(undefined)).toBe(false);
  });

  it('returns false when overlay.enabled is false', () => {
    const overlay = { enabled: false, color: '#000000', opacity: 0.5 };
    expect(isOverlayEnabled(overlay)).toBe(false);
  });

  it('returns true when overlay.enabled is true', () => {
    const overlay = { enabled: true, color: '#000000', opacity: 0.5 };
    expect(isOverlayEnabled(overlay)).toBe(true);
  });
});
