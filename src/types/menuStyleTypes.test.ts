import FontWeight from './enums/FontWeight';
import MediaFit from './enums/MediaFit';
import MediaPosition from './enums/MediaPosition';
import MediaSize from './enums/MediaSize';
import {
  isValidColorScheme,
  isValidMediaSettings,
  isValidTypography,
  isValidFontWeight,
  isValidOverlaySettings,
  isValidBadge,
} from './menuStyleTypes';

import type {
  ColorScheme,
  MediaSettings,
  GlobalTypography,
  OverlaySettings,
  Badge,
} from './menuStyleTypes';

describe('menuStyleTypes type guards', () => {
  describe('isValidColorScheme', () => {
    it('accepts valid color scheme with all properties', () => {
      const colorScheme: ColorScheme = {
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#333333',
        textSecondary: '#666666',
        accent: '#007bff',
        price: '#28a745',
        border: '#dddddd',
        divider: '#eeeeee',
        unavailable: '#999999',
      };

      expect(isValidColorScheme(colorScheme)).toBe(true);
    });

    it('accepts valid color scheme with partial properties', () => {
      const colorScheme: ColorScheme = {
        background: '#ffffff',
        text: '#333333',
      };

      expect(isValidColorScheme(colorScheme)).toBe(true);
    });

    it('accepts empty object as valid color scheme', () => {
      expect(isValidColorScheme({})).toBe(true);
    });

    it('accepts color scheme with undefined values', () => {
      const colorScheme = {
        background: '#ffffff',
        text: undefined,
      };

      expect(isValidColorScheme(colorScheme)).toBe(true);
    });

    it('rejects null', () => {
      expect(isValidColorScheme(null)).toBe(false);
    });

    it('rejects undefined', () => {
      expect(isValidColorScheme(undefined)).toBe(false);
    });

    it('rejects non-object values', () => {
      expect(isValidColorScheme('string')).toBe(false);
      expect(isValidColorScheme(123)).toBe(false);
      expect(isValidColorScheme(true)).toBe(false);
      expect(isValidColorScheme([])).toBe(false);
    });

    it('rejects object with invalid property names', () => {
      const invalid = {
        background: '#ffffff',
        invalidProperty: '#333333',
      };

      expect(isValidColorScheme(invalid)).toBe(false);
    });

    it('rejects object with non-string values', () => {
      const invalid = {
        background: 123,
      };

      expect(isValidColorScheme(invalid)).toBe(false);
    });
  });

  describe('isValidMediaSettings', () => {
    it('accepts valid media settings with all properties', () => {
      const mediaSettings: MediaSettings = {
        position: MediaPosition.Left,
        size: MediaSize.Medium,
        customWidth: 200,
        customHeight: 150,
        fit: MediaFit.Cover,
        borderRadius: 8,
        opacity: 0.9,
        overlay: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.5)',
          opacity: 0.5,
        },
      };

      expect(isValidMediaSettings(mediaSettings)).toBe(true);
    });

    it('accepts valid media settings with partial properties', () => {
      const mediaSettings: MediaSettings = {
        position: MediaPosition.Right,
        size: MediaSize.Small,
      };

      expect(isValidMediaSettings(mediaSettings)).toBe(true);
    });

    it('accepts empty object as valid media settings', () => {
      expect(isValidMediaSettings({})).toBe(true);
    });

    it('accepts all valid position values', () => {
      const validPositions = ['left', 'right', 'top', 'bottom', 'background', 'none'];

      for (const position of validPositions) 
        expect(isValidMediaSettings({ position })).toBe(true);
      
    });

    it('rejects invalid position value', () => {
      const invalid = {
        position: 'invalid-position',
      };

      expect(isValidMediaSettings(invalid)).toBe(false);
    });

    it('rejects null', () => {
      expect(isValidMediaSettings(null)).toBe(false);
    });

    it('rejects undefined', () => {
      expect(isValidMediaSettings(undefined)).toBe(false);
    });

    it('rejects non-object values', () => {
      expect(isValidMediaSettings('string')).toBe(false);
      expect(isValidMediaSettings(123)).toBe(false);
    });

    it('rejects non-string position', () => {
      const invalid = {
        position: 123,
      };

      expect(isValidMediaSettings(invalid)).toBe(false);
    });
  });

  describe('isValidTypography', () => {
    it('accepts valid typography with all properties', () => {
      const typography: GlobalTypography = {
        titleFont: 'Arial',
        titleFontSize: 24,
        titleFontWeight: FontWeight.Bold,
        bodyFont: 'Helvetica',
        bodyFontSize: 16,
        bodyFontWeight: FontWeight.W400,
        priceFont: 'Georgia',
        priceFontSize: 18,
        priceFontWeight: FontWeight.W600,
      };

      expect(isValidTypography(typography)).toBe(true);
    });

    it('accepts valid typography with partial properties', () => {
      const typography: GlobalTypography = {
        titleFont: 'Arial',
        titleFontSize: 24,
      };

      expect(isValidTypography(typography)).toBe(true);
    });

    it('accepts empty object as valid typography', () => {
      expect(isValidTypography({})).toBe(true);
    });

    it('accepts all valid font weight values', () => {
      const validWeights = ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'];

      for (const weight of validWeights) 
        expect(isValidTypography({ titleFontWeight: weight })).toBe(true);
      
    });

    it('rejects invalid font weight value', () => {
      const invalid = {
        titleFontWeight: 'extra-bold',
      };

      expect(isValidTypography(invalid)).toBe(false);
    });

    it('rejects non-string font weight', () => {
      const invalid = {
        titleFontWeight: 700,
      };

      expect(isValidTypography(invalid)).toBe(false);
    });

    it('rejects negative font size', () => {
      const invalid = {
        titleFontSize: -10,
      };

      expect(isValidTypography(invalid)).toBe(false);
    });

    it('rejects non-number font size', () => {
      const invalid = {
        titleFontSize: '16px',
      };

      expect(isValidTypography(invalid)).toBe(false);
    });

    it('rejects null', () => {
      expect(isValidTypography(null)).toBe(false);
    });

    it('rejects undefined', () => {
      expect(isValidTypography(undefined)).toBe(false);
    });
  });

  describe('isValidFontWeight', () => {
    it('accepts all valid numeric font weights', () => {
      const numericWeights = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

      for (const weight of numericWeights) 
        expect(isValidFontWeight(weight)).toBe(true);
      
    });

    it('accepts normal and bold keywords', () => {
      expect(isValidFontWeight('normal')).toBe(true);
      expect(isValidFontWeight('bold')).toBe(true);
    });

    it('rejects invalid string values', () => {
      expect(isValidFontWeight('light')).toBe(false);
      expect(isValidFontWeight('extra-bold')).toBe(false);
      expect(isValidFontWeight('semibold')).toBe(false);
    });

    it('rejects numeric values (must be strings)', () => {
      expect(isValidFontWeight(400)).toBe(false);
      expect(isValidFontWeight(700)).toBe(false);
    });

    it('rejects null and undefined', () => {
      expect(isValidFontWeight(null)).toBe(false);
      expect(isValidFontWeight(undefined)).toBe(false);
    });

    it('rejects non-string types', () => {
      expect(isValidFontWeight({})).toBe(false);
      expect(isValidFontWeight([])).toBe(false);
      expect(isValidFontWeight(true)).toBe(false);
    });
  });

  describe('isValidOverlaySettings', () => {
    it('accepts valid overlay settings', () => {
      const overlay: OverlaySettings = {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.5)',
        opacity: 0.5,
      };

      expect(isValidOverlaySettings(overlay)).toBe(true);
    });

    it('accepts disabled overlay', () => {
      const overlay: OverlaySettings = {
        enabled: false,
        color: '#000000',
        opacity: 0,
      };

      expect(isValidOverlaySettings(overlay)).toBe(true);
    });

    it('accepts opacity at boundary values', () => {
      expect(isValidOverlaySettings({ enabled: true, color: '#000', opacity: 0 })).toBe(true);
      expect(isValidOverlaySettings({ enabled: true, color: '#000', opacity: 1 })).toBe(true);
    });

    it('rejects opacity below 0', () => {
      const invalid = {
        enabled: true,
        color: '#000000',
        opacity: -0.1,
      };

      expect(isValidOverlaySettings(invalid)).toBe(false);
    });

    it('rejects opacity above 1', () => {
      const invalid = {
        enabled: true,
        color: '#000000',
        opacity: 1.1,
      };

      expect(isValidOverlaySettings(invalid)).toBe(false);
    });

    it('rejects missing enabled field', () => {
      const invalid = {
        color: '#000000',
        opacity: 0.5,
      };

      expect(isValidOverlaySettings(invalid)).toBe(false);
    });

    it('rejects missing color field', () => {
      const invalid = {
        enabled: true,
        opacity: 0.5,
      };

      expect(isValidOverlaySettings(invalid)).toBe(false);
    });

    it('rejects missing opacity field', () => {
      const invalid = {
        enabled: true,
        color: '#000000',
      };

      expect(isValidOverlaySettings(invalid)).toBe(false);
    });

    it('rejects non-boolean enabled', () => {
      const invalid = {
        enabled: 'true',
        color: '#000000',
        opacity: 0.5,
      };

      expect(isValidOverlaySettings(invalid)).toBe(false);
    });

    it('rejects non-string color', () => {
      const invalid = {
        enabled: true,
        color: 123,
        opacity: 0.5,
      };

      expect(isValidOverlaySettings(invalid)).toBe(false);
    });

    it('rejects non-number opacity', () => {
      const invalid = {
        enabled: true,
        color: '#000000',
        opacity: '0.5',
      };

      expect(isValidOverlaySettings(invalid)).toBe(false);
    });

    it('rejects null', () => {
      expect(isValidOverlaySettings(null)).toBe(false);
    });

    it('rejects undefined', () => {
      expect(isValidOverlaySettings(undefined)).toBe(false);
    });
  });

  describe('isValidBadge', () => {
    it('accepts valid badge with all properties', () => {
      const badge: Badge = {
        text: 'New',
        backgroundColor: '#ff0000',
        textColor: '#ffffff',
        icon: 'star',
      };

      expect(isValidBadge(badge)).toBe(true);
    });

    it('accepts valid badge without optional icon', () => {
      const badge: Badge = {
        text: 'Sale',
        backgroundColor: '#00ff00',
        textColor: '#000000',
      };

      expect(isValidBadge(badge)).toBe(true);
    });

    it('accepts badge with undefined icon', () => {
      const badge = {
        text: 'Hot',
        backgroundColor: '#ff6600',
        textColor: '#ffffff',
        icon: undefined,
      };

      expect(isValidBadge(badge)).toBe(true);
    });

    it('rejects missing text', () => {
      const invalid = {
        backgroundColor: '#ff0000',
        textColor: '#ffffff',
      };

      expect(isValidBadge(invalid)).toBe(false);
    });

    it('rejects missing backgroundColor', () => {
      const invalid = {
        text: 'New',
        textColor: '#ffffff',
      };

      expect(isValidBadge(invalid)).toBe(false);
    });

    it('rejects missing textColor', () => {
      const invalid = {
        text: 'New',
        backgroundColor: '#ff0000',
      };

      expect(isValidBadge(invalid)).toBe(false);
    });

    it('rejects non-string text', () => {
      const invalid = {
        text: 123,
        backgroundColor: '#ff0000',
        textColor: '#ffffff',
      };

      expect(isValidBadge(invalid)).toBe(false);
    });

    it('rejects non-string backgroundColor', () => {
      const invalid = {
        text: 'New',
        backgroundColor: 255,
        textColor: '#ffffff',
      };

      expect(isValidBadge(invalid)).toBe(false);
    });

    it('rejects non-string icon', () => {
      const invalid = {
        text: 'New',
        backgroundColor: '#ff0000',
        textColor: '#ffffff',
        icon: 123,
      };

      expect(isValidBadge(invalid)).toBe(false);
    });

    it('rejects null', () => {
      expect(isValidBadge(null)).toBe(false);
    });

    it('rejects undefined', () => {
      expect(isValidBadge(undefined)).toBe(false);
    });

    it('rejects non-object values', () => {
      expect(isValidBadge('string')).toBe(false);
      expect(isValidBadge(123)).toBe(false);
      expect(isValidBadge([])).toBe(false);
    });
  });

  describe('interface instantiation', () => {
    it('allows partial GlobalTypography', () => {
      const typography: GlobalTypography = {
        titleFont: 'Arial',
      };

      expect(typography.titleFont).toBe('Arial');
      expect(typography.titleFontSize).toBeUndefined();
    });

    it('allows partial ColorScheme', () => {
      const colorScheme: ColorScheme = {
        background: '#fff',
      };

      expect(colorScheme.background).toBe('#fff');
      expect(colorScheme.text).toBeUndefined();
    });

    it('allows partial MediaSettings', () => {
      const mediaSettings: MediaSettings = {
        position: MediaPosition.Left,
      };

      expect(mediaSettings.position).toBe('left');
      expect(mediaSettings.size).toBeUndefined();
    });

    it('allows partial OverlaySettings in MediaSettings', () => {
      const mediaSettings: MediaSettings = {
        position: MediaPosition.Top,
        overlay: {
          enabled: true,
          color: '#000',
          opacity: 0.5,
        },
      };

      expect(mediaSettings.overlay?.enabled).toBe(true);
    });
  });
});
