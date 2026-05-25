/**
 * Unit tests for menuDefaults utility.
 *
 * Tests focus on logic:
 * - Proper merging of defaults with user values
 * - Handling of null/undefined inputs
 * - Schema version migration
 * - Edge cases for nested objects
 */


import {
  applyMenuDefaults,
  applyCategoryDefaults,
  applyItemDefaults,
  normalizeMenuContents,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_COLOR_SCHEME,
  DEFAULT_LAYOUT,
  DEFAULT_HEADER,
  DEFAULT_SPACING,
  DEFAULT_CATEGORY_IMAGE_SETTINGS,
  DEFAULT_CATEGORY_TYPOGRAPHY,
  DEFAULT_CATEGORY_LAYOUT,
  DEFAULT_BOX_STYLING,
  DEFAULT_ITEM_IMAGE_SETTINGS,
  DEFAULT_ITEM_TYPOGRAPHY,
  DEFAULT_PRICE_STYLE,
  DEFAULT_ITEM_LAYOUT,
  DEFAULT_AVAILABILITY_BADGE,
} from './menuDefaults';
import HorizontalPosition from '../types/enums/HorizontalPosition';
import ItemImagePosition from '../types/enums/ItemImagePosition';
import ItemLayoutVariant from '../types/enums/ItemLayoutVariant';
import LayoutTemplate from '../types/enums/LayoutTemplate';
import MediaPosition from '../types/enums/MediaPosition';
import MediaSize from '../types/enums/MediaSize';
import PricePosition from '../types/enums/PricePosition';

import type { MediaSettings, OverlaySettings } from '../types/menuStyleTypes';
import type { MenuContents, Category, MenuItem } from '../types/menuTypes';


describe('menuDefaults', () => {
  describe('applyMenuDefaults', () => {
    it('returns full defaults when contents is null', () => {
      const result = applyMenuDefaults(null);

      expect(result.schemaVersion).toBe(2);
      expect(result.categories).toEqual([]);
      expect(result.typography).toEqual(DEFAULT_TYPOGRAPHY);
      expect(result.colorScheme).toEqual(DEFAULT_COLOR_SCHEME);
      expect(result.layout).toEqual(DEFAULT_LAYOUT);
      expect(result.header).toEqual(DEFAULT_HEADER);
      expect(result.spacing).toEqual(DEFAULT_SPACING);
    });

    it('returns full defaults when contents is undefined', () => {
      const result = applyMenuDefaults(undefined);

      expect(result.schemaVersion).toBe(2);
      expect(result.categories).toEqual([]);
      expect(result.typography).toEqual(DEFAULT_TYPOGRAPHY);
      expect(result.colorScheme).toEqual(DEFAULT_COLOR_SCHEME);
      expect(result.layout).toEqual(DEFAULT_LAYOUT);
      expect(result.header).toEqual(DEFAULT_HEADER);
      expect(result.spacing).toEqual(DEFAULT_SPACING);
    });

    it('preserves existing values while adding defaults', () => {
      const contents: MenuContents = {
        schemaVersion: 2,
        typography: { titleFont: 'Arial' },
        colorScheme: { background: '#000000' },
      };

      const result = applyMenuDefaults(contents);

      // User values preserved
      expect(result.typography?.titleFont).toBe('Arial');
      expect(result.colorScheme?.background).toBe('#000000');

      // Defaults applied for missing values
      expect(result.typography?.titleFontSize).toBe(DEFAULT_TYPOGRAPHY.titleFontSize);
      expect(result.colorScheme?.text).toBe(DEFAULT_COLOR_SCHEME.text);
    });

    it('applies typography defaults', () => {
      const contents: MenuContents = {
        typography: { titleFont: 'CustomFont', titleFontSize: 40 },
      };

      const result = applyMenuDefaults(contents);

      expect(result.typography?.titleFont).toBe('CustomFont');
      expect(result.typography?.titleFontSize).toBe(40);
      expect(result.typography?.titleFontWeight).toBe(DEFAULT_TYPOGRAPHY.titleFontWeight);
      expect(result.typography?.bodyFont).toBe(DEFAULT_TYPOGRAPHY.bodyFont);
      expect(result.typography?.bodyFontSize).toBe(DEFAULT_TYPOGRAPHY.bodyFontSize);
    });

    it('applies colorScheme defaults', () => {
      const contents: MenuContents = {
        colorScheme: { accent: '#FF0000', price: '#00FF00' },
      };

      const result = applyMenuDefaults(contents);

      expect(result.colorScheme?.accent).toBe('#FF0000');
      expect(result.colorScheme?.price).toBe('#00FF00');
      expect(result.colorScheme?.background).toBe(DEFAULT_COLOR_SCHEME.background);
      expect(result.colorScheme?.text).toBe(DEFAULT_COLOR_SCHEME.text);
    });

    it('applies layout defaults', () => {
      const contents: MenuContents = {
        layout: { template: LayoutTemplate.ModernGrid, itemsPerRow: 3 },
      };

      const result = applyMenuDefaults(contents);

      expect(result.layout?.template).toBe('modern-grid');
      expect(result.layout?.itemsPerRow).toBe(3);
      expect(result.layout?.categoryLayout).toBe(DEFAULT_LAYOUT.categoryLayout);
      expect(result.layout?.showCategoryDividers).toBe(DEFAULT_LAYOUT.showCategoryDividers);
    });

    it('applies header defaults', () => {
      const contents: MenuContents = {
        header: { showLogo: true, logoPosition: HorizontalPosition.Left },
      };

      const result = applyMenuDefaults(contents);

      expect(result.header?.showLogo).toBe(true);
      expect(result.header?.logoPosition).toBe('left');
      expect(result.header?.logoSize).toBe(DEFAULT_HEADER.logoSize);
      expect(result.header?.bannerHeight).toBe(DEFAULT_HEADER.bannerHeight);
    });

    it('applies spacing defaults', () => {
      const contents: MenuContents = {
        spacing: { pagePadding: 24, categorySpacing: 32 },
      };

      const result = applyMenuDefaults(contents);

      expect(result.spacing?.pagePadding).toBe(24);
      expect(result.spacing?.categorySpacing).toBe(32);
      expect(result.spacing?.itemSpacing).toBe(DEFAULT_SPACING.itemSpacing);
      expect(result.spacing?.contentPadding).toBe(DEFAULT_SPACING.contentPadding);
    });

    it('processes categories with applyCategoryDefaults', () => {
      const category: Category = {
        name: 'Appetizers',
        displayOrder: 0,
        typography: { titleFontSize: 28 },
      };
      const contents: MenuContents = {
        categories: [category],
      };

      const result = applyMenuDefaults(contents);

      expect(result.categories).toHaveLength(1);
      expect(result.categories?.[0]?.name).toBe('Appetizers');
      expect(result.categories?.[0]?.typography?.titleFontSize).toBe(28);
      expect(result.categories?.[0]?.typography?.titleFontWeight).toBe(
        DEFAULT_CATEGORY_TYPOGRAPHY.titleFontWeight
      );
    });

    it('handles empty categories array', () => {
      const contents: MenuContents = {
        categories: [],
      };

      const result = applyMenuDefaults(contents);

      expect(result.categories).toEqual([]);
    });

    it('handles missing categories (undefined)', () => {
      const contents: MenuContents = {};

      const result = applyMenuDefaults(contents);

      expect(result.categories).toEqual([]);
    });

    it('sets schemaVersion to 2 when not provided', () => {
      const contents: MenuContents = {};

      const result = applyMenuDefaults(contents);

      expect(result.schemaVersion).toBe(2);
    });

    it('preserves existing schemaVersion', () => {
      const contents: MenuContents = { schemaVersion: 1 };

      const result = applyMenuDefaults(contents);

      expect(result.schemaVersion).toBe(1);
    });

    it('preserves legacy fields', () => {
      const contents: MenuContents = {
        titleFont: 'LegacyFont',
        backgroundColor: '#AABBCC',
        textColor: '#112233',
      };

      const result = applyMenuDefaults(contents);

      expect(result.titleFont).toBe('LegacyFont');
      expect(result.backgroundColor).toBe('#AABBCC');
      expect(result.textColor).toBe('#112233');
    });
  });

  describe('applyCategoryDefaults', () => {
    it('applies typography defaults to category', () => {
      const category: Category = {
        name: 'Main Dishes',
        displayOrder: 1,
        typography: { titleFontSize: 30 },
      };

      const result = applyCategoryDefaults(category);

      expect(result.typography?.titleFontSize).toBe(30);
      expect(result.typography?.titleFontWeight).toBe(DEFAULT_CATEGORY_TYPOGRAPHY.titleFontWeight);
      expect(result.typography?.descriptionFontSize).toBe(
        DEFAULT_CATEGORY_TYPOGRAPHY.descriptionFontSize
      );
      expect(result.typography?.descriptionVisible).toBe(
        DEFAULT_CATEGORY_TYPOGRAPHY.descriptionVisible
      );
    });

    it('applies layout defaults to category', () => {
      const category: Category = {
        name: 'Drinks',
        displayOrder: 2,
        layout: { collapsible: true, defaultCollapsed: true },
      };

      const result = applyCategoryDefaults(category);

      expect(result.layout?.collapsible).toBe(true);
      expect(result.layout?.defaultCollapsed).toBe(true);
      expect(result.layout?.titlePosition).toBe(DEFAULT_CATEGORY_LAYOUT.titlePosition);
      expect(result.layout?.contentAlignment).toBe(DEFAULT_CATEGORY_LAYOUT.contentAlignment);
    });

    it('applies styling defaults to category', () => {
      const category: Category = {
        name: 'Desserts',
        displayOrder: 3,
        styling: { padding: 24, borderRadius: 12 },
      };

      const result = applyCategoryDefaults(category);

      expect(result.styling?.padding).toBe(24);
      expect(result.styling?.borderRadius).toBe(12);
      expect(result.styling?.margin).toBe(DEFAULT_BOX_STYLING.margin);
      expect(result.styling?.shadowEnabled).toBe(DEFAULT_BOX_STYLING.shadowEnabled);
    });

    it('applies imageSettings only when present', () => {
      const category: Category = {
        name: 'Sides',
        displayOrder: 4,
        imageSettings: { position: MediaPosition.Background, size: MediaSize.Full },
      };

      const result = applyCategoryDefaults(category);

      expect(result.imageSettings?.position).toBe('background');
      expect(result.imageSettings?.size).toBe('full');
      expect(result.imageSettings?.fit).toBe(DEFAULT_CATEGORY_IMAGE_SETTINGS.fit);
      expect(result.imageSettings?.borderRadius).toBe(DEFAULT_CATEGORY_IMAGE_SETTINGS.borderRadius);
    });

    it('does not add imageSettings when not present', () => {
      const category: Category = {
        name: 'Salads',
        displayOrder: 5,
      };

      const result = applyCategoryDefaults(category);

      expect(result.imageSettings).toBeUndefined();
    });

    it('applies videoSettings only when present', () => {
      const category: Category = {
        name: 'Featured',
        displayOrder: 0,
        videoSettings: { position: MediaPosition.Top, size: MediaSize.Large },
      };

      const result = applyCategoryDefaults(category);

      expect(result.videoSettings?.position).toBe('top');
      expect(result.videoSettings?.size).toBe('large');
      expect(result.videoSettings?.fit).toBe(DEFAULT_CATEGORY_IMAGE_SETTINGS.fit);
    });

    it('does not add videoSettings when not present', () => {
      const category: Category = {
        name: 'Soups',
        displayOrder: 6,
      };

      const result = applyCategoryDefaults(category);

      expect(result.videoSettings).toBeUndefined();
    });

    it('processes items with applyItemDefaults', () => {
      const item: MenuItem = {
        name: 'Burger',
        displayOrder: 0,
        typography: { nameFontSize: 20 },
      };
      const category: Category = {
        name: 'Mains',
        displayOrder: 0,
        items: [item],
      };

      const result = applyCategoryDefaults(category);

      expect(result.items).toHaveLength(1);
      expect(result.items?.[0]?.name).toBe('Burger');
      expect(result.items?.[0]?.typography?.nameFontSize).toBe(20);
      expect(result.items?.[0]?.typography?.nameFontWeight).toBe(
        DEFAULT_ITEM_TYPOGRAPHY.nameFontWeight
      );
    });

    it('handles empty items array', () => {
      const category: Category = {
        name: 'Empty Category',
        displayOrder: 0,
        items: [],
      };

      const result = applyCategoryDefaults(category);

      expect(result.items).toEqual([]);
    });

    it('handles missing items (undefined)', () => {
      const category: Category = {
        name: 'No Items',
        displayOrder: 0,
      };

      const result = applyCategoryDefaults(category);

      expect(result.items).toEqual([]);
    });

    it('preserves category name and displayOrder', () => {
      const category: Category = {
        name: 'Special Menu',
        displayOrder: 99,
        description: 'A special menu',
      };

      const result = applyCategoryDefaults(category);

      expect(result.name).toBe('Special Menu');
      expect(result.displayOrder).toBe(99);
      expect(result.description).toBe('A special menu');
    });

    it('preserves category id and content IDs', () => {
      const category: Category = {
        name: 'With IDs',
        displayOrder: 0,
        id: 'cat_123',
        imageContentId: 'img_456',
        videoContentId: 'vid_789',
      };

      const result = applyCategoryDefaults(category);

      expect(result.id).toBe('cat_123');
      expect(result.imageContentId).toBe('img_456');
      expect(result.videoContentId).toBe('vid_789');
    });
  });

  describe('applyItemDefaults', () => {
    it('applies typography defaults to item', () => {
      const item: MenuItem = {
        name: 'Pizza',
        displayOrder: 0,
        typography: { nameFontSize: 22, descriptionMaxLines: 3 },
      };

      const result = applyItemDefaults(item);

      expect(result.typography?.nameFontSize).toBe(22);
      expect(result.typography?.descriptionMaxLines).toBe(3);
      expect(result.typography?.nameFontWeight).toBe(DEFAULT_ITEM_TYPOGRAPHY.nameFontWeight);
      expect(result.typography?.descriptionVisible).toBe(
        DEFAULT_ITEM_TYPOGRAPHY.descriptionVisible
      );
    });

    it('applies priceStyle defaults to item', () => {
      const item: MenuItem = {
        name: 'Pasta',
        displayOrder: 1,
        priceStyle: { fontSize: 20, position: PricePosition.BelowName },
      };

      const result = applyItemDefaults(item);

      expect(result.priceStyle?.fontSize).toBe(20);
      expect(result.priceStyle?.position).toBe('below-name');
      expect(result.priceStyle?.fontWeight).toBe(DEFAULT_PRICE_STYLE.fontWeight);
      expect(result.priceStyle?.showCurrency).toBe(DEFAULT_PRICE_STYLE.showCurrency);
    });

    it('applies layout defaults to item', () => {
      const item: MenuItem = {
        name: 'Steak',
        displayOrder: 2,
        layout: { variant: ItemLayoutVariant.Card, imagePosition: ItemImagePosition.Top },
      };

      const result = applyItemDefaults(item);

      expect(result.layout?.variant).toBe('card');
      expect(result.layout?.imagePosition).toBe('top');
      expect(result.layout?.contentAlignment).toBe(DEFAULT_ITEM_LAYOUT.contentAlignment);
    });

    it('applies styling defaults to item', () => {
      const item: MenuItem = {
        name: 'Salad',
        displayOrder: 3,
        styling: { padding: 12, shadowEnabled: true },
      };

      const result = applyItemDefaults(item);

      expect(result.styling?.padding).toBe(12);
      expect(result.styling?.shadowEnabled).toBe(true);
      expect(result.styling?.margin).toBe(DEFAULT_BOX_STYLING.margin);
      expect(result.styling?.borderRadius).toBe(DEFAULT_BOX_STYLING.borderRadius);
    });

    it('applies availabilityBadge defaults to item', () => {
      const item: MenuItem = {
        name: 'Special',
        displayOrder: 4,
        availabilityBadge: { show: false, unavailableText: 'Sold Out' },
      };

      const result = applyItemDefaults(item);

      expect(result.availabilityBadge?.show).toBe(false);
      expect(result.availabilityBadge?.unavailableText).toBe('Sold Out');
      expect(result.availabilityBadge?.position).toBe(DEFAULT_AVAILABILITY_BADGE.position);
      expect(result.availabilityBadge?.unavailableColor).toBe(
        DEFAULT_AVAILABILITY_BADGE.unavailableColor
      );
    });

    it('applies imageSettings only when present', () => {
      const item: MenuItem = {
        name: 'With Image',
        displayOrder: 5,
        imageSettings: { position: MediaPosition.Right, size: MediaSize.Small },
      };

      const result = applyItemDefaults(item);

      expect(result.imageSettings?.position).toBe('right');
      expect(result.imageSettings?.size).toBe('small');
      expect(result.imageSettings?.fit).toBe(DEFAULT_ITEM_IMAGE_SETTINGS.fit);
    });

    it('does not add imageSettings when not present', () => {
      const item: MenuItem = {
        name: 'No Image',
        displayOrder: 6,
      };

      const result = applyItemDefaults(item);

      expect(result.imageSettings).toBeUndefined();
    });

    it('applies videoSettings only when present', () => {
      const item: MenuItem = {
        name: 'With Video',
        displayOrder: 7,
        videoSettings: { position: MediaPosition.Top, size: MediaSize.Medium },
      };

      const result = applyItemDefaults(item);

      expect(result.videoSettings?.position).toBe('top');
      expect(result.videoSettings?.size).toBe('medium');
      expect(result.videoSettings?.fit).toBe(DEFAULT_ITEM_IMAGE_SETTINGS.fit);
    });

    it('does not add videoSettings when not present', () => {
      const item: MenuItem = {
        name: 'No Video',
        displayOrder: 8,
      };

      const result = applyItemDefaults(item);

      expect(result.videoSettings).toBeUndefined();
    });

    it('preserves item name, displayOrder, and other properties', () => {
      const item: MenuItem = {
        name: 'Detailed Item',
        displayOrder: 10,
        description: 'A delicious item',
        price: 12.99,
        isAvailable: true,
      };

      const result = applyItemDefaults(item);

      expect(result.name).toBe('Detailed Item');
      expect(result.displayOrder).toBe(10);
      expect(result.description).toBe('A delicious item');
      expect(result.price).toBe(12.99);
      expect(result.isAvailable).toBe(true);
    });

    it('preserves item id and content IDs', () => {
      const item: MenuItem = {
        name: 'With IDs',
        displayOrder: 0,
        id: 'item_123',
        imageContentId: 'img_abc',
        videoContentId: 'vid_def',
        documentContentIds: ['doc_1', 'doc_2'],
      };

      const result = applyItemDefaults(item);

      expect(result.id).toBe('item_123');
      expect(result.imageContentId).toBe('img_abc');
      expect(result.videoContentId).toBe('vid_def');
      expect(result.documentContentIds).toEqual(['doc_1', 'doc_2']);
    });

    it('preserves badges and tags arrays', () => {
      const item: MenuItem = {
        name: 'Tagged Item',
        displayOrder: 0,
        badges: [{ text: 'New', backgroundColor: '#FF0000', textColor: '#FFFFFF' }],
        tags: ['vegan', 'spicy'],
      };

      const result = applyItemDefaults(item);

      expect(result.badges).toEqual([
        { text: 'New', backgroundColor: '#FF0000', textColor: '#FFFFFF' },
      ]);
      expect(result.tags).toEqual(['vegan', 'spicy']);
    });
  });

  describe('normalizeMenuContents', () => {
    it('returns defaults for null contents', () => {
      const result = normalizeMenuContents(null);

      expect(result.schemaVersion).toBe(2);
      expect(result.typography).toEqual(DEFAULT_TYPOGRAPHY);
      expect(result.categories).toEqual([]);
    });

    it('returns defaults for undefined contents', () => {
      const result = normalizeMenuContents(undefined);

      expect(result.schemaVersion).toBe(2);
      expect(result.typography).toEqual(DEFAULT_TYPOGRAPHY);
    });

    it('handles legacy menu (schemaVersion 1)', () => {
      const legacyContents: MenuContents = {
        schemaVersion: 1,
        titleFont: 'OldFont',
        backgroundColor: '#FFFFFF',
        categories: [{ name: 'Old Category', displayOrder: 0 }],
      };

      const result = normalizeMenuContents(legacyContents);

      // Should upgrade to v2 and apply defaults
      expect(result.schemaVersion).toBe(2);
      expect(result.typography).toEqual(DEFAULT_TYPOGRAPHY);
      expect(result.colorScheme).toEqual(DEFAULT_COLOR_SCHEME);

      // Legacy fields preserved
      expect(result.titleFont).toBe('OldFont');
      expect(result.backgroundColor).toBe('#FFFFFF');

      // Categories processed
      expect(result.categories).toHaveLength(1);
      expect(result.categories?.[0]?.name).toBe('Old Category');
    });

    it('handles current menu (schemaVersion 2)', () => {
      const currentContents: MenuContents = {
        schemaVersion: 2,
        typography: { titleFont: 'Modern' },
        colorScheme: { accent: '#0000FF' },
      };

      const result = normalizeMenuContents(currentContents);

      expect(result.schemaVersion).toBe(2);
      expect(result.typography?.titleFont).toBe('Modern');
      expect(result.colorScheme?.accent).toBe('#0000FF');

      // Defaults applied for missing
      expect(result.typography?.titleFontSize).toBe(DEFAULT_TYPOGRAPHY.titleFontSize);
      expect(result.colorScheme?.background).toBe(DEFAULT_COLOR_SCHEME.background);
    });

    it('handles undefined schemaVersion as legacy', () => {
      const contents: MenuContents = {
        titleFont: 'Legacy',
      };

      const result = normalizeMenuContents(contents);

      // Treated as v1, upgraded to v2
      expect(result.schemaVersion).toBe(2);
      expect(result.titleFont).toBe('Legacy');
      expect(result.typography).toEqual(DEFAULT_TYPOGRAPHY);
    });

    it('handles future schemaVersion gracefully', () => {
      const futureContents: MenuContents = {
        schemaVersion: 99,
        typography: { titleFont: 'FutureFont' },
      };

      const result = normalizeMenuContents(futureContents);

      // Should apply current defaults for forward compatibility
      expect(result.schemaVersion).toBe(99);
      expect(result.typography?.titleFont).toBe('FutureFont');
      expect(result.typography?.titleFontSize).toBe(DEFAULT_TYPOGRAPHY.titleFontSize);
    });

    it('handles schemaVersion 0 (edge case)', () => {
      const contents: MenuContents = {
        schemaVersion: 0,
      };

      const result = normalizeMenuContents(contents);

      // SchemaVersion 0 is preserved (treated as unknown, but value is kept)
      // Defaults are applied for missing fields
      expect(result.schemaVersion).toBe(0);
      expect(result.typography).toEqual(DEFAULT_TYPOGRAPHY);
    });

    it('processes nested categories and items correctly', () => {
      const contents: MenuContents = {
        schemaVersion: 1,
        categories: [
          {
            name: 'Category 1',
            displayOrder: 0,
            items: [
              { name: 'Item 1', displayOrder: 0 },
              { name: 'Item 2', displayOrder: 1 },
            ],
          },
          {
            name: 'Category 2',
            displayOrder: 1,
          },
        ],
      };

      const result = normalizeMenuContents(contents);

      expect(result.categories).toHaveLength(2);
      expect(result.categories?.[0]?.items).toHaveLength(2);
      expect(result.categories?.[0]?.typography).toEqual(DEFAULT_CATEGORY_TYPOGRAPHY);
      expect(result.categories?.[0]?.items?.[0]?.typography).toEqual(DEFAULT_ITEM_TYPOGRAPHY);
      expect(result.categories?.[1]?.items).toEqual([]);
    });
  });

  describe('default constants', () => {
    it('DEFAULT_TYPOGRAPHY has all required fields', () => {
      expect(DEFAULT_TYPOGRAPHY.titleFont).toBeDefined();
      expect(DEFAULT_TYPOGRAPHY.titleFontSize).toBeGreaterThan(0);
      expect(DEFAULT_TYPOGRAPHY.titleFontWeight).toBeDefined();
      expect(DEFAULT_TYPOGRAPHY.bodyFont).toBeDefined();
      expect(DEFAULT_TYPOGRAPHY.bodyFontSize).toBeGreaterThan(0);
      expect(DEFAULT_TYPOGRAPHY.bodyFontWeight).toBeDefined();
      expect(DEFAULT_TYPOGRAPHY.priceFont).toBeDefined();
      expect(DEFAULT_TYPOGRAPHY.priceFontSize).toBeGreaterThan(0);
      expect(DEFAULT_TYPOGRAPHY.priceFontWeight).toBeDefined();
    });

    it('DEFAULT_COLOR_SCHEME has all required fields', () => {
      expect(DEFAULT_COLOR_SCHEME.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(DEFAULT_COLOR_SCHEME.surface).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(DEFAULT_COLOR_SCHEME.text).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(DEFAULT_COLOR_SCHEME.textSecondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(DEFAULT_COLOR_SCHEME.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(DEFAULT_COLOR_SCHEME.price).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(DEFAULT_COLOR_SCHEME.border).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(DEFAULT_COLOR_SCHEME.divider).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(DEFAULT_COLOR_SCHEME.unavailable).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('DEFAULT_LAYOUT has all required fields', () => {
      expect(DEFAULT_LAYOUT.template).toBeDefined();
      expect(DEFAULT_LAYOUT.categoryLayout).toBeDefined();
      expect(DEFAULT_LAYOUT.itemLayout).toBeDefined();
      expect(DEFAULT_LAYOUT.itemsPerRow).toBeGreaterThan(0);
      expect(typeof DEFAULT_LAYOUT.showCategoryDividers).toBe('boolean');
      expect(typeof DEFAULT_LAYOUT.showItemDividers).toBe('boolean');
    });

    it('DEFAULT_HEADER has all required fields', () => {
      expect(typeof DEFAULT_HEADER.showLogo).toBe('boolean');
      expect(DEFAULT_HEADER.logoPosition).toBeDefined();
      expect(DEFAULT_HEADER.logoSize).toBeDefined();
      expect(DEFAULT_HEADER.bannerHeight).toBeGreaterThan(0);
      expect(typeof DEFAULT_HEADER.showMenuName).toBe('boolean');
      expect(typeof DEFAULT_HEADER.showMenuDescription).toBe('boolean');
      expect(DEFAULT_HEADER.titlePosition).toBeDefined();
    });

    it('DEFAULT_SPACING has all required fields with positive values', () => {
      expect(DEFAULT_SPACING.pagePadding).toBeGreaterThan(0);
      expect(DEFAULT_SPACING.categorySpacing).toBeGreaterThan(0);
      expect(DEFAULT_SPACING.itemSpacing).toBeGreaterThan(0);
      expect(DEFAULT_SPACING.contentPadding).toBeGreaterThan(0);
    });

    it('DEFAULT_CATEGORY_IMAGE_SETTINGS has proper structure', () => {
      expect(DEFAULT_CATEGORY_IMAGE_SETTINGS.position).toBeDefined();
      expect(DEFAULT_CATEGORY_IMAGE_SETTINGS.size).toBeDefined();
      expect(DEFAULT_CATEGORY_IMAGE_SETTINGS.fit).toBeDefined();
      expect(DEFAULT_CATEGORY_IMAGE_SETTINGS.borderRadius).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_CATEGORY_IMAGE_SETTINGS.opacity).toBe(1);
      expect(DEFAULT_CATEGORY_IMAGE_SETTINGS.overlay).toBeUndefined();
    });

    it('DEFAULT_ITEM_IMAGE_SETTINGS has proper structure', () => {
      expect(DEFAULT_ITEM_IMAGE_SETTINGS.position).toBeDefined();
      expect(DEFAULT_ITEM_IMAGE_SETTINGS.size).toBeDefined();
      expect(DEFAULT_ITEM_IMAGE_SETTINGS.fit).toBeDefined();
      expect(DEFAULT_ITEM_IMAGE_SETTINGS.borderRadius).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_ITEM_IMAGE_SETTINGS.opacity).toBe(1);
      expect(DEFAULT_ITEM_IMAGE_SETTINGS.overlay).toBeUndefined();
    });

    it('DEFAULT_AVAILABILITY_BADGE has proper structure', () => {
      expect(typeof DEFAULT_AVAILABILITY_BADGE.show).toBe('boolean');
      expect(DEFAULT_AVAILABILITY_BADGE.position).toBeDefined();
      expect(DEFAULT_AVAILABILITY_BADGE.unavailableText).toBeDefined();
      expect(DEFAULT_AVAILABILITY_BADGE.unavailableColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(DEFAULT_AVAILABILITY_BADGE.unavailableBackgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('edge cases', () => {
    it('handles deeply nested null/undefined values', () => {
      const contents: MenuContents = {
        typography: undefined,
        colorScheme: undefined,
        layout: undefined,
        header: undefined,
        spacing: undefined,
        categories: undefined,
      };

      const result = applyMenuDefaults(contents);

      expect(result.typography).toEqual(DEFAULT_TYPOGRAPHY);
      expect(result.colorScheme).toEqual(DEFAULT_COLOR_SCHEME);
      expect(result.layout).toEqual(DEFAULT_LAYOUT);
      expect(result.header).toEqual(DEFAULT_HEADER);
      expect(result.spacing).toEqual(DEFAULT_SPACING);
      expect(result.categories).toEqual([]);
    });

    it('does not mutate input contents', () => {
      const original: MenuContents = {
        typography: { titleFont: 'Original' },
        categories: [{ name: 'Original Category', displayOrder: 0 }],
      };
      const originalCopy = JSON.parse(JSON.stringify(original));

      applyMenuDefaults(original);

      expect(original).toEqual(originalCopy);
    });

    it('does not mutate input category', () => {
      const original: Category = {
        name: 'Original',
        displayOrder: 0,
        typography: { titleFontSize: 20 },
      };
      const originalCopy = JSON.parse(JSON.stringify(original));

      applyCategoryDefaults(original);

      expect(original).toEqual(originalCopy);
    });

    it('does not mutate input item', () => {
      const original: MenuItem = {
        name: 'Original',
        displayOrder: 0,
        typography: { nameFontSize: 18 },
      };
      const originalCopy = JSON.parse(JSON.stringify(original));

      applyItemDefaults(original);

      expect(original).toEqual(originalCopy);
    });

    it('handles category with null imageContentId', () => {
      const category: Category = {
        name: 'With null ID',
        displayOrder: 0,
        imageContentId: null,
      };

      const result = applyCategoryDefaults(category);

      expect(result.imageContentId).toBeNull();
      expect(result.imageSettings).toBeUndefined();
    });

    it('handles item with null content IDs', () => {
      const item: MenuItem = {
        name: 'With null IDs',
        displayOrder: 0,
        imageContentId: null,
        videoContentId: null,
      };

      const result = applyItemDefaults(item);

      expect(result.imageContentId).toBeNull();
      expect(result.videoContentId).toBeNull();
    });

    it('preserves overlay settings in imageSettings when provided', () => {
      const overlay: OverlaySettings = {
        enabled: true,
        color: '#000000',
        opacity: 0.5,
      };
      const imageSettings: MediaSettings = {
        position: MediaPosition.Background,
        overlay,
      };
      const category: Category = {
        name: 'With Overlay',
        displayOrder: 0,
        imageSettings,
      };

      const result = applyCategoryDefaults(category);

      expect(result.imageSettings?.overlay).toEqual(overlay);
      expect(result.imageSettings?.position).toBe('background');
      expect(result.imageSettings?.fit).toBe(DEFAULT_CATEGORY_IMAGE_SETTINGS.fit);
    });
  });
});
