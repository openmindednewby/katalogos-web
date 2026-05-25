/**
 * Unit tests for ColorPicker validation logic.
 * Tests the hex validation function, not rendering.
 */
import { validateHex } from './ColorPicker';

describe('validateHex (isValidHex)', () => {
  it('should accept valid 6-digit hex with hash', () => {
    expect(validateHex('#FF5500')).toBe(true);
  });

  it('should accept valid 3-digit shorthand hex', () => {
    expect(validateHex('#F50')).toBe(true);
  });

  it('should accept lowercase hex', () => {
    expect(validateHex('#ff5500')).toBe(true);
  });

  it('should accept mixed-case hex', () => {
    expect(validateHex('#Ff5500')).toBe(true);
  });

  it('should reject hex without hash', () => {
    expect(validateHex('FF5500')).toBe(false);
  });

  it('should reject invalid characters', () => {
    expect(validateHex('#GGHHII')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(validateHex('')).toBe(false);
  });

  it('should reject 4-digit hex', () => {
    expect(validateHex('#FFFF')).toBe(false);
  });

  it('should reject 5-digit hex', () => {
    expect(validateHex('#FFFFF')).toBe(false);
  });

  it('should accept all-zero hex', () => {
    expect(validateHex('#000000')).toBe(true);
  });

  it('should accept all-F hex', () => {
    expect(validateHex('#FFFFFF')).toBe(true);
  });
});
