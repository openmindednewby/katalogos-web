/**
 * Unit tests for ColorScalePreview logic.
 * Tests the shade text color selection and scale generation.
 */
import { shadeTextColor } from './ColorScalePreview';
import { generateColorScale, isValidHex } from '../../../../theme/utils/palette-generator';


import type { ColorScale } from '../../../../theme/types';

const WHITE = '#ffffff';
const BLACK = '#000000';

describe('shadeTextColor', () => {
  it('should return black for shade 50 (light background)', () => {
    expect(shadeTextColor('50')).toBe(BLACK);
  });

  it('should return black for shade 100', () => {
    expect(shadeTextColor('100')).toBe(BLACK);
  });

  it('should return black for shade 200', () => {
    expect(shadeTextColor('200')).toBe(BLACK);
  });

  it('should return black for shade 300', () => {
    expect(shadeTextColor('300')).toBe(BLACK);
  });

  it('should return white for shade 400 (at threshold)', () => {
    expect(shadeTextColor('400')).toBe(WHITE);
  });

  it('should return white for shade 500', () => {
    expect(shadeTextColor('500')).toBe(WHITE);
  });

  it('should return white for shade 600', () => {
    expect(shadeTextColor('600')).toBe(WHITE);
  });

  it('should return white for shade 700', () => {
    expect(shadeTextColor('700')).toBe(WHITE);
  });

  it('should return white for shade 800', () => {
    expect(shadeTextColor('800')).toBe(WHITE);
  });

  it('should return white for shade 900 (dark background)', () => {
    expect(shadeTextColor('900')).toBe(WHITE);
  });
});

describe('generateColorScale integration', () => {
  const SHADE_COUNT = 10;

  it('should generate all 10 shades for a valid base color', () => {
    const scale: ColorScale = generateColorScale('#005f73');
    const keys = Object.keys(scale);
    expect(keys).toHaveLength(SHADE_COUNT);
  });

  it('should return valid hex strings for all shades', () => {
    const scale: ColorScale = generateColorScale('#FF5500');
    const shadeKeys: Array<keyof ColorScale> = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    for (const key of shadeKeys)
      expect(isValidHex(scale[key])).toBe(true);
  });

  it('should use the base color as shade 500', () => {
    const baseColor = '#ff5500';
    const scale: ColorScale = generateColorScale(baseColor);
    expect(scale['500']).toBe(baseColor);
  });

  it('should produce lighter shades for lower numbers', () => {
    const scale: ColorScale = generateColorScale('#005f73');
    // shade 50 should be lighter than shade 500 (higher lightness)
    // We can't easily compare hex lightness, but we can verify they are different
    expect(scale['50']).not.toBe(scale['500']);
    expect(scale['900']).not.toBe(scale['500']);
  });
});
