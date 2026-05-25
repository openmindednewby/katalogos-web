import {
  COLOR_PRESETS,
  COLOR_PROPERTY_KEYS,
  DISABLED_OPACITY,
  INVALID_COLOR_SWATCH,
  isValidHexColor,
} from './colorSchemeConstants';

describe('colorSchemeConstants', () => {
  describe('isValidHexColor', () => {
    it('accepts valid 6-digit hex colors', () => {
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#000000')).toBe(true);
      expect(isValidHexColor('#1A2B3C')).toBe(true);
      expect(isValidHexColor('#aabbcc')).toBe(true);
    });

    it('accepts valid 3-digit hex colors', () => {
      expect(isValidHexColor('#FFF')).toBe(true);
      expect(isValidHexColor('#000')).toBe(true);
      expect(isValidHexColor('#abc')).toBe(true);
    });

    it('rejects colors without hash prefix', () => {
      expect(isValidHexColor('FFFFFF')).toBe(false);
      expect(isValidHexColor('000')).toBe(false);
    });

    it('rejects invalid hex characters', () => {
      expect(isValidHexColor('#GGGGGG')).toBe(false);
      expect(isValidHexColor('#ZZZZZZ')).toBe(false);
    });

    it('rejects wrong length hex colors', () => {
      expect(isValidHexColor('#FFFF')).toBe(false);
      expect(isValidHexColor('#FF')).toBe(false);
      expect(isValidHexColor('#FFFFFFF')).toBe(false);
    });

    it('rejects other color formats', () => {
      expect(isValidHexColor('rgb(255,255,255)')).toBe(false);
      expect(isValidHexColor('rgba(255,255,255,1)')).toBe(false);
      expect(isValidHexColor('red')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidHexColor('')).toBe(false);
    });
  });

  describe('COLOR_PRESETS', () => {
    it('exports 4 preset options', () => {
      expect(COLOR_PRESETS).toHaveLength(4);
    });

    it('contains light preset', () => {
      const light = COLOR_PRESETS.find((p) => p.key === 'light');
      expect(light).toBeDefined();
      expect(light?.name).toBe('Light');
    });

    it('contains dark preset', () => {
      const dark = COLOR_PRESETS.find((p) => p.key === 'dark');
      expect(dark).toBeDefined();
      expect(dark?.name).toBe('Dark');
    });

    it('contains warm preset', () => {
      const warm = COLOR_PRESETS.find((p) => p.key === 'warm');
      expect(warm).toBeDefined();
      expect(warm?.name).toBe('Warm');
    });

    it('contains ocean preset', () => {
      const ocean = COLOR_PRESETS.find((p) => p.key === 'ocean');
      expect(ocean).toBeDefined();
      expect(ocean?.name).toBe('Ocean');
    });

    it('all presets have required properties', () => {
      COLOR_PRESETS.forEach((preset) => {
        expect(preset.name).toBeDefined();
        expect(preset.key).toBeDefined();
        expect(preset.scheme).toBeDefined();
        expect(preset.scheme.background).toBeDefined();
        expect(preset.scheme.text).toBeDefined();
        expect(preset.scheme.accent).toBeDefined();
      });
    });

    it('all preset colors are valid hex colors', () => {
      COLOR_PRESETS.forEach((preset) => {
        Object.values(preset.scheme).forEach((color) => {
          expect(isValidHexColor(String(color))).toBe(true);
        });
      });
    });
  });

  describe('COLOR_PROPERTY_KEYS', () => {
    it('exports 9 color property keys', () => {
      expect(COLOR_PROPERTY_KEYS).toHaveLength(9);
    });

    it('contains all expected keys', () => {
      const expectedKeys = [
        'background',
        'surface',
        'text',
        'textSecondary',
        'accent',
        'price',
        'border',
        'divider',
        'unavailable',
      ];
      expect(COLOR_PROPERTY_KEYS).toEqual(expectedKeys);
    });
  });

  describe('constants', () => {
    it('exports DISABLED_OPACITY as 0.5', () => {
      expect(DISABLED_OPACITY).toBe(0.5);
    });

    it('exports INVALID_COLOR_SWATCH as gray', () => {
      expect(INVALID_COLOR_SWATCH).toBe('#CCCCCC');
    });
  });
});
