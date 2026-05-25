/**
 * Unit tests for menuStyleGenerator utility.
 *
 * Tests focus on logic:
 * - Correct style generation from settings
 * - Default value handling for undefined properties
 * - Color scheme integration
 * - Edge cases (null/undefined inputs, partial objects)
 */

import {
  DEFAULT_COLOR_SCHEME,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_BOX_STYLING,
  DEFAULT_CATEGORY_TYPOGRAPHY,
  DEFAULT_CATEGORY_IMAGE_SETTINGS,
  DEFAULT_ITEM_TYPOGRAPHY,
  DEFAULT_ITEM_IMAGE_SETTINGS,
  DEFAULT_PRICE_STYLE,
} from './menuDefaults';
import {
  generateCategoryStyles,
  generateItemStyles,
  generateTypographyStyles,
  generateBoxStyles,
  generateMediaStyles,
  generateCategoryTypographyStyles,
  generateItemTypographyStyles,
  generatePriceStyles,
} from './menuStyleGenerator';
import ContentAlignment from '../types/enums/ContentAlignment';
import FontWeight from '../types/enums/FontWeight';
import MediaFit from '../types/enums/MediaFit';
import MediaSize from '../types/enums/MediaSize';

import type {
  GlobalTypography,
  BoxStyling,
  MediaSettings,
  ColorScheme,
  CategoryTypography,
  CategoryLayout,
  ItemTypography,
  ItemLayout,
  PriceStyle,
} from '../types/menuStyleTypes';
import type { Category, MenuItem } from '../types/menuTypes';


describe('menuStyleGenerator', () => {
  describe('generateCategoryStyles', () => {
    it('returns default styles when category is undefined', () => {
      const result = generateCategoryStyles(undefined);

      expect(result.container.padding).toBe(DEFAULT_BOX_STYLING.padding);
      expect(result.container.margin).toBe(DEFAULT_BOX_STYLING.margin);
      expect(result.container.borderRadius).toBe(DEFAULT_BOX_STYLING.borderRadius);
      expect(result.title.fontSize).toBe(DEFAULT_CATEGORY_TYPOGRAPHY.titleFontSize);
      expect(result.title.fontWeight).toBe(DEFAULT_CATEGORY_TYPOGRAPHY.titleFontWeight);
      expect(result.description.fontSize).toBe(DEFAULT_CATEGORY_TYPOGRAPHY.descriptionFontSize);
    });

    it('applies category typography settings', () => {
      const category: Category = {
        name: 'Appetizers',
        displayOrder: 0,
        typography: {
          titleFontSize: 28,
          titleFontWeight: FontWeight.W700,
          titleColor: '#FF0000',
          descriptionFontSize: 16,
          descriptionColor: '#00FF00',
        },
      };

      const result = generateCategoryStyles(category);

      expect(result.title.fontSize).toBe(28);
      expect(result.title.fontWeight).toBe('700');
      expect(result.title.color).toBe('#FF0000');
      expect(result.description.fontSize).toBe(16);
      expect(result.description.color).toBe('#00FF00');
    });

    it('applies category layout alignment', () => {
      const category: Category = {
        name: 'Center Aligned',
        displayOrder: 0,
        layout: { contentAlignment: ContentAlignment.Center },
      };

      const result = generateCategoryStyles(category);

      expect(result.title.textAlign).toBe('center');
      expect(result.description.textAlign).toBe('center');
    });

    it('applies category styling (box model)', () => {
      const category: Category = {
        name: 'Styled Category',
        displayOrder: 0,
        styling: {
          padding: 24,
          margin: 8,
          borderWidth: 2,
          borderColor: '#333333',
          borderRadius: 16,
        },
      };

      const result = generateCategoryStyles(category);

      expect(result.container.padding).toBe(24);
      expect(result.container.margin).toBe(8);
      expect(result.container.borderWidth).toBe(2);
      expect(result.container.borderColor).toBe('#333333');
      expect(result.container.borderRadius).toBe(16);
    });

    it('applies shadow styles when enabled', () => {
      const category: Category = {
        name: 'With Shadow',
        displayOrder: 0,
        styling: {
          shadowEnabled: true,
          shadowColor: '#000000',
          shadowBlur: 8,
        },
      };

      const result = generateCategoryStyles(category);

      expect(result.container.shadowColor).toBe('#000000');
      expect(result.container.shadowRadius).toBe(8);
      expect(result.container.elevation).toBe(4);
    });

    it('does not apply shadow styles when disabled', () => {
      const category: Category = {
        name: 'No Shadow',
        displayOrder: 0,
        styling: {
          shadowEnabled: false,
          shadowColor: '#000000',
        },
      };

      const result = generateCategoryStyles(category);

      expect(result.container.shadowColor).toBeUndefined();
      expect(result.container.elevation).toBeUndefined();
    });

    it('uses colorScheme for default colors', () => {
      const category: Category = {
        name: 'With Color Scheme',
        displayOrder: 0,
      };
      const colorScheme: ColorScheme = {
        text: '#111111',
        textSecondary: '#666666',
        border: '#CCCCCC',
      };

      const result = generateCategoryStyles(category, colorScheme);

      expect(result.title.color).toBe('#111111');
      expect(result.description.color).toBe('#666666');
      expect(result.container.borderColor).toBe('#CCCCCC');
    });

    it('category typography overrides colorScheme', () => {
      const category: Category = {
        name: 'Override Colors',
        displayOrder: 0,
        typography: {
          titleColor: '#FF0000',
          descriptionColor: '#00FF00',
        },
      };
      const colorScheme: ColorScheme = {
        text: '#111111',
        textSecondary: '#666666',
      };

      const result = generateCategoryStyles(category, colorScheme);

      expect(result.title.color).toBe('#FF0000');
      expect(result.description.color).toBe('#00FF00');
    });

    it('generates image styles from imageSettings', () => {
      const category: Category = {
        name: 'With Image',
        displayOrder: 0,
        imageSettings: {
          size: MediaSize.Large,
          borderRadius: 12,
          opacity: 0.9,
          fit: MediaFit.Contain,
        },
      };

      const result = generateCategoryStyles(category);

      expect(result.image.width).toBe(200);
      expect(result.image.height).toBe(200);
      expect(result.image.borderRadius).toBe(12);
      expect(result.image.opacity).toBe(0.9);
      expect(result.image.resizeMode).toBe('contain');
    });

    it('uses default image settings when imageSettings not provided', () => {
      const category: Category = {
        name: 'No Image Settings',
        displayOrder: 0,
      };

      const result = generateCategoryStyles(category);

      expect(result.image.borderRadius).toBe(DEFAULT_CATEGORY_IMAGE_SETTINGS.borderRadius);
      expect(result.image.opacity).toBe(DEFAULT_CATEGORY_IMAGE_SETTINGS.opacity);
    });
  });

  describe('generateItemStyles', () => {
    it('returns default styles when item is undefined', () => {
      const result = generateItemStyles(undefined);

      expect(result.container.padding).toBe(DEFAULT_BOX_STYLING.padding);
      expect(result.name.fontSize).toBe(DEFAULT_ITEM_TYPOGRAPHY.nameFontSize);
      expect(result.name.fontWeight).toBe(DEFAULT_ITEM_TYPOGRAPHY.nameFontWeight);
      expect(result.description.fontSize).toBe(DEFAULT_ITEM_TYPOGRAPHY.descriptionFontSize);
      expect(result.price.fontSize).toBe(DEFAULT_PRICE_STYLE.fontSize);
    });

    it('applies item typography settings', () => {
      const item: MenuItem = {
        name: 'Burger',
        displayOrder: 0,
        typography: {
          nameFontSize: 20,
          nameFontWeight: FontWeight.Bold,
          nameColor: '#AA0000',
          descriptionFontSize: 14,
          descriptionColor: '#777777',
        },
      };

      const result = generateItemStyles(item);

      expect(result.name.fontSize).toBe(20);
      expect(result.name.fontWeight).toBe('bold');
      expect(result.name.color).toBe('#AA0000');
      expect(result.description.fontSize).toBe(14);
      expect(result.description.color).toBe('#777777');
    });

    it('applies item layout settings', () => {
      const item: MenuItem = {
        name: 'Pizza',
        displayOrder: 0,
        layout: {
          contentAlignment: ContentAlignment.Right,
          minHeight: 80,
          maxWidth: 300,
        },
      };

      const result = generateItemStyles(item);

      expect(result.name.textAlign).toBe('right');
      expect(result.container.minHeight).toBe(80);
      expect(result.container.maxWidth).toBe(300);
    });

    it('applies price styling', () => {
      const item: MenuItem = {
        name: 'Steak',
        displayOrder: 0,
        priceStyle: {
          fontSize: 22,
          fontWeight: FontWeight.W700,
          color: '#00AA00',
        },
      };

      const result = generateItemStyles(item);

      expect(result.price.fontSize).toBe(22);
      expect(result.price.fontWeight).toBe('700');
      expect(result.price.color).toBe('#00AA00');
    });

    it('applies item styling (box model)', () => {
      const item: MenuItem = {
        name: 'Styled Item',
        displayOrder: 0,
        styling: {
          padding: 16,
          margin: 4,
          borderWidth: 1,
          borderRadius: 8,
          shadowEnabled: true,
        },
      };

      const result = generateItemStyles(item);

      expect(result.container.padding).toBe(16);
      expect(result.container.margin).toBe(4);
      expect(result.container.borderWidth).toBe(1);
      expect(result.container.borderRadius).toBe(8);
      expect(result.container.elevation).toBe(4);
    });

    it('uses colorScheme for default colors', () => {
      const item: MenuItem = {
        name: 'With Colors',
        displayOrder: 0,
      };
      const colorScheme: ColorScheme = {
        text: '#222222',
        textSecondary: '#888888',
        price: '#009900',
        border: '#DDDDDD',
      };

      const result = generateItemStyles(item, colorScheme);

      expect(result.name.color).toBe('#222222');
      expect(result.description.color).toBe('#888888');
      expect(result.price.color).toBe('#009900');
      expect(result.container.borderColor).toBe('#DDDDDD');
    });

    it('item typography overrides colorScheme', () => {
      const item: MenuItem = {
        name: 'Override Colors',
        displayOrder: 0,
        typography: { nameColor: '#FF0000' },
        priceStyle: { color: '#0000FF' },
      };
      const colorScheme: ColorScheme = {
        text: '#222222',
        price: '#009900',
      };

      const result = generateItemStyles(item, colorScheme);

      expect(result.name.color).toBe('#FF0000');
      expect(result.price.color).toBe('#0000FF');
    });

    it('generates image styles from imageSettings', () => {
      const item: MenuItem = {
        name: 'With Image',
        displayOrder: 0,
        imageSettings: {
          size: MediaSize.Small,
          borderRadius: 4,
          opacity: 1,
          fit: MediaFit.Cover,
        },
      };

      const result = generateItemStyles(item);

      expect(result.image.width).toBe(80);
      expect(result.image.height).toBe(80);
      expect(result.image.borderRadius).toBe(4);
      expect(result.image.resizeMode).toBe('cover');
    });
  });

  describe('generateTypographyStyles', () => {
    it('returns default styles when typography is undefined', () => {
      const result = generateTypographyStyles(undefined);

      expect(result.title.fontSize).toBe(DEFAULT_TYPOGRAPHY.titleFontSize);
      expect(result.title.fontWeight).toBe(DEFAULT_TYPOGRAPHY.titleFontWeight);
      expect(result.body.fontSize).toBe(DEFAULT_TYPOGRAPHY.bodyFontSize);
      expect(result.body.fontWeight).toBe(DEFAULT_TYPOGRAPHY.bodyFontWeight);
      expect(result.price.fontSize).toBe(DEFAULT_TYPOGRAPHY.priceFontSize);
      expect(result.price.fontWeight).toBe(DEFAULT_TYPOGRAPHY.priceFontWeight);
    });

    it('applies typography settings', () => {
      const typography: GlobalTypography = {
        titleFont: 'Helvetica',
        titleFontSize: 36,
        titleFontWeight: FontWeight.W800,
        bodyFont: 'Arial',
        bodyFontSize: 18,
        bodyFontWeight: FontWeight.W400,
        priceFont: 'Roboto',
        priceFontSize: 20,
        priceFontWeight: FontWeight.W600,
      };

      const result = generateTypographyStyles(typography);

      expect(result.title.fontFamily).toBe('Helvetica');
      expect(result.title.fontSize).toBe(36);
      expect(result.title.fontWeight).toBe('800');
      expect(result.body.fontFamily).toBe('Arial');
      expect(result.body.fontSize).toBe(18);
      expect(result.body.fontWeight).toBe('400');
      expect(result.price.fontFamily).toBe('Roboto');
      expect(result.price.fontSize).toBe(20);
      expect(result.price.fontWeight).toBe('600');
    });

    it('does not set fontFamily when using System font', () => {
      const typography: GlobalTypography = {
        titleFont: 'System',
        bodyFont: 'System',
        priceFont: 'System',
      };

      const result = generateTypographyStyles(typography);

      expect(result.title.fontFamily).toBeUndefined();
      expect(result.body.fontFamily).toBeUndefined();
      expect(result.price.fontFamily).toBeUndefined();
    });

    it('uses colorScheme for text colors', () => {
      const typography: GlobalTypography = {};
      const colorScheme: ColorScheme = {
        text: '#333333',
        price: '#CC0000',
      };

      const result = generateTypographyStyles(typography, colorScheme);

      expect(result.title.color).toBe('#333333');
      expect(result.body.color).toBe('#333333');
      expect(result.price.color).toBe('#CC0000');
    });

    it('merges partial typography with defaults', () => {
      const typography: GlobalTypography = {
        titleFontSize: 40,
      };

      const result = generateTypographyStyles(typography);

      expect(result.title.fontSize).toBe(40);
      expect(result.title.fontWeight).toBe(DEFAULT_TYPOGRAPHY.titleFontWeight);
      expect(result.body.fontSize).toBe(DEFAULT_TYPOGRAPHY.bodyFontSize);
    });
  });

  describe('generateBoxStyles', () => {
    it('returns default styles when box is undefined', () => {
      const result = generateBoxStyles(undefined);

      expect(result.padding).toBe(DEFAULT_BOX_STYLING.padding);
      expect(result.margin).toBe(DEFAULT_BOX_STYLING.margin);
      expect(result.borderWidth).toBe(DEFAULT_BOX_STYLING.borderWidth);
      expect(result.borderRadius).toBe(DEFAULT_BOX_STYLING.borderRadius);
    });

    it('applies all box styling properties', () => {
      const box: BoxStyling = {
        padding: 20,
        margin: 10,
        borderWidth: 2,
        borderColor: '#AAAAAA',
        borderRadius: 12,
      };

      const result = generateBoxStyles(box);

      expect(result.padding).toBe(20);
      expect(result.margin).toBe(10);
      expect(result.borderWidth).toBe(2);
      expect(result.borderColor).toBe('#AAAAAA');
      expect(result.borderRadius).toBe(12);
    });

    it('applies shadow when enabled', () => {
      const box: BoxStyling = {
        shadowEnabled: true,
        shadowColor: '#000000',
        shadowBlur: 6,
      };

      const result = generateBoxStyles(box);

      expect(result.shadowColor).toBe('#000000');
      expect(result.shadowRadius).toBe(6);
      expect(result.shadowOffset).toEqual({ width: 0, height: 2 });
      expect(result.shadowOpacity).toBe(0.25);
      expect(result.elevation).toBe(4);
    });

    it('does not apply shadow when disabled', () => {
      const box: BoxStyling = {
        shadowEnabled: false,
      };

      const result = generateBoxStyles(box);

      expect(result.shadowColor).toBeUndefined();
      expect(result.shadowRadius).toBeUndefined();
      expect(result.elevation).toBeUndefined();
    });

    it('uses colorScheme for default border color', () => {
      const box: BoxStyling = {
        borderWidth: 1,
      };
      const colorScheme: ColorScheme = {
        border: '#EEEEEE',
      };

      const result = generateBoxStyles(box, colorScheme);

      expect(result.borderColor).toBe('#EEEEEE');
    });

    it('box borderColor overrides colorScheme', () => {
      const box: BoxStyling = {
        borderWidth: 1,
        borderColor: '#FF0000',
      };
      const colorScheme: ColorScheme = {
        border: '#EEEEEE',
      };

      const result = generateBoxStyles(box, colorScheme);

      expect(result.borderColor).toBe('#FF0000');
    });

    it('uses default shadow color when not specified', () => {
      const box: BoxStyling = {
        shadowEnabled: true,
      };

      const result = generateBoxStyles(box);

      expect(result.shadowColor).toBe('rgba(0, 0, 0, 0.25)');
    });
  });

  describe('generateMediaStyles', () => {
    it('returns default styles when media is undefined', () => {
      const result = generateMediaStyles(undefined);

      expect(result.borderRadius).toBe(DEFAULT_ITEM_IMAGE_SETTINGS.borderRadius);
      expect(result.opacity).toBe(DEFAULT_ITEM_IMAGE_SETTINGS.opacity);
      expect(result.resizeMode).toBe('cover');
    });

    it('applies media settings', () => {
      const media: MediaSettings = {
        size: MediaSize.Medium,
        borderRadius: 8,
        opacity: 0.8,
        fit: MediaFit.Contain,
      };

      const result = generateMediaStyles(media);

      expect(result.width).toBe(120);
      expect(result.height).toBe(120);
      expect(result.borderRadius).toBe(8);
      expect(result.opacity).toBe(0.8);
      expect(result.resizeMode).toBe('contain');
    });

    it('handles thumbnail size', () => {
      const media: MediaSettings = {
        size: MediaSize.Thumbnail,
      };

      const result = generateMediaStyles(media);

      expect(result.width).toBe(48);
      expect(result.height).toBe(48);
    });

    it('handles small size', () => {
      const media: MediaSettings = {
        size: MediaSize.Small,
      };

      const result = generateMediaStyles(media);

      expect(result.width).toBe(80);
      expect(result.height).toBe(80);
    });

    it('handles medium size', () => {
      const media: MediaSettings = {
        size: MediaSize.Medium,
      };

      const result = generateMediaStyles(media);

      expect(result.width).toBe(120);
      expect(result.height).toBe(120);
    });

    it('handles large size', () => {
      const media: MediaSettings = {
        size: MediaSize.Large,
      };

      const result = generateMediaStyles(media);

      expect(result.width).toBe(200);
      expect(result.height).toBe(200);
    });

    it('handles custom size with dimensions', () => {
      const media: MediaSettings = {
        size: MediaSize.Custom,
        customWidth: 150,
        customHeight: 100,
      };

      const result = generateMediaStyles(media);

      expect(result.width).toBe(150);
      expect(result.height).toBe(100);
    });

    it('handles full size (no fixed dimensions)', () => {
      const media: MediaSettings = {
        size: MediaSize.Full,
      };

      const result = generateMediaStyles(media);

      expect(result.width).toBeUndefined();
      expect(result.height).toBeUndefined();
    });

    it('maps fit values to resizeMode correctly', () => {
      const coverMedia: MediaSettings = { fit: MediaFit.Cover };
      const containMedia: MediaSettings = { fit: MediaFit.Contain };
      const fillMedia: MediaSettings = { fit: MediaFit.Fill };
      const noneMedia: MediaSettings = { fit: MediaFit.None };

      expect(generateMediaStyles(coverMedia).resizeMode).toBe('cover');
      expect(generateMediaStyles(containMedia).resizeMode).toBe('contain');
      expect(generateMediaStyles(fillMedia).resizeMode).toBe('stretch');
      expect(generateMediaStyles(noneMedia).resizeMode).toBe('center');
    });
  });

  describe('generateCategoryTypographyStyles', () => {
    it('returns default styles when parameters are undefined', () => {
      const result = generateCategoryTypographyStyles(undefined, undefined);

      expect(result.title.fontSize).toBe(DEFAULT_CATEGORY_TYPOGRAPHY.titleFontSize);
      expect(result.title.fontWeight).toBe(DEFAULT_CATEGORY_TYPOGRAPHY.titleFontWeight);
      expect(result.description.fontSize).toBe(DEFAULT_CATEGORY_TYPOGRAPHY.descriptionFontSize);
    });

    it('applies category typography settings', () => {
      const typography: CategoryTypography = {
        titleFontSize: 30,
        titleFontWeight: FontWeight.W800,
        titleColor: '#112233',
        descriptionFontSize: 16,
        descriptionFontWeight: FontWeight.W400,
        descriptionColor: '#445566',
      };

      const result = generateCategoryTypographyStyles(typography, undefined);

      expect(result.title.fontSize).toBe(30);
      expect(result.title.fontWeight).toBe('800');
      expect(result.title.color).toBe('#112233');
      expect(result.description.fontSize).toBe(16);
      expect(result.description.fontWeight).toBe('400');
      expect(result.description.color).toBe('#445566');
    });

    it('applies layout alignment', () => {
      const layout: CategoryLayout = {
        contentAlignment: ContentAlignment.Center,
      };

      const result = generateCategoryTypographyStyles(undefined, layout);

      expect(result.title.textAlign).toBe('center');
      expect(result.description.textAlign).toBe('center');
    });

    it('uses colorScheme for default colors', () => {
      const colorScheme: ColorScheme = {
        text: '#AABBCC',
        textSecondary: '#DDEEFF',
      };

      const result = generateCategoryTypographyStyles(undefined, undefined, colorScheme);

      expect(result.title.color).toBe('#AABBCC');
      expect(result.description.color).toBe('#DDEEFF');
    });
  });

  describe('generateItemTypographyStyles', () => {
    it('returns default styles when parameters are undefined', () => {
      const result = generateItemTypographyStyles(undefined, undefined);

      expect(result.name.fontSize).toBe(DEFAULT_ITEM_TYPOGRAPHY.nameFontSize);
      expect(result.name.fontWeight).toBe(DEFAULT_ITEM_TYPOGRAPHY.nameFontWeight);
      expect(result.description.fontSize).toBe(DEFAULT_ITEM_TYPOGRAPHY.descriptionFontSize);
    });

    it('applies item typography settings', () => {
      const typography: ItemTypography = {
        nameFontSize: 22,
        nameFontWeight: FontWeight.Bold,
        nameColor: '#990000',
        descriptionFontSize: 13,
        descriptionFontWeight: FontWeight.W300,
        descriptionColor: '#666666',
      };

      const result = generateItemTypographyStyles(typography, undefined);

      expect(result.name.fontSize).toBe(22);
      expect(result.name.fontWeight).toBe('bold');
      expect(result.name.color).toBe('#990000');
      expect(result.description.fontSize).toBe(13);
      expect(result.description.fontWeight).toBe('300');
      expect(result.description.color).toBe('#666666');
    });

    it('applies layout alignment', () => {
      const layout: ItemLayout = {
        contentAlignment: ContentAlignment.Right,
      };

      const result = generateItemTypographyStyles(undefined, layout);

      expect(result.name.textAlign).toBe('right');
      expect(result.description.textAlign).toBe('right');
    });

    it('uses colorScheme for default colors', () => {
      const colorScheme: ColorScheme = {
        text: '#123456',
        textSecondary: '#789ABC',
      };

      const result = generateItemTypographyStyles(undefined, undefined, colorScheme);

      expect(result.name.color).toBe('#123456');
      expect(result.description.color).toBe('#789ABC');
    });
  });

  describe('generatePriceStyles', () => {
    it('returns default styles when priceStyle is undefined', () => {
      const result = generatePriceStyles(undefined);

      expect(result.fontSize).toBe(DEFAULT_PRICE_STYLE.fontSize);
      expect(result.fontWeight).toBe(DEFAULT_PRICE_STYLE.fontWeight);
    });

    it('applies price style settings', () => {
      const priceStyle: PriceStyle = {
        fontSize: 24,
        fontWeight: FontWeight.W900,
        color: '#00FF00',
      };

      const result = generatePriceStyles(priceStyle);

      expect(result.fontSize).toBe(24);
      expect(result.fontWeight).toBe('900');
      expect(result.color).toBe('#00FF00');
    });

    it('uses colorScheme for default price color', () => {
      const colorScheme: ColorScheme = {
        price: '#FF6600',
      };

      const result = generatePriceStyles(undefined, colorScheme);

      expect(result.color).toBe('#FF6600');
    });

    it('priceStyle color overrides colorScheme', () => {
      const priceStyle: PriceStyle = {
        color: '#0000FF',
      };
      const colorScheme: ColorScheme = {
        price: '#FF6600',
      };

      const result = generatePriceStyles(priceStyle, colorScheme);

      expect(result.color).toBe('#0000FF');
    });

    it('merges partial priceStyle with defaults', () => {
      const priceStyle: PriceStyle = {
        fontSize: 26,
      };

      const result = generatePriceStyles(priceStyle);

      expect(result.fontSize).toBe(26);
      expect(result.fontWeight).toBe(DEFAULT_PRICE_STYLE.fontWeight);
    });
  });

  describe('edge cases', () => {
    it('handles empty category object', () => {
      const category: Category = {
        name: '',
        displayOrder: 0,
      };

      const result = generateCategoryStyles(category);

      expect(result.container.padding).toBe(DEFAULT_BOX_STYLING.padding);
      expect(result.title.fontSize).toBe(DEFAULT_CATEGORY_TYPOGRAPHY.titleFontSize);
    });

    it('handles empty item object', () => {
      const item: MenuItem = {
        name: '',
        displayOrder: 0,
      };

      const result = generateItemStyles(item);

      expect(result.container.padding).toBe(DEFAULT_BOX_STYLING.padding);
      expect(result.name.fontSize).toBe(DEFAULT_ITEM_TYPOGRAPHY.nameFontSize);
    });

    it('handles empty colorScheme', () => {
      const colorScheme: ColorScheme = {};

      const result = generateTypographyStyles(undefined, colorScheme);

      expect(result.title.color).toBe(DEFAULT_COLOR_SCHEME.text);
      expect(result.price.color).toBe(DEFAULT_COLOR_SCHEME.price);
    });

    it('handles partial boxStyling with shadow', () => {
      const box: BoxStyling = {
        shadowEnabled: true,
        // No shadowColor or shadowBlur
      };

      const result = generateBoxStyles(box);

      expect(result.shadowColor).toBe('rgba(0, 0, 0, 0.25)');
      expect(result.shadowRadius).toBe(4);
    });

    it('handles category with null borderColor in styling', () => {
      const category: Category = {
        name: 'Null Border',
        displayOrder: 0,
        styling: {
          borderWidth: 1,
          borderColor: undefined,
        },
      };

      const result = generateCategoryStyles(category);

      expect(result.container.borderColor).toBe(DEFAULT_COLOR_SCHEME.border);
    });

    it('handles item with undefined imageSettings', () => {
      const item: MenuItem = {
        name: 'No Image Settings',
        displayOrder: 0,
        imageSettings: undefined,
      };

      const result = generateItemStyles(item);

      expect(result.image.borderRadius).toBe(DEFAULT_ITEM_IMAGE_SETTINGS.borderRadius);
    });

    it('handles all alignment options', () => {
      const leftCategory: Category = {
        name: 'Left',
        displayOrder: 0,
        layout: { contentAlignment: ContentAlignment.Left },
      };
      const centerCategory: Category = {
        name: 'Center',
        displayOrder: 0,
        layout: { contentAlignment: ContentAlignment.Center },
      };
      const rightCategory: Category = {
        name: 'Right',
        displayOrder: 0,
        layout: { contentAlignment: ContentAlignment.Right },
      };

      expect(generateCategoryStyles(leftCategory).title.textAlign).toBe('left');
      expect(generateCategoryStyles(centerCategory).title.textAlign).toBe('center');
      expect(generateCategoryStyles(rightCategory).title.textAlign).toBe('right');
    });

    it('handles zero values correctly', () => {
      const box: BoxStyling = {
        padding: 0,
        margin: 0,
        borderWidth: 0,
        borderRadius: 0,
      };

      const result = generateBoxStyles(box);

      expect(result.padding).toBe(0);
      expect(result.margin).toBe(0);
      expect(result.borderWidth).toBe(0);
      expect(result.borderRadius).toBe(0);
    });

    it('handles media with opacity 0', () => {
      const media: MediaSettings = {
        opacity: 0,
      };

      const result = generateMediaStyles(media);

      expect(result.opacity).toBe(0);
    });

    it('handles custom size with only width', () => {
      const media: MediaSettings = {
        size: MediaSize.Custom,
        customWidth: 200,
      };

      const result = generateMediaStyles(media);

      expect(result.width).toBe(200);
      expect(result.height).toBeUndefined();
    });

    it('handles custom size with only height', () => {
      const media: MediaSettings = {
        size: MediaSize.Custom,
        customHeight: 150,
      };

      const result = generateMediaStyles(media);

      expect(result.width).toBeUndefined();
      expect(result.height).toBe(150);
    });
  });
});
