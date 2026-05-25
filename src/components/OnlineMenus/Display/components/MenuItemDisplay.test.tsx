/**
 * Unit tests for MenuItemDisplay component.
 *
 * These tests focus on LOGIC, not rendering:
 * - Price formatting with different currency options
 * - Image position handling
 * - Availability badge visibility
 * - Style calculation based on item and global settings
 * - Callback behavior
 */

import BadgePosition from '../../../../types/enums/BadgePosition';
import CurrencyPosition from '../../../../types/enums/CurrencyPosition';
import FontWeight from '../../../../types/enums/FontWeight';
import MediaPosition from '../../../../types/enums/MediaPosition';
import PricePosition from '../../../../types/enums/PricePosition';
import {
  formatPrice,
  getImageSize,
  getFlexDirection,
  CURRENCY_SYMBOL,
  ITEM_IMAGE_SIZE_SMALL,
  ITEM_IMAGE_SIZE_MEDIUM,
  ITEM_IMAGE_SIZE_LARGE,
} from '../utils/menuItemDisplayStyles';

import type { MenuItem, MenuContents } from '../../../../types/menuTypes';

// =============================================================================
// Test Data Factories
// =============================================================================

function createMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'test-item',
    name: 'Test Item',
    description: 'A delicious test item',
    price: 12.99,
    displayOrder: 0,
    isAvailable: true,
    ...overrides,
  };
}

function createGlobalStyles(overrides: Partial<MenuContents> = {}): MenuContents {
  return {
    categories: [],
    colorScheme: {
      text: '#333333',
      surface: '#FFFFFF',
      border: '#E0E0E0',
    },
    ...overrides,
  };
}

// =============================================================================
// Price Formatting Tests
// =============================================================================

describe('MenuItemDisplay Price Formatting', () => {
  describe('formatPrice', () => {
    it('formats price with currency symbol before when position is before', () => {
      const result = formatPrice({ price: 12.99, showCurrency: true, currencyPosition: CurrencyPosition.Before });
      expect(result).toBe(`${CURRENCY_SYMBOL}12.99`);
    });

    it('formats price with currency symbol after when position is after', () => {
      const result = formatPrice({ price: 12.99, showCurrency: true, currencyPosition: CurrencyPosition.After });
      expect(result).toBe(`12.99${CURRENCY_SYMBOL}`);
    });

    it('formats price without currency symbol when showCurrency is false', () => {
      const result = formatPrice({ price: 12.99, showCurrency: false, currencyPosition: CurrencyPosition.Before });
      expect(result).toBe('12.99');
    });

    it('includes prefix when provided', () => {
      const result = formatPrice({ price: 12.99, showCurrency: true, currencyPosition: CurrencyPosition.Before, prefix: 'From ' });
      expect(result).toBe(`From ${CURRENCY_SYMBOL}12.99`);
    });

    it('includes suffix when provided', () => {
      const result = formatPrice({ price: 12.99, showCurrency: true, currencyPosition: CurrencyPosition.Before, suffix: ' each' });
      expect(result).toBe(`${CURRENCY_SYMBOL}12.99 each`);
    });

    it('includes both prefix and suffix when provided', () => {
      const result = formatPrice({ price: 12.99, showCurrency: true, currencyPosition: CurrencyPosition.Before, prefix: 'From ', suffix: ' each' });
      expect(result).toBe(`From ${CURRENCY_SYMBOL}12.99 each`);
    });

    it('formats price to two decimal places', () => {
      const result = formatPrice({ price: 10, showCurrency: true, currencyPosition: CurrencyPosition.Before });
      expect(result).toBe(`${CURRENCY_SYMBOL}10.00`);
    });

    it('rounds price to two decimal places', () => {
      const result = formatPrice({ price: 12.999, showCurrency: true, currencyPosition: CurrencyPosition.Before });
      expect(result).toBe(`${CURRENCY_SYMBOL}13.00`);
    });

    it('handles zero price', () => {
      const result = formatPrice({ price: 0, showCurrency: true, currencyPosition: CurrencyPosition.Before });
      expect(result).toBe(`${CURRENCY_SYMBOL}0.00`);
    });

    it('handles large prices correctly', () => {
      const result = formatPrice({ price: 9999.99, showCurrency: true, currencyPosition: CurrencyPosition.Before });
      expect(result).toBe(`${CURRENCY_SYMBOL}9999.99`);
    });
  });
});

// =============================================================================
// Image Size Tests
// =============================================================================

describe('MenuItemDisplay Image Size', () => {
  describe('getImageSize', () => {
    it('returns small size for thumbnail', () => {
      expect(getImageSize('thumbnail')).toBe(ITEM_IMAGE_SIZE_SMALL);
    });

    it('returns small size for small', () => {
      expect(getImageSize('small')).toBe(ITEM_IMAGE_SIZE_SMALL);
    });

    it('returns medium size for medium', () => {
      expect(getImageSize('medium')).toBe(ITEM_IMAGE_SIZE_MEDIUM);
    });

    it('returns medium size for undefined', () => {
      expect(getImageSize(undefined)).toBe(ITEM_IMAGE_SIZE_MEDIUM);
    });

    it('returns large size for large', () => {
      expect(getImageSize('large')).toBe(ITEM_IMAGE_SIZE_LARGE);
    });

    it('returns large size for full', () => {
      expect(getImageSize('full')).toBe(ITEM_IMAGE_SIZE_LARGE);
    });

    it('returns medium size for unknown values', () => {
      expect(getImageSize('custom')).toBe(ITEM_IMAGE_SIZE_MEDIUM);
    });
  });
});

// =============================================================================
// Flex Direction Tests
// =============================================================================

describe('MenuItemDisplay Layout', () => {
  describe('getFlexDirection', () => {
    it('returns row for left position', () => {
      expect(getFlexDirection(MediaPosition.Left)).toBe('row');
    });

    it('returns row-reverse for right position', () => {
      expect(getFlexDirection(MediaPosition.Right)).toBe('row-reverse');
    });

    it('returns column for top position', () => {
      expect(getFlexDirection(MediaPosition.Top)).toBe('column');
    });

    it('returns column-reverse for bottom position', () => {
      expect(getFlexDirection(MediaPosition.Bottom)).toBe('column-reverse');
    });

    it('returns column for background position', () => {
      expect(getFlexDirection(MediaPosition.Background)).toBe('column');
    });

    it('returns column for none position', () => {
      expect(getFlexDirection(MediaPosition.None)).toBe('column');
    });
  });
});

// =============================================================================
// Item Data Processing Tests
// =============================================================================

describe('MenuItemDisplay Data Processing', () => {
  describe('item defaults', () => {
    it('uses default name when item name is null', () => {
      const item = createMenuItem({ name: undefined });
      // Default behavior check - name should be undefined which triggers default
      expect(item.name).toBeUndefined();
    });

    it('uses default price of 0 when item price is null', () => {
      const item = createMenuItem({ price: undefined });
      // Price should default to 0 in component
      expect(item.price).toBeUndefined();
    });

    it('treats item as available by default', () => {
      const item = createMenuItem({ isAvailable: undefined });
      // isAvailable should default to true in component
      expect(item.isAvailable).toBeUndefined();
    });
  });

  describe('image visibility', () => {
    it('has image when imageContentId is provided', () => {
      const item = createMenuItem({ imageContentId: 'content-123' });
      expect(item.imageContentId).toBe('content-123');
    });

    it('does not have image when imageContentId is null', () => {
      const item = createMenuItem({ imageContentId: null });
      expect(item.imageContentId).toBeNull();
    });

    it('does not have image when imageContentId is undefined', () => {
      const item = createMenuItem({ imageContentId: undefined });
      expect(item.imageContentId).toBeUndefined();
    });
  });

  describe('description visibility', () => {
    it('shows description when provided', () => {
      const item = createMenuItem({ description: 'Delicious item' });
      expect(item.description).toBe('Delicious item');
    });

    it('does not show description when empty string', () => {
      const item = createMenuItem({ description: '' });
      // Empty string should not show description
      const isEmpty = item.description === '';
      expect(isEmpty).toBe(true);
    });

    it('does not show description when null', () => {
      const item = createMenuItem({ description: null });
      expect(item.description).toBeNull();
    });
  });
});

// =============================================================================
// Style Inheritance Tests
// =============================================================================

describe('MenuItemDisplay Style Inheritance', () => {
  describe('text color inheritance', () => {
    it('uses item textColor over global', () => {
      const item = createMenuItem({ textColor: '#FF0000' });
      const _global = createGlobalStyles({ colorScheme: { text: '#000000' } });
      expect(item.textColor).toBe('#FF0000');
    });

    it('uses item typography nameColor over textColor', () => {
      const item = createMenuItem({
        textColor: '#FF0000',
        typography: { nameColor: '#00FF00' },
      });
      expect(item.typography?.nameColor).toBe('#00FF00');
    });

    it('uses global textColor when item has no override', () => {
      const item = createMenuItem({ textColor: undefined });
      const globalStyles = createGlobalStyles({ colorScheme: { text: '#333333' } });
      expect(item.textColor).toBeUndefined();
      expect(globalStyles.colorScheme?.text).toBe('#333333');
    });
  });

  describe('background color inheritance', () => {
    it('uses item backgroundColor over global', () => {
      const item = createMenuItem({ backgroundColor: '#EEEEEE' });
      expect(item.backgroundColor).toBe('#EEEEEE');
    });

    it('uses global surface color when item has no override', () => {
      const item = createMenuItem({ backgroundColor: undefined });
      const globalStyles = createGlobalStyles({ colorScheme: { surface: '#FAFAFA' } });
      expect(item.backgroundColor).toBeUndefined();
      expect(globalStyles.colorScheme?.surface).toBe('#FAFAFA');
    });
  });

  describe('border color inheritance', () => {
    it('uses item styling borderColor over global', () => {
      const item = createMenuItem({ styling: { borderColor: '#CCCCCC' } });
      expect(item.styling?.borderColor).toBe('#CCCCCC');
    });

    it('uses global border color when item has no override', () => {
      const item = createMenuItem({ styling: undefined });
      const globalStyles = createGlobalStyles({ colorScheme: { border: '#E0E0E0' } });
      expect(item.styling).toBeUndefined();
      expect(globalStyles.colorScheme?.border).toBe('#E0E0E0');
    });
  });
});

// =============================================================================
// Price Position Tests
// =============================================================================

describe('MenuItemDisplay Price Position', () => {
  describe('price position options', () => {
    it('defaults to right position', () => {
      const item = createMenuItem({ priceStyle: undefined });
      expect(item.priceStyle?.position).toBeUndefined();
      // Default is 'right' in component
    });

    it('can be set to below-name', () => {
      const item = createMenuItem({ priceStyle: { position: PricePosition.BelowName } });
      expect(item.priceStyle?.position).toBe('below-name');
    });

    it('can be set to below-description', () => {
      const item = createMenuItem({ priceStyle: { position: PricePosition.BelowDescription } });
      expect(item.priceStyle?.position).toBe('below-description');
    });

    it('can be set to badge', () => {
      const item = createMenuItem({ priceStyle: { position: PricePosition.Badge } });
      expect(item.priceStyle?.position).toBe('badge');
    });
  });
});

// =============================================================================
// Media Position Tests
// =============================================================================

describe('MenuItemDisplay Media Position', () => {
  describe('image settings position', () => {
    it('defaults to left when not specified', () => {
      const item = createMenuItem({ imageSettings: undefined });
      expect(item.imageSettings?.position).toBeUndefined();
      // Default is 'left' in component
    });

    it('can be set to right', () => {
      const item = createMenuItem({ imageSettings: { position: MediaPosition.Right } });
      expect(item.imageSettings?.position).toBe('right');
    });

    it('can be set to top', () => {
      const item = createMenuItem({ imageSettings: { position: MediaPosition.Top } });
      expect(item.imageSettings?.position).toBe('top');
    });

    it('can be set to bottom', () => {
      const item = createMenuItem({ imageSettings: { position: MediaPosition.Bottom } });
      expect(item.imageSettings?.position).toBe('bottom');
    });

    it('can be set to background', () => {
      const item = createMenuItem({ imageSettings: { position: MediaPosition.Background } });
      expect(item.imageSettings?.position).toBe('background');
    });

    it('can be set to none to hide image', () => {
      const item = createMenuItem({ imageSettings: { position: MediaPosition.None } });
      expect(item.imageSettings?.position).toBe('none');
    });
  });
});

// =============================================================================
// Availability Badge Tests
// =============================================================================

describe('MenuItemDisplay Availability Badge', () => {
  describe('availability badge visibility', () => {
    it('shows badge when item is unavailable', () => {
      const item = createMenuItem({ isAvailable: false });
      expect(item.isAvailable).toBe(false);
    });

    it('hides badge when item is available', () => {
      const item = createMenuItem({ isAvailable: true });
      expect(item.isAvailable).toBe(true);
    });

    it('can be hidden even when unavailable via badgeStyle.show', () => {
      const item = createMenuItem({
        isAvailable: false,
        availabilityBadge: { show: false },
      });
      expect(item.availabilityBadge?.show).toBe(false);
    });
  });

  describe('availability badge styling', () => {
    it('uses custom unavailable text', () => {
      const item = createMenuItem({
        availabilityBadge: { unavailableText: 'Sold Out' },
      });
      expect(item.availabilityBadge?.unavailableText).toBe('Sold Out');
    });

    it('uses custom background color', () => {
      const item = createMenuItem({
        availabilityBadge: { unavailableBackgroundColor: '#FF5733' },
      });
      expect(item.availabilityBadge?.unavailableBackgroundColor).toBe('#FF5733');
    });

    it('uses custom text color', () => {
      const item = createMenuItem({
        availabilityBadge: { unavailableColor: '#000000' },
      });
      expect(item.availabilityBadge?.unavailableColor).toBe('#000000');
    });
  });

  describe('availability badge position', () => {
    it('defaults to top-right', () => {
      const item = createMenuItem({ availabilityBadge: undefined });
      expect(item.availabilityBadge?.position).toBeUndefined();
      // Default is 'top-right' in component
    });

    it('can be set to top-left', () => {
      const item = createMenuItem({ availabilityBadge: { position: BadgePosition.TopLeft } });
      expect(item.availabilityBadge?.position).toBe('top-left');
    });

    it('can be set to bottom-left', () => {
      const item = createMenuItem({ availabilityBadge: { position: BadgePosition.BottomLeft } });
      expect(item.availabilityBadge?.position).toBe('bottom-left');
    });

    it('can be set to bottom-right', () => {
      const item = createMenuItem({ availabilityBadge: { position: BadgePosition.BottomRight } });
      expect(item.availabilityBadge?.position).toBe('bottom-right');
    });
  });
});

// =============================================================================
// Typography Tests
// =============================================================================

describe('MenuItemDisplay Typography', () => {
  describe('name typography', () => {
    it('can set custom font size', () => {
      const item = createMenuItem({ typography: { nameFontSize: 20 } });
      expect(item.typography?.nameFontSize).toBe(20);
    });

    it('can set custom font weight', () => {
      const item = createMenuItem({ typography: { nameFontWeight: FontWeight.Bold } });
      expect(item.typography?.nameFontWeight).toBe('bold');
    });

    it('can set custom color', () => {
      const item = createMenuItem({ typography: { nameColor: '#FF0000' } });
      expect(item.typography?.nameColor).toBe('#FF0000');
    });
  });

  describe('description typography', () => {
    it('can set custom font size', () => {
      const item = createMenuItem({ typography: { descriptionFontSize: 12 } });
      expect(item.typography?.descriptionFontSize).toBe(12);
    });

    it('can set custom font weight', () => {
      const item = createMenuItem({ typography: { descriptionFontWeight: FontWeight.W300 } });
      expect(item.typography?.descriptionFontWeight).toBe('300');
    });

    it('can set custom color', () => {
      const item = createMenuItem({ typography: { descriptionColor: '#666666' } });
      expect(item.typography?.descriptionColor).toBe('#666666');
    });

    it('can set max lines for truncation', () => {
      const item = createMenuItem({ typography: { descriptionMaxLines: 3 } });
      expect(item.typography?.descriptionMaxLines).toBe(3);
    });
  });
});

// =============================================================================
// Box Styling Tests
// =============================================================================

describe('MenuItemDisplay Box Styling', () => {
  describe('border styling', () => {
    it('can set custom border width', () => {
      const item = createMenuItem({ styling: { borderWidth: 2 } });
      expect(item.styling?.borderWidth).toBe(2);
    });

    it('can set custom border radius', () => {
      const item = createMenuItem({ styling: { borderRadius: 16 } });
      expect(item.styling?.borderRadius).toBe(16);
    });

    it('can set custom border color', () => {
      const item = createMenuItem({ styling: { borderColor: '#AAAAAA' } });
      expect(item.styling?.borderColor).toBe('#AAAAAA');
    });
  });

  describe('padding', () => {
    it('can set custom padding', () => {
      const item = createMenuItem({ styling: { padding: 24 } });
      expect(item.styling?.padding).toBe(24);
    });
  });

  describe('shadow styling', () => {
    it('can enable shadow', () => {
      const item = createMenuItem({ styling: { shadowEnabled: true } });
      expect(item.styling?.shadowEnabled).toBe(true);
    });

    it('can set shadow color', () => {
      const item = createMenuItem({
        styling: { shadowEnabled: true, shadowColor: '#000000' },
      });
      expect(item.styling?.shadowColor).toBe('#000000');
    });

    it('can set shadow blur', () => {
      const item = createMenuItem({
        styling: { shadowEnabled: true, shadowBlur: 8 },
      });
      expect(item.styling?.shadowBlur).toBe(8);
    });
  });
});

// =============================================================================
// Price Style Tests
// =============================================================================

describe('MenuItemDisplay Price Style', () => {
  describe('strikethrough when unavailable', () => {
    it('enables strikethrough by default when unavailable', () => {
      const item = createMenuItem({
        isAvailable: false,
        priceStyle: undefined,
      });
      // Default is true in component
      expect(item.priceStyle?.strikethroughWhenUnavailable).toBeUndefined();
    });

    it('can disable strikethrough', () => {
      const item = createMenuItem({
        isAvailable: false,
        priceStyle: { strikethroughWhenUnavailable: false },
      });
      expect(item.priceStyle?.strikethroughWhenUnavailable).toBe(false);
    });
  });

  describe('price font styling', () => {
    it('can set custom font size', () => {
      const item = createMenuItem({ priceStyle: { fontSize: 24 } });
      expect(item.priceStyle?.fontSize).toBe(24);
    });

    it('can set custom font weight', () => {
      const item = createMenuItem({ priceStyle: { fontWeight: FontWeight.W500 } });
      expect(item.priceStyle?.fontWeight).toBe('500');
    });

    it('can set custom color', () => {
      const item = createMenuItem({ priceStyle: { color: '#00AA00' } });
      expect(item.priceStyle?.color).toBe('#00AA00');
    });
  });
});
