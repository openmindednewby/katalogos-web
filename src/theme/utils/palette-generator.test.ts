import {
  darken,
  hexToHsl,
  hslToHex,
  isValidHex,
  lighten,
  generateColorScale,
  generateThemePalette,
} from './palette-generator';

import type { TenantThemeConfig } from '../types';

// -- Helpers ------------------------------------------------------------------

const SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

/** Sum the RGB values of a hex string to measure relative brightness. */
function hexBrightness(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return r + g + b;
}

// -- isValidHex ---------------------------------------------------------------

describe('isValidHex', () => {
  it('accepts #RRGGBB format', () => {
    expect(isValidHex('#005f73')).toBe(true);
    expect(isValidHex('#FFFFFF')).toBe(true);
    expect(isValidHex('#000000')).toBe(true);
  });

  it('accepts #RGB shorthand', () => {
    expect(isValidHex('#fff')).toBe(true);
    expect(isValidHex('#ABC')).toBe(true);
  });

  it('rejects missing hash', () => {
    expect(isValidHex('005f73')).toBe(false);
  });

  it('rejects invalid characters', () => {
    expect(isValidHex('#GGGGGG')).toBe(false);
    expect(isValidHex('#xyz')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidHex('#FF')).toBe(false);
    expect(isValidHex('#FFFFFFF')).toBe(false);
    expect(isValidHex('#1234')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidHex('')).toBe(false);
  });
});

// -- hexToHsl / hslToHex round-trip -------------------------------------------

describe('hexToHsl', () => {
  it('converts pure red', () => {
    const hsl = hexToHsl('#ff0000');
    expect(hsl.h).toBeCloseTo(0, 0);
    expect(hsl.s).toBeCloseTo(1, 1);
    expect(hsl.l).toBeCloseTo(0.5, 1);
  });

  it('converts pure green', () => {
    const hsl = hexToHsl('#00ff00');
    expect(hsl.h).toBeCloseTo(120, 0);
    expect(hsl.s).toBeCloseTo(1, 1);
    expect(hsl.l).toBeCloseTo(0.5, 1);
  });

  it('converts pure blue', () => {
    const hsl = hexToHsl('#0000ff');
    expect(hsl.h).toBeCloseTo(240, 0);
    expect(hsl.s).toBeCloseTo(1, 1);
    expect(hsl.l).toBeCloseTo(0.5, 1);
  });

  it('converts pure white to zero saturation', () => {
    const hsl = hexToHsl('#ffffff');
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBeCloseTo(1, 1);
  });

  it('converts pure black to zero saturation', () => {
    const hsl = hexToHsl('#000000');
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(0);
  });

  it('handles #RGB shorthand', () => {
    const hsl = hexToHsl('#f00');
    expect(hsl.h).toBeCloseTo(0, 0);
    expect(hsl.s).toBeCloseTo(1, 1);
  });
});

describe('hslToHex', () => {
  it('converts achromatic gray', () => {
    const hex = hslToHex(0, 0, 0.5);
    expect(hex).toBe('#808080');
  });

  it('converts pure red', () => {
    const hex = hslToHex(0, 1, 0.5);
    expect(hex).toBe('#ff0000');
  });

  it('converts pure white', () => {
    const hex = hslToHex(0, 0, 1);
    expect(hex).toBe('#ffffff');
  });

  it('converts pure black', () => {
    const hex = hslToHex(0, 0, 0);
    expect(hex).toBe('#000000');
  });
});

describe('hex <-> HSL round-trip', () => {
  const testColors = ['#005f73', '#94d2bd', '#ee9b00', '#ae2012', '#ffffff', '#000000', '#808080'];

  it.each(testColors)('round-trips %s with minimal loss', (hex) => {
    const hsl = hexToHsl(hex);
    const result = hslToHex(hsl.h, hsl.s, hsl.l);
    // Allow +/-1 per channel due to rounding
    const originalBrightness = hexBrightness(hex);
    const resultBrightness = hexBrightness(result);
    expect(Math.abs(originalBrightness - resultBrightness)).toBeLessThanOrEqual(3);
  });
});

// -- lighten / darken ---------------------------------------------------------

const NEAR_WHITE_BRIGHTNESS = 700;
const NEAR_BLACK_BRIGHTNESS = 20;

describe('lighten', () => {
  it('lightens a color', () => {
    const result = lighten('#005f73', 0.5);
    expect(hexBrightness(result)).toBeGreaterThan(hexBrightness('#005f73'));
  });

  it('returns near-white at amount 1', () => {
    const result = lighten('#005f73', 1);
    expect(hexBrightness(result)).toBeGreaterThan(NEAR_WHITE_BRIGHTNESS);
  });

  it('returns original at amount 0', () => {
    const result = lighten('#2563eb', 0);
    const hslOrig = hexToHsl('#2563eb');
    const hslResult = hexToHsl(result);
    expect(hslResult.l).toBeCloseTo(hslOrig.l, 1);
  });

  it('produces valid hex output', () => {
    const result = lighten('#ae2012', 0.3);
    expect(isValidHex(result)).toBe(true);
  });
});

describe('darken', () => {
  it('darkens a color', () => {
    const result = darken('#94d2bd', 0.5);
    expect(hexBrightness(result)).toBeLessThan(hexBrightness('#94d2bd'));
  });

  it('returns near-black at amount 1', () => {
    const result = darken('#94d2bd', 1);
    expect(hexBrightness(result)).toBeLessThan(NEAR_BLACK_BRIGHTNESS);
  });

  it('returns original at amount 0', () => {
    const result = darken('#2563eb', 0);
    const hslOrig = hexToHsl('#2563eb');
    const hslResult = hexToHsl(result);
    expect(hslResult.l).toBeCloseTo(hslOrig.l, 1);
  });

  it('produces valid hex output', () => {
    const result = darken('#ee9b00', 0.7);
    expect(isValidHex(result)).toBe(true);
  });
});

// -- generateColorScale -------------------------------------------------------

describe('generateColorScale', () => {
  it('returns all ten shade keys', () => {
    const scale = generateColorScale('#005f73');
    for (const key of SHADE_KEYS)
      expect(scale[key as keyof typeof scale]).toBeDefined();
  });

  it('shade 500 equals the normalized base color', () => {
    const scale = generateColorScale('#005f73');
    expect(scale['500']).toBe('#005f73');
  });

  it('shade 500 normalizes uppercase hex', () => {
    const scale = generateColorScale('#AABBCC');
    expect(scale['500']).toBe('#aabbcc');
  });

  it('shade 50 is the lightest and 900 is the darkest', () => {
    const scale = generateColorScale('#005f73');
    const brightness50 = hexBrightness(scale['50']);
    const brightness900 = hexBrightness(scale['900']);
    expect(brightness50).toBeGreaterThan(brightness900);
  });

  it('shades are monotonically ordered by brightness (light to dark)', () => {
    const scale = generateColorScale('#005f73');
    for (let i = 0; i < SHADE_KEYS.length - 1; i++) {
      const current = hexBrightness(scale[SHADE_KEYS[i] as keyof typeof scale]);
      const next = hexBrightness(scale[SHADE_KEYS[i + 1] as keyof typeof scale]);
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it('all shades are valid hex colors', () => {
    const scale = generateColorScale('#ee9b00');
    for (const key of SHADE_KEYS) {
      const value = scale[key as keyof typeof scale];
      expect(isValidHex(value)).toBe(true);
    }
  });

  it('handles fully saturated color', () => {
    const scale = generateColorScale('#ff0000');
    expect(hexBrightness(scale['50'])).toBeGreaterThan(hexBrightness(scale['900']));
  });

  it('handles pure white input', () => {
    const scale = generateColorScale('#ffffff');
    expect(scale['500']).toBe('#ffffff');
    for (const key of SHADE_KEYS) {
      const value = scale[key as keyof typeof scale];
      expect(isValidHex(value)).toBe(true);
    }
  });

  it('handles pure black input', () => {
    const scale = generateColorScale('#000000');
    expect(scale['500']).toBe('#000000');
    for (const key of SHADE_KEYS) {
      const value = scale[key as keyof typeof scale];
      expect(isValidHex(value)).toBe(true);
    }
  });

  it('handles #RGB shorthand input', () => {
    const scale = generateColorScale('#f00');
    expect(scale['500']).toBe('#ff0000');
  });
});

// -- generateThemePalette -----------------------------------------------------

describe('generateThemePalette', () => {
  const mockConfig: TenantThemeConfig = {
    primary: '#005f73',
    secondary: '#94d2bd',
    accent: '#ee9b00',
    semantic: {
      success: '#0a9396',
      warning: '#ee9b00',
      error: '#ae2012',
      info: '#005f73',
    },
    light: {
      background: '#ffffff',
      surface: '#f7f7f7',
      surfaceElevated: '#ffffff',
      text: '#001219',
      textSecondary: '#777777',
      border: '#e6e6e6',
      divider: '#eeeeee',
    },
    dark: {
      background: '#001219',
      surface: '#052f33',
      surfaceElevated: '#073f44',
      text: '#e9d8a6',
      textSecondary: '#a8a090',
      border: '#053f40',
      divider: '#064445',
    },
    branding: {
      logoContentId: null,
      faviconContentId: null,
      presetId: null,
    },
  };

  it('generates primary, secondary, and accent scales', () => {
    const result = generateThemePalette(mockConfig);
    expect(result.primary['500']).toBe('#005f73');
    expect(result.secondary['500']).toBe('#94d2bd');
    expect(result.accent['500']).toBe('#ee9b00');
  });

  it('generates all four semantic scales', () => {
    const result = generateThemePalette(mockConfig);
    expect(result.semantic.success['500']).toBe('#0a9396');
    expect(result.semantic.warning['500']).toBe('#ee9b00');
    expect(result.semantic.error['500']).toBe('#ae2012');
    expect(result.semantic.info['500']).toBe('#005f73');
  });

  it('uses defaults when semantic overrides are omitted', () => {
    const configWithoutSemantic: TenantThemeConfig = {
      ...mockConfig,
      semantic: undefined,
    };
    const result = generateThemePalette(configWithoutSemantic);
    expect(result.semantic.success['500']).toBe('#0a9396');
    expect(result.semantic.warning['500']).toBe('#ee9b00');
    expect(result.semantic.error['500']).toBe('#ae2012');
    expect(result.semantic.info['500']).toBe('#005f73');
  });

  it('each scale has all ten shades', () => {
    const result = generateThemePalette(mockConfig);
    const allScales = [
      result.primary,
      result.secondary,
      result.accent,
      result.semantic.success,
      result.semantic.warning,
      result.semantic.error,
      result.semantic.info,
    ];

    for (const scale of allScales) 
      for (const key of SHADE_KEYS)
        expect(scale[key as keyof typeof scale]).toBeDefined();
    
  });

  it('uses partial semantic overrides with defaults for missing fields', () => {
    const partialConfig: TenantThemeConfig = {
      ...mockConfig,
      semantic: { success: '#22c55e' },
    };
    const result = generateThemePalette(partialConfig);
    expect(result.semantic.success['500']).toBe('#22c55e');
    expect(result.semantic.warning['500']).toBe('#ee9b00');
  });
});
