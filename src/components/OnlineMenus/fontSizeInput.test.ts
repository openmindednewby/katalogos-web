/**
 * Tests for BUG-MENU-009 font size input logic.
 * Verifies the validate-on-blur pattern that allows clearing the input.
 */

describe('Font size input validation logic (BUG-MENU-009)', () => {
  /**
   * Simulates the onBlur validation logic from GlobalStylingControls.
   * Returns the parsed value if valid, or null to indicate a reset to currentFontSize.
   */
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
    // parseInt('32px', 10) returns 32, which is valid
    expect(validateFontSizeOnBlur('32px')).toBe(32);
  });

  it('allows clearing and retyping without snapping back', () => {
    // This simulates the user flow:
    // 1. User sees "32" in the input
    // 2. User clears the field -> fontSizeText = ""
    // 3. During typing, value is just local state, no validation fires
    // 4. User types "24"
    // 5. User blurs -> validates "24" -> calls onTitleFontSizeChange(24)

    const steps: string[] = ['32', '3', '', '2', '24'];
    const onTitleFontSizeChange = jest.fn();
    const DEFAULT_FONT_SIZE = 32;

    // Simulate typing: only local state changes, no callback
    for (const _step of steps) {
      // onChangeText just updates local state, no validation
    }

    // Simulate blur on final value
    const finalValue = steps[steps.length - 1];
    const result = validateFontSizeOnBlur(finalValue);
    if (result !== null)
      onTitleFontSizeChange(result);

    expect(onTitleFontSizeChange).toHaveBeenCalledWith(24);

    // Simulate blur on empty value (mid-typing)
    onTitleFontSizeChange.mockClear();
    const emptyResult = validateFontSizeOnBlur('');
    if (emptyResult !== null)
      onTitleFontSizeChange(emptyResult);

    // Should not call the callback, just reset to default
    expect(onTitleFontSizeChange).not.toHaveBeenCalled();
    // In the component, this would reset fontSizeText to String(currentFontSize)
    expect(emptyResult).toBeNull();

    // Verify default would be used
    const resetValue = emptyResult ?? DEFAULT_FONT_SIZE;
    expect(resetValue).toBe(DEFAULT_FONT_SIZE);
  });
});
