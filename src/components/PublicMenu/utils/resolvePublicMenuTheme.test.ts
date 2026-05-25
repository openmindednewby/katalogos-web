/**
 * Unit tests for resolvePublicMenuTheme.
 * Tests theme resolution priority: override > contents > legacy > default.
 */
import { DEFAULT_PUBLIC_MENU_THEME } from './publicMenuThemePresets';
import { findThemeById, resolvePublicMenuTheme } from './resolvePublicMenuTheme';

describe('findThemeById', () => {
  it('returns the preset when it exists', () => {
    const result = findThemeById('elegant');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('elegant');
  });

  it('returns null for an unknown ID', () => {
    expect(findThemeById('nonexistent')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(findThemeById('')).toBeNull();
  });
});

describe('resolvePublicMenuTheme', () => {
  it('returns the default theme when no inputs are provided', () => {
    const result = resolvePublicMenuTheme(undefined);
    expect(result.id).toBe(DEFAULT_PUBLIC_MENU_THEME.id);
  });

  it('returns the default theme for undefined menu contents', () => {
    const result = resolvePublicMenuTheme(undefined, undefined);
    expect(result.id).toBe(DEFAULT_PUBLIC_MENU_THEME.id);
  });

  it('uses the override theme ID when provided', () => {
    const result = resolvePublicMenuTheme(undefined, 'elegant');
    expect(result.id).toBe('elegant');
  });

  it('ignores invalid override theme IDs', () => {
    const result = resolvePublicMenuTheme(undefined, 'invalid-theme');
    expect(result.id).toBe(DEFAULT_PUBLIC_MENU_THEME.id);
  });

  it('ignores empty override theme ID', () => {
    const result = resolvePublicMenuTheme(undefined, '');
    expect(result.id).toBe(DEFAULT_PUBLIC_MENU_THEME.id);
  });

  it('uses themePresetId from menu contents', () => {
    const result = resolvePublicMenuTheme({ themePresetId: 'coastal' });
    expect(result.id).toBe('coastal');
  });

  it('prefers override theme ID over contents themePresetId', () => {
    const result = resolvePublicMenuTheme({ themePresetId: 'coastal' }, 'elegant');
    expect(result.id).toBe('elegant');
  });

  it('applies legacy color scheme overrides', () => {
    const contents = {
      colorScheme: { background: '#ff0000', text: '#00ff00' },
    };
    const result = resolvePublicMenuTheme(contents);
    expect(result.colors.background).toBe('#ff0000');
    expect(result.colors.text).toBe('#00ff00');
  });

  it('applies legacy backgroundColor and textColor overrides', () => {
    const contents = {
      backgroundColor: '#aabbcc',
      textColor: '#112233',
      colorScheme: { background: '#aabbcc' },
    };
    const result = resolvePublicMenuTheme(contents);
    expect(result.colors.background).toBe('#aabbcc');
    expect(result.colors.text).toBe('#112233');
  });

  it('preserves non-overridden colors from the default theme', () => {
    const contents = {
      colorScheme: { background: '#ff0000' },
    };
    const result = resolvePublicMenuTheme(contents);
    expect(result.colors.background).toBe('#ff0000');
    expect(result.colors.accent).toBe(DEFAULT_PUBLIC_MENU_THEME.colors.accent);
    expect(result.colors.surface).toBe(DEFAULT_PUBLIC_MENU_THEME.colors.surface);
  });

  it('returns all required theme properties', () => {
    const result = resolvePublicMenuTheme(undefined);
    expect(result.id).toBeDefined();
    expect(result.nameKey).toBeDefined();
    expect(result.descriptionKey).toBeDefined();
    expect(result.colors).toBeDefined();
    expect(result.typography).toBeDefined();
    expect(result.spacing).toBeDefined();
    expect(result.borders).toBeDefined();
  });
});
