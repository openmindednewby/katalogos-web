/**
 * Tests for isPremiumTheme utility.
 * Verifies that free-tier themes (light, dark) are correctly identified,
 * and premium themes (elegant, colorful, minimal) are gated.
 */
import { isPremiumTheme } from './ThemeSelector';

describe('isPremiumTheme', () => {
  it('returns false for the light theme', () => {
    expect(isPremiumTheme('light')).toBe(false);
  });

  it('returns false for the dark theme', () => {
    expect(isPremiumTheme('dark')).toBe(false);
  });

  it('returns true for the elegant theme', () => {
    expect(isPremiumTheme('elegant')).toBe(true);
  });

  it('returns true for the colorful theme', () => {
    expect(isPremiumTheme('colorful')).toBe(true);
  });

  it('returns true for the minimal theme', () => {
    expect(isPremiumTheme('minimal')).toBe(true);
  });

  it('returns true for unknown theme names', () => {
    expect(isPremiumTheme('custom')).toBe(true);
  });
});
