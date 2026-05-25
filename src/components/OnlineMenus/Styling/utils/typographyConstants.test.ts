import {
  FONT_FAMILY_OPTIONS,
  GENERIC_FONT_COUNT,
  TOTAL_FONT_COUNT,
  getCssFontFamily,
  getFontFamilyLabel,
  hasExactFontMatch,
} from './typographyConstants';

// =============================================================================
// Test Suite
// =============================================================================

describe('typographyConstants', () => {
  // ---------------------------------------------------------------------------
  // Font Options Structure
  // ---------------------------------------------------------------------------

  describe('FONT_FAMILY_OPTIONS', () => {
    it('has the expected total number of fonts', () => {
      expect(FONT_FAMILY_OPTIONS).toHaveLength(TOTAL_FONT_COUNT);
    });

    it('has generic options at the top', () => {
      const genericLabels = FONT_FAMILY_OPTIONS.slice(0, GENERIC_FONT_COUNT).map((opt) => opt.label);
      expect(genericLabels).toEqual(['System', 'Serif', 'Sans-serif', 'Monospace']);
    });

    it('includes all expected Google Fonts after generic options', () => {
      const googleFontLabels = FONT_FAMILY_OPTIONS.slice(GENERIC_FONT_COUNT).map((opt) => opt.label);
      expect(googleFontLabels).toContain('Inter');
      expect(googleFontLabels).toContain('Roboto');
      expect(googleFontLabels).toContain('Open Sans');
      expect(googleFontLabels).toContain('Lato');
      expect(googleFontLabels).toContain('Montserrat');
      expect(googleFontLabels).toContain('Poppins');
      expect(googleFontLabels).toContain('Raleway');
      expect(googleFontLabels).toContain('Playfair Display');
      expect(googleFontLabels).toContain('Oswald');
      expect(googleFontLabels).toContain('Source Sans Pro');
      expect(googleFontLabels).toContain('Nunito');
      expect(googleFontLabels).toContain('PT Sans');
    });

    it('has cssValue for every option', () => {
      FONT_FAMILY_OPTIONS.forEach((opt) => {
        expect(opt.cssValue).toBeTruthy();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // getCssFontFamily
  // ---------------------------------------------------------------------------

  describe('getCssFontFamily', () => {
    it('returns System css value for undefined input', () => {
      const result = getCssFontFamily(undefined);
      expect(result).toBe(FONT_FAMILY_OPTIONS[0].cssValue);
    });

    it('returns matching cssValue for built-in font', () => {
      const result = getCssFontFamily('Roboto');
      expect(result).toBe("'Roboto', sans-serif");
    });

    it('returns raw value for custom font not in options', () => {
      const customFont = "'Lobster', cursive";
      const result = getCssFontFamily(customFont);
      expect(result).toBe(customFont);
    });

    it('returns System cssValue for generic System font', () => {
      const result = getCssFontFamily('System');
      expect(result).toBe('system-ui, -apple-system, sans-serif');
    });
  });

  // ---------------------------------------------------------------------------
  // getFontFamilyLabel
  // ---------------------------------------------------------------------------

  describe('getFontFamilyLabel', () => {
    it('returns System for undefined input', () => {
      expect(getFontFamilyLabel(undefined)).toBe('System');
    });

    it('returns label for built-in font', () => {
      expect(getFontFamilyLabel('Montserrat')).toBe('Montserrat');
    });

    it('returns raw value for custom font not in options', () => {
      expect(getFontFamilyLabel('Lobster')).toBe('Lobster');
    });

    it('returns label for generic font', () => {
      expect(getFontFamilyLabel('Sans-serif')).toBe('Sans-serif');
    });
  });

  // ---------------------------------------------------------------------------
  // hasExactFontMatch
  // ---------------------------------------------------------------------------

  describe('hasExactFontMatch', () => {
    it('returns true for exact match', () => {
      expect(hasExactFontMatch('System')).toBe(true);
    });

    it('returns true for case-insensitive exact match', () => {
      expect(hasExactFontMatch('system')).toBe(true);
      expect(hasExactFontMatch('ROBOTO')).toBe(true);
    });

    it('returns false for partial match', () => {
      expect(hasExactFontMatch('Sys')).toBe(false);
      expect(hasExactFontMatch('Rob')).toBe(false);
    });

    it('returns false for non-matching text', () => {
      expect(hasExactFontMatch('Lobster')).toBe(false);
      expect(hasExactFontMatch('Comic Sans')).toBe(false);
    });

    it('returns true for Google Font exact match', () => {
      expect(hasExactFontMatch('Open Sans')).toBe(true);
      expect(hasExactFontMatch('Playfair Display')).toBe(true);
    });
  });
});
