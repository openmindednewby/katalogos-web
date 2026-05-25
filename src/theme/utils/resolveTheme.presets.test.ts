/**
 * Integration tests for resolveTheme across presets and modes.
 *
 * Verifies that resolveTheme produces correct ResolvedTheme for each
 * preset in both light and dark modes. Complements ThemeProvider.test.tsx
 * which tests the hook/context layer but not preset-specific palette values.
 */
import ThemeMode from '../../shared/enums/ThemeMode';
import {
  DEFAULT_THEME_CONFIG,
  TAG_HEUER_THEME_CONFIG,
  OCEAN_THEME_CONFIG,
  FOREST_THEME_CONFIG,
  SUNSET_THEME_CONFIG,
} from '../presets';
import { resolveTheme } from './resolveTheme';

import type { TenantThemeConfig } from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_PRESETS: ReadonlyArray<{ name: string; config: TenantThemeConfig }> = [
  { name: 'default', config: DEFAULT_THEME_CONFIG },
  { name: 'tagHeuer', config: TAG_HEUER_THEME_CONFIG },
  { name: 'ocean', config: OCEAN_THEME_CONFIG },
  { name: 'forest', config: FOREST_THEME_CONFIG },
  { name: 'sunset', config: SUNSET_THEME_CONFIG },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('resolveTheme - light mode with default preset', () => {
  const theme = resolveTheme(null, ThemeMode.Light);

  it('uses DEFAULT_THEME_CONFIG light mode colors', () => {
    expect(theme.colors).toEqual(DEFAULT_THEME_CONFIG.light);
  });

  it('sets mode to light', () => {
    expect(theme.mode).toBe(ThemeMode.Light);
  });

  it('generates palette from default primary color', () => {
    expect(theme.palette.primary['500']).toBe(DEFAULT_THEME_CONFIG.primary.toLowerCase());
  });

  it('generates palette from default secondary color', () => {
    expect(theme.palette.secondary['500']).toBe(DEFAULT_THEME_CONFIG.secondary.toLowerCase());
  });

  it('generates palette from default accent color', () => {
    expect(theme.palette.accent['500']).toBe(DEFAULT_THEME_CONFIG.accent.toLowerCase());
  });

  it('uses default typography when no overrides provided', () => {
    expect(theme.typography.fontFamily).toBe('System');
    expect(theme.typography.headingScale).toBe(1.0);
  });
});

describe('resolveTheme - dark mode with default preset', () => {
  const theme = resolveTheme(null, ThemeMode.Dark);

  it('uses DEFAULT_THEME_CONFIG dark mode colors', () => {
    expect(theme.colors).toEqual(DEFAULT_THEME_CONFIG.dark);
  });

  it('sets mode to dark', () => {
    expect(theme.mode).toBe(ThemeMode.Dark);
  });

  it('dark background differs from light background', () => {
    const lightTheme = resolveTheme(null, ThemeMode.Light);
    expect(theme.colors.background).not.toBe(lightTheme.colors.background);
  });

  it('palette is the same in both modes (palette is mode-independent)', () => {
    const lightTheme = resolveTheme(null, ThemeMode.Light);
    expect(theme.palette).toEqual(lightTheme.palette);
  });
});

describe('resolveTheme - each preset produces correct colors', () => {
  describe.each(ALL_PRESETS)('$name preset', ({ config }) => {
    it('light mode colors match config.light', () => {
      const theme = resolveTheme(config, ThemeMode.Light);
      expect(theme.colors).toEqual(config.light);
    });

    it('dark mode colors match config.dark', () => {
      const theme = resolveTheme(config, ThemeMode.Dark);
      expect(theme.colors).toEqual(config.dark);
    });

    it('palette primary 500 matches config.primary', () => {
      const theme = resolveTheme(config, ThemeMode.Light);
      expect(theme.palette.primary['500']).toBe(config.primary.toLowerCase());
    });

    it('palette secondary 500 matches config.secondary', () => {
      const theme = resolveTheme(config, ThemeMode.Light);
      expect(theme.palette.secondary['500']).toBe(config.secondary.toLowerCase());
    });

    it('palette accent 500 matches config.accent', () => {
      const theme = resolveTheme(config, ThemeMode.Light);
      expect(theme.palette.accent['500']).toBe(config.accent.toLowerCase());
    });

    it('branding uses config logoContentId and faviconContentId', () => {
      const theme = resolveTheme(config, ThemeMode.Light);
      expect(theme.branding.logoUrl).toBe(config.branding.logoContentId);
      expect(theme.branding.faviconUrl).toBe(config.branding.faviconContentId);
    });
  });
});

describe('resolveTheme - custom tenant config', () => {
  const customConfig: TenantThemeConfig = {
    primary: '#ff6600',
    secondary: '#3366cc',
    accent: '#cc33ff',
    light: {
      background: '#fafafa',
      surface: '#f0f0f0',
      surfaceElevated: '#ffffff',
      text: '#111111',
      textSecondary: '#666666',
      border: '#cccccc',
      divider: '#dddddd',
    },
    dark: {
      background: '#111111',
      surface: '#222222',
      surfaceElevated: '#333333',
      text: '#eeeeee',
      textSecondary: '#aaaaaa',
      border: '#444444',
      divider: '#555555',
    },
    typography: {
      fontFamily: 'Roboto',
      headingScale: 1.25,
    },
    branding: {
      logoContentId: 'logo-guid-123',
      faviconContentId: 'favicon-guid-456',
      presetId: null,
    },
  };

  it('returns different palette than default', () => {
    const defaultTheme = resolveTheme(null, ThemeMode.Light);
    const customTheme = resolveTheme(customConfig, ThemeMode.Light);
    expect(customTheme.palette.primary['500']).not.toBe(defaultTheme.palette.primary['500']);
  });

  it('uses custom typography', () => {
    const theme = resolveTheme(customConfig, ThemeMode.Light);
    expect(theme.typography.fontFamily).toBe('Roboto');
    expect(theme.typography.headingScale).toBe(1.25);
  });

  it('uses custom branding content IDs', () => {
    const theme = resolveTheme(customConfig, ThemeMode.Light);
    expect(theme.branding.logoUrl).toBe('logo-guid-123');
    expect(theme.branding.faviconUrl).toBe('favicon-guid-456');
  });

  it('uses custom light colors', () => {
    const theme = resolveTheme(customConfig, ThemeMode.Light);
    expect(theme.colors.background).toBe('#fafafa');
    expect(theme.colors.text).toBe('#111111');
  });

  it('uses custom dark colors', () => {
    const theme = resolveTheme(customConfig, ThemeMode.Dark);
    expect(theme.colors.background).toBe('#111111');
    expect(theme.colors.text).toBe('#eeeeee');
  });
});

describe('resolveTheme - setTenantConfig(null) reverts to default', () => {
  it('null config produces the same theme as DEFAULT_THEME_CONFIG', () => {
    const nullTheme = resolveTheme(null, ThemeMode.Light);
    const defaultTheme = resolveTheme(DEFAULT_THEME_CONFIG, ThemeMode.Light);
    expect(nullTheme).toEqual(defaultTheme);
  });

  it('null config in dark mode produces same as default dark', () => {
    const nullTheme = resolveTheme(null, ThemeMode.Dark);
    const defaultTheme = resolveTheme(DEFAULT_THEME_CONFIG, ThemeMode.Dark);
    expect(nullTheme).toEqual(defaultTheme);
  });
});

describe('resolveTheme - toggleMode produces correct mode', () => {
  it('light mode theme has mode set to light', () => {
    const theme = resolveTheme(null, ThemeMode.Light);
    expect(theme.mode).toBe(ThemeMode.Light);
  });

  it('dark mode theme has mode set to dark', () => {
    const theme = resolveTheme(null, ThemeMode.Dark);
    expect(theme.mode).toBe(ThemeMode.Dark);
  });

  it('switching from light to dark changes colors but not palette', () => {
    const lightTheme = resolveTheme(OCEAN_THEME_CONFIG, ThemeMode.Light);
    const darkTheme = resolveTheme(OCEAN_THEME_CONFIG, ThemeMode.Dark);

    expect(lightTheme.colors).not.toEqual(darkTheme.colors);
    expect(lightTheme.palette).toEqual(darkTheme.palette);
    expect(lightTheme.semantic).toEqual(darkTheme.semantic);
  });
});

describe('resolveTheme - semantic colors', () => {
  it('uses config semantic overrides when provided', () => {
    const configWithSemantic: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      semantic: {
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    };

    const theme = resolveTheme(configWithSemantic, ThemeMode.Light);
    expect(theme.semantic.success['500']).toBe('#22c55e');
    expect(theme.semantic.warning['500']).toBe('#f59e0b');
    expect(theme.semantic.error['500']).toBe('#ef4444');
    expect(theme.semantic.info['500']).toBe('#3b82f6');
  });

  it('defaults semantic when config has no semantic overrides', () => {
    const configWithoutSemantic: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      semantic: undefined,
    };

    const theme = resolveTheme(configWithoutSemantic, ThemeMode.Light);
    // Default semantic values from palette-generator
    expect(theme.semantic.success['500']).toBe('#0a9396');
    expect(theme.semantic.error['500']).toBe('#ae2012');
  });
});
