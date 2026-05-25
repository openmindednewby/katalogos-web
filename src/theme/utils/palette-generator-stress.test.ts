/**
 * Stress tests for palette-generator: color scale generation,
 * hex/HSL conversions, lighten/darken, and edge-case inputs.
 */
import {
  generateColorScale,
  hexToHsl,
  hslToHex,
  isValidHex,
  lighten,
  darken,
} from './palette-generator';

// -- Constants ----------------------------------------------------------------

const SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
const HEX_PATTERN = /^#[0-9a-f]{6}$/;
const RANDOM_SAMPLE_SIZE = 120;
const ROUND_TRIP_SAMPLE_SIZE = 200;
const PERFORMANCE_SAMPLE_SIZE = 1000;
const PERFORMANCE_BUDGET_MS = 2000;
const MAX_CHANNEL_DIFF = 2;
const HEX_BASE = 16;
const RGB_MAX = 255;
const FULL_CIRCLE = 360;

// -- Helpers ------------------------------------------------------------------

/** Seed-free pseudo-random hex generator for deterministic-ish stress input. */
function randomHex(): string {
  const r = Math.floor(Math.random() * (RGB_MAX + 1));
  const g = Math.floor(Math.random() * (RGB_MAX + 1));
  const b = Math.floor(Math.random() * (RGB_MAX + 1));
  const toHex = (n: number): string => n.toString(HEX_BASE).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Parse hex to [r,g,b] channels (0-255). */
function parseChannels(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), HEX_BASE),
    parseInt(clean.slice(2, 4), HEX_BASE),
    parseInt(clean.slice(4, 6), HEX_BASE),
  ];
}

/** Relative luminance approximation via weighted RGB. */
function luminance(hex: string): number {
  const [r, g, b] = parseChannels(hex);
  const WEIGHT_R = 0.299;
  const WEIGHT_G = 0.587;
  const WEIGHT_B = 0.114;
  return WEIGHT_R * r + WEIGHT_G * g + WEIGHT_B * b;
}

// -- Palette generator: random color stress -----------------------------------

describe('palette generator stress', () => {
  describe('random color scale generation', () => {
    const randomColors = Array.from({ length: RANDOM_SAMPLE_SIZE }, randomHex);

    it(`generates valid scales for ${RANDOM_SAMPLE_SIZE} random colors`, () => {
      for (const color of randomColors) {
        const scale = generateColorScale(color);
        for (const key of SHADE_KEYS) {
          const shade = scale[key];
          expect(shade).toMatch(HEX_PATTERN);
        }
      }
    });

    it('shade 50 is always lighter than shade 900 for random colors', () => {
      for (const color of randomColors) {
        const scale = generateColorScale(color);
        expect(luminance(scale['50'])).toBeGreaterThanOrEqual(luminance(scale['900']));
      }
    });

    it('shades are monotonically non-increasing in luminance for random colors', () => {
      for (const color of randomColors) {
        const scale = generateColorScale(color);
        for (let i = 0; i < SHADE_KEYS.length - 1; i++) {
          const current = luminance(scale[SHADE_KEYS[i]]);
          const next = luminance(scale[SHADE_KEYS[i + 1]]);
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });
  });

  describe('edge color inputs', () => {
    const edgeColors = [
      '#ffffff', '#000000',
      '#ff0000', '#00ff00', '#0000ff',
      '#000001', '#fffffe', '#808080',
      '#010101', '#fefefe',
      '#ff00ff', '#00ffff', '#ffff00',
    ];

    it.each(edgeColors)('generates valid scale for %s', (color) => {
      const scale = generateColorScale(color);
      for (const key of SHADE_KEYS)
        expect(scale[key]).toMatch(HEX_PATTERN);
    });

    it('pure white produces all-valid hex shades', () => {
      const scale = generateColorScale('#ffffff');
      expect(scale['500']).toBe('#ffffff');
      for (const key of SHADE_KEYS)
        expect(isValidHex(scale[key])).toBe(true);
    });

    it('pure black produces all-valid hex shades', () => {
      const scale = generateColorScale('#000000');
      expect(scale['500']).toBe('#000000');
      for (const key of SHADE_KEYS)
        expect(isValidHex(scale[key])).toBe(true);
    });

    it('mid-gray shade 500 equals #808080', () => {
      const scale = generateColorScale('#808080');
      expect(scale['500']).toBe('#808080');
    });
  });

  describe('performance', () => {
    it(`generates ${PERFORMANCE_SAMPLE_SIZE} scales within ${PERFORMANCE_BUDGET_MS}ms`, () => {
      const colors = Array.from({ length: PERFORMANCE_SAMPLE_SIZE }, randomHex);
      const start = performance.now();
      for (const color of colors) generateColorScale(color);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(PERFORMANCE_BUDGET_MS);
    });
  });
});

// -- Color conversion round-trip stress ---------------------------------------

describe('hex <-> HSL round-trip stress', () => {
  const randomColors = Array.from({ length: ROUND_TRIP_SAMPLE_SIZE }, randomHex);

  it(`round-trips ${ROUND_TRIP_SAMPLE_SIZE} random colors within +/-${MAX_CHANNEL_DIFF} per channel`, () => {
    for (const hex of randomColors) {
      const hsl = hexToHsl(hex);
      const result = hslToHex(hsl.h, hsl.s, hsl.l);
      const [oR, oG, oB] = parseChannels(hex);
      const [rR, rG, rB] = parseChannels(result);

      expect(Math.abs(oR - rR)).toBeLessThanOrEqual(MAX_CHANNEL_DIFF);
      expect(Math.abs(oG - rG)).toBeLessThanOrEqual(MAX_CHANNEL_DIFF);
      expect(Math.abs(oB - rB)).toBeLessThanOrEqual(MAX_CHANNEL_DIFF);
    }
  });

  describe('edge HSL values', () => {
    const edgeCases: Array<{ h: number; s: number; l: number; label: string }> = [
      { h: 0, s: 0, l: 0, label: 'black (h=0,s=0,l=0)' },
      { h: 0, s: 0, l: 1, label: 'white (h=0,s=0,l=1)' },
      { h: 0, s: 1, l: 0.5, label: 'pure red (h=0,s=1,l=0.5)' },
      { h: FULL_CIRCLE, s: 1, l: 0.5, label: 'h=360 wraps to red' },
      { h: 0, s: 0, l: 0.5, label: 'gray (s=0)' },
      { h: 180, s: 1, l: 0, label: 'full-sat black (l=0)' },
      { h: 180, s: 1, l: 1, label: 'full-sat white (l=1)' },
    ];

    it.each(edgeCases)('produces valid hex for $label', ({ h, s, l }) => {
      const hex = hslToHex(h, s, l);
      expect(hex).toMatch(HEX_PATTERN);
    });
  });
});

// -- Lighten / darken round-trip stress ---------------------------------------

describe('lighten/darken stress', () => {
  const AMOUNT = 0.3;
  const sampleColors = Array.from({ length: 50 }, randomHex);

  it('lighten always increases luminance (or stays same for white)', () => {
    for (const hex of sampleColors) {
      const lightened = lighten(hex, AMOUNT);
      expect(luminance(lightened)).toBeGreaterThanOrEqual(luminance(hex) - 1);
    }
  });

  it('darken always decreases luminance (or stays same for black)', () => {
    for (const hex of sampleColors) {
      const darkened = darken(hex, AMOUNT);
      expect(luminance(darkened)).toBeLessThanOrEqual(luminance(hex) + 1);
    }
  });

  it('lighten always produces valid hex', () => {
    for (const hex of sampleColors)
      expect(lighten(hex, AMOUNT)).toMatch(HEX_PATTERN);
  });

  it('darken always produces valid hex', () => {
    for (const hex of sampleColors)
      expect(darken(hex, AMOUNT)).toMatch(HEX_PATTERN);
  });

  it('lighten by 0 preserves color', () => {
    for (const hex of sampleColors) {
      const [oR, oG, oB] = parseChannels(hex);
      const [rR, rG, rB] = parseChannels(lighten(hex, 0));
      expect(Math.abs(oR - rR) + Math.abs(oG - rG) + Math.abs(oB - rB)).toBeLessThanOrEqual(MAX_CHANNEL_DIFF);
    }
  });

  it('darken by 0 preserves color', () => {
    for (const hex of sampleColors) {
      const [oR, oG, oB] = parseChannels(hex);
      const [rR, rG, rB] = parseChannels(darken(hex, 0));
      expect(Math.abs(oR - rR) + Math.abs(oG - rG) + Math.abs(oB - rB)).toBeLessThanOrEqual(MAX_CHANNEL_DIFF);
    }
  });

  it('lighten by 1 produces near-white', () => {
    const NEAR_WHITE_THRESHOLD = 250;
    for (const hex of sampleColors) {
      const [r, g, b] = parseChannels(lighten(hex, 1));
      expect(r).toBeGreaterThanOrEqual(NEAR_WHITE_THRESHOLD);
      expect(g).toBeGreaterThanOrEqual(NEAR_WHITE_THRESHOLD);
      expect(b).toBeGreaterThanOrEqual(NEAR_WHITE_THRESHOLD);
    }
  });

  it('darken by 1 produces near-black', () => {
    const NEAR_BLACK_THRESHOLD = 5;
    for (const hex of sampleColors) {
      const [r, g, b] = parseChannels(darken(hex, 1));
      expect(r).toBeLessThanOrEqual(NEAR_BLACK_THRESHOLD);
      expect(g).toBeLessThanOrEqual(NEAR_BLACK_THRESHOLD);
      expect(b).toBeLessThanOrEqual(NEAR_BLACK_THRESHOLD);
    }
  });
});

// -- isValidHex edge cases ----------------------------------------------------

describe('isValidHex edge cases', () => {
  it('rejects empty string', () => expect(isValidHex('')).toBe(false));
  it('rejects hash-only', () => expect(isValidHex('#')).toBe(false));
  it('rejects 4-char hex', () => expect(isValidHex('#1234')).toBe(false));
  it('rejects 5-char hex', () => expect(isValidHex('#12345')).toBe(false));
  it('rejects 8-char hex (with alpha)', () => expect(isValidHex('#12345678')).toBe(false));
  it('rejects spaces', () => expect(isValidHex('# ff00ff')).toBe(false));
  it('rejects rgb() notation', () => expect(isValidHex('rgb(255,0,0)')).toBe(false));
  it('rejects hsl() notation', () => expect(isValidHex('hsl(0,100%,50%)')).toBe(false));
  it('accepts lowercase 6-char', () => expect(isValidHex('#abcdef')).toBe(true));
  it('accepts uppercase 6-char', () => expect(isValidHex('#ABCDEF')).toBe(true));
  it('accepts mixed case 6-char', () => expect(isValidHex('#aBcDeF')).toBe(true));
  it('accepts 3-char shorthand', () => expect(isValidHex('#abc')).toBe(true));
});
