/**
 * Unit tests for hexToRgba utility.
 */
import { hexToRgba } from './hexToRgba';

describe('hexToRgba', () => {
  it('converts a hex color to rgba with given alpha', () => {
    expect(hexToRgba('#4CAF50', 0.15)).toBe('rgba(76, 175, 80, 0.15)');
  });

  it('converts black to rgba', () => {
    expect(hexToRgba('#000000', 1)).toBe('rgba(0, 0, 0, 1)');
  });

  it('converts white to rgba', () => {
    expect(hexToRgba('#FFFFFF', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('handles zero alpha', () => {
    expect(hexToRgba('#FF0000', 0)).toBe('rgba(255, 0, 0, 0)');
  });

  it('converts red hex to rgba', () => {
    expect(hexToRgba('#F44336', 0.2)).toBe('rgba(244, 67, 54, 0.2)');
  });
});
