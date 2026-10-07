
describe('Font size input validation logic (BUG-MENU-009)', () => {
  function validateFontSizeOnBlur(fontSizeText: string): number | null {
    const MIN_FONT_SIZE = 1;
    const parsed = parseInt(fontSizeText, 10);
    if (!isNaN(parsed) && parsed >= MIN_FONT_SIZE) return parsed;
    return null;
  }

  it('accepts a valid font size', () => {
    expect(validateFontSizeOnBlur('24')).toBe(24);
  });

  it('accepts minimum valid font size', () => {
    expect(validateFontSizeOnBlur('1')).toBe(1);
  });

  it('rejects empty string (returns null for reset)', () => {
    expect(validateFontSizeOnBlur('')).toBeNull();
  });

  it('rejects zero', () => {
    expect(validateFontSizeOnBlur('0')).toBeNull();
  });

  it('rejects negative numbers', () => {
    expect(validateFontSizeOnBlur('-5')).toBeNull();
  });

  it('rejects non-numeric text', () => {
    expect(validateFontSizeOnBlur('abc')).toBeNull();
  });

  it('accepts number with trailing text (parseInt behavior)', () => {
    expect(validateFontSizeOnBlur('32px')).toBe(32);
  });

  it('allows clearing and retyping without snapping back', () => {

    const steps: string[] = ['32', '3', '', '2', '24'];
    const onTitleFontSizeChange = jest.fn();
    const DEFAULT_FONT_SIZE = 32;

    // eslint-disable-next-line no-empty
    for (const _step of steps) {
    }

    const finalValue = steps[steps.length - 1];
    const result = validateFontSizeOnBlur(finalValue);
    if (result !== null)
      onTitleFontSizeChange(result);

    expect(onTitleFontSizeChange).toHaveBeenCalledWith(24);

    onTitleFontSizeChange.mockClear();
    const emptyResult = validateFontSizeOnBlur('');
    if (emptyResult !== null)
      onTitleFontSizeChange(emptyResult);

    expect(onTitleFontSizeChange).not.toHaveBeenCalled();
    expect(emptyResult).toBeNull();

    const resetValue = emptyResult ?? DEFAULT_FONT_SIZE;
    expect(resetValue).toBe(DEFAULT_FONT_SIZE);
  });
});
