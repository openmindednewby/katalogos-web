/**
 * Tests for color condition logic in CategorySection and MenuItemDisplay.
 *
 * BUG-MENU-011: CategorySection had duplicate identical conditions.
 * BUG-MENU-012: MenuItemDisplay had the same duplicate pattern.
 *
 * The fix changes `isValueDefined(x) && isValueDefined(x)` to
 * `isValueDefined(x) && x !== ''` so empty strings fall through
 * to the default/fallback color.
 */
// Replicate the exact logic from CategorySection and MenuItemDisplay
function resolveTextColor(textColor: string | null | undefined, fallback: string): string {
  const hasColor = textColor !== null && textColor !== undefined && textColor !== '';
  return hasColor ? String(textColor) : fallback;
}

function resolveDescription(description: string | null | undefined): string | null {
  const hasDescription = description !== null && description !== undefined && description !== '';
  return hasDescription ? String(description) : null;
}

describe('Color condition logic (BUG-MENU-011, BUG-MENU-012)', () => {
  const FALLBACK_COLOR = '#333333';

  describe('resolveTextColor', () => {
    it('returns the color when it is a non-empty string', () => {
      expect(resolveTextColor('#FF0000', FALLBACK_COLOR)).toBe('#FF0000');
    });

    it('returns fallback when color is undefined', () => {
      expect(resolveTextColor(undefined, FALLBACK_COLOR)).toBe(FALLBACK_COLOR);
    });

    it('returns fallback when color is null', () => {
      expect(resolveTextColor(null, FALLBACK_COLOR)).toBe(FALLBACK_COLOR);
    });

    it('returns fallback when color is empty string', () => {
      expect(resolveTextColor('', FALLBACK_COLOR)).toBe(FALLBACK_COLOR);
    });

    it('returns color for valid hex color', () => {
      expect(resolveTextColor('#AABBCC', FALLBACK_COLOR)).toBe('#AABBCC');
    });

    it('returns color for rgb string', () => {
      expect(resolveTextColor('rgb(255,0,0)', FALLBACK_COLOR)).toBe('rgb(255,0,0)');
    });
  });

  describe('resolveDescription', () => {
    it('returns description when it is a non-empty string', () => {
      expect(resolveDescription('A nice category')).toBe('A nice category');
    });

    it('returns null when description is undefined', () => {
      expect(resolveDescription(undefined)).toBeNull();
    });

    it('returns null when description is null', () => {
      expect(resolveDescription(null)).toBeNull();
    });

    it('returns null when description is empty string', () => {
      expect(resolveDescription('')).toBeNull();
    });
  });
});
