/**
 * Menu Defaults Utility
 *
 * Provides sensible default values for menu styling properties,
 * ensuring backward compatibility with legacy menus that don't
 * have the new Phase 2 customization fields.
 *
 * Entity-level defaults (category, item) are in menuDefaultsEntityLevel.ts.
 *
 * @see BaseClient/docs/Tasks/TODO/menu-customization-feature.md
 */

import {
  DEFAULT_CATEGORY_IMAGE_SETTINGS,
  DEFAULT_CATEGORY_TYPOGRAPHY,
  DEFAULT_CATEGORY_LAYOUT,
  DEFAULT_BOX_STYLING,
  DEFAULT_ITEM_IMAGE_SETTINGS,
  DEFAULT_ITEM_TYPOGRAPHY,
  DEFAULT_PRICE_STYLE,
  DEFAULT_ITEM_LAYOUT,
  DEFAULT_AVAILABILITY_BADGE,
} from './menuDefaultsEntityLevel';
import CategoryLayoutType from '../types/enums/CategoryLayoutType';
import FontWeight from '../types/enums/FontWeight';
import HorizontalPosition from '../types/enums/HorizontalPosition';
import ItemLayoutType from '../types/enums/ItemLayoutType';
import LayoutTemplate from '../types/enums/LayoutTemplate';
import LogoSize from '../types/enums/LogoSize';

import type {
  GlobalTypography,
  ColorScheme,
  MenuLayoutSettings,
  HeaderSettings,
  SpacingSettings,
} from '../types/menuStyleTypes';
import type { MenuContents, Category, MenuItem } from '../types/menuTypes';

// Re-export entity-level defaults for backward compatibility
export {
  DEFAULT_CATEGORY_IMAGE_SETTINGS,
  DEFAULT_CATEGORY_TYPOGRAPHY,
  DEFAULT_CATEGORY_LAYOUT,
  DEFAULT_BOX_STYLING,
  DEFAULT_ITEM_IMAGE_SETTINGS,
  DEFAULT_ITEM_TYPOGRAPHY,
  DEFAULT_PRICE_STYLE,
  DEFAULT_ITEM_LAYOUT,
  DEFAULT_AVAILABILITY_BADGE,
} from './menuDefaultsEntityLevel';

// =============================================================================
// Menu-Level Default Constants
// =============================================================================

/** Default typography settings for the entire menu. */
export const DEFAULT_TYPOGRAPHY: Required<GlobalTypography> = {
  titleFont: 'System',
  titleFontSize: 32,
  titleFontWeight: FontWeight.Bold,
  bodyFont: 'System',
  bodyFontSize: 16,
  bodyFontWeight: FontWeight.Normal,
  priceFont: 'System',
  priceFontSize: 18,
  priceFontWeight: FontWeight.Bold,
};

/** Default color scheme for the menu. */
export const DEFAULT_COLOR_SCHEME: Required<ColorScheme> = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  accent: '#007AFF',
  price: '#000000',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  unavailable: '#999999',
};

/** Default layout settings for the menu. */
export const DEFAULT_LAYOUT: Required<MenuLayoutSettings> = {
  template: LayoutTemplate.ClassicList,
  categoryLayout: CategoryLayoutType.FullWidth,
  itemLayout: ItemLayoutType.List,
  itemsPerRow: 2,
  showCategoryDividers: true,
  showItemDividers: false,
};

/** Default header settings for the menu. */
export const DEFAULT_HEADER: Required<HeaderSettings> = {
  showLogo: false,
  logoPosition: HorizontalPosition.Center,
  logoSize: LogoSize.Medium,
  logoContentId: null,
  bannerContentId: null,
  bannerHeight: 200,
  showMenuName: true,
  showMenuDescription: true,
  titlePosition: HorizontalPosition.Center,
};

/** Default spacing settings for the menu (values in pixels). */
export const DEFAULT_SPACING: Required<SpacingSettings> = {
  pagePadding: 16,
  categorySpacing: 24,
  itemSpacing: 12,
  contentPadding: 16,
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Deep merges user settings with defaults, preserving user overrides.
 * Returns a fully populated MenuContents object.
 */
export function applyMenuDefaults(contents: MenuContents | null | undefined): MenuContents {
  if (!contents)
    return {
      schemaVersion: 2,
      categories: [],
      typography: { ...DEFAULT_TYPOGRAPHY },
      colorScheme: { ...DEFAULT_COLOR_SCHEME },
      layout: { ...DEFAULT_LAYOUT },
      header: { ...DEFAULT_HEADER },
      spacing: { ...DEFAULT_SPACING },
    };

  return {
    ...contents,
    schemaVersion: contents.schemaVersion ?? 2,
    typography: { ...DEFAULT_TYPOGRAPHY, ...contents.typography },
    colorScheme: { ...DEFAULT_COLOR_SCHEME, ...contents.colorScheme },
    layout: { ...DEFAULT_LAYOUT, ...contents.layout },
    header: { ...DEFAULT_HEADER, ...contents.header },
    spacing: { ...DEFAULT_SPACING, ...contents.spacing },
    categories: contents.categories?.map(applyCategoryDefaults) ?? [],
  };
}

/** Applies default values to a category. */
export function applyCategoryDefaults(category: Category): Category {
  return {
    ...category,
    imageSettings: category.imageSettings
      ? { ...DEFAULT_CATEGORY_IMAGE_SETTINGS, ...category.imageSettings }
      : undefined,
    videoSettings: category.videoSettings
      ? { ...DEFAULT_CATEGORY_IMAGE_SETTINGS, ...category.videoSettings }
      : undefined,
    typography: { ...DEFAULT_CATEGORY_TYPOGRAPHY, ...category.typography },
    layout: { ...DEFAULT_CATEGORY_LAYOUT, ...category.layout },
    styling: { ...DEFAULT_BOX_STYLING, ...category.styling },
    items: category.items?.map(applyItemDefaults) ?? [],
  };
}

/** Applies default values to a menu item. */
export function applyItemDefaults(item: MenuItem): MenuItem {
  return {
    ...item,
    imageSettings: item.imageSettings
      ? { ...DEFAULT_ITEM_IMAGE_SETTINGS, ...item.imageSettings }
      : undefined,
    videoSettings: item.videoSettings
      ? { ...DEFAULT_ITEM_IMAGE_SETTINGS, ...item.videoSettings }
      : undefined,
    typography: { ...DEFAULT_ITEM_TYPOGRAPHY, ...item.typography },
    priceStyle: { ...DEFAULT_PRICE_STYLE, ...item.priceStyle },
    layout: { ...DEFAULT_ITEM_LAYOUT, ...item.layout },
    styling: { ...DEFAULT_BOX_STYLING, ...item.styling },
    availabilityBadge: { ...DEFAULT_AVAILABILITY_BADGE, ...item.availabilityBadge },
  };
}

/**
 * Normalizes menu contents based on schema version.
 * Handles migration from legacy menus (v1) to current schema (v2).
 */
export function normalizeMenuContents(contents: MenuContents | null | undefined): MenuContents {
  if (!contents) return applyMenuDefaults(null);

  const version = contents.schemaVersion ?? 1;

  switch (version) {
    case 1:
      return applyMenuDefaults({ ...contents, schemaVersion: 2 });
    case 2:
      return applyMenuDefaults(contents);
    default:
      return applyMenuDefaults(contents);
  }
}
