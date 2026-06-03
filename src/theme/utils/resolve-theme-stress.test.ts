/**
 * Stress tests for theme resolution and preset validation.
 * Verifies resolveTheme produces valid output for all configs and modes,
 * and that all 5 presets are structurally sound.
 */
import {
  THEME_PRESETS,
  DEFAULT_THEME_CONFIG,
  TAG_HEUER_THEME_CONFIG,
  OCEAN_THEME_CONFIG,
  FOREST_THEME_CONFIG,
  SUNSET_THEME_CONFIG,
} from '../presets';
import { generateColorScale, generateThemePalette, isValidHex } from './palette-generator';
import { resolveTheme } from './resolveTheme';
import ThemeMode from '../../shared/enums/ThemeMode';

import type { TenantThemeConfig, ThemeModeColors, ResolvedTheme } from '../types';

// -- Constants ----------------------------------------------------------------

const SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
const HEX_PATTERN = /^#[0-9a-f]{6}$/i;
const MODE_SWITCH_ITERATIONS = 100;
const EXPECTED_PRESET_COUNT = 5;
const LIGHT_MODE = ThemeMode.Light;
const DARK_MODE = ThemeMode.Dark;

const THEME_MODE_COLOR_KEYS: ReadonlyArray<keyof ThemeModeColors> = [
  'background', 'surface', 'surfaceElevated',
  'text', 'textSecondary', 'border', 'divider',
];

// -- Helpers ------------------------------------------------------------------

function makeModeColors(base: string): ThemeModeColors {
  return {
    background: base,
    surface: base,
    surfaceElevated: base,
    text: base,
    textSecondary: base,
    border: base,
    divider: base,
  };
}

function makeMinimalConfig(): TenantThemeConfig {
  return {
    primary: '#336699',
    secondary: '#669933',
    accent: '#993366',
    light: makeModeColors('#ffffff'),
    dark: makeModeColors('#111111'),
    branding: { logoContentId: null, faviconContentId: null, presetId: null },
  };
}

function makeFullConfig(): TenantThemeConfig {
  return {
    primary: '#1a73e8',
    secondary: '#34a853',
    accent: '#fbbc04',
    semantic: {
      success: '#0f9d58',
      warning: '#f9ab00',
      error: '#ea4335',
      info: '#4285f4',
    },
    light: makeModeColors('#fafafa'),
    dark: makeModeColors('#1e1e1e'),
    typography: { fontFamily: 'Roboto', headingScale: 1.2 },
    branding: { logoContentId: 'logo-id', faviconContentId: 'fav-id', presetId: 'custom' },
  };
}

function assertValidResolvedTheme(theme: ResolvedTheme): void {
  for (const key of THEME_MODE_COLOR_KEYS)
    expect(theme.colors[key]).toBeDefined();

  for (const scaleKey of ['primary', 'secondary', 'accent'] as const)
    for (const shade of SHADE_KEYS)
      expect(theme.palette[scaleKey][shade]).toMatch(HEX_PATTERN);

  for (const semKey of ['success', 'warning', 'error', 'info'] as const)
    for (const shade of SHADE_KEYS)
      expect(theme.semantic[semKey][shade]).toMatch(HEX_PATTERN);

  expect(theme.typography.fontFamily).toBeTruthy();
  expect(typeof theme.typography.headingScale).toBe('number');
}

// -- Theme resolution stress --------------------------------------------------

describe('resolveTheme stress', () => {
  describe('minimal config (only required fields)', () => {
    it('resolves light mode without errors', () => {
      const theme = resolveTheme(makeMinimalConfig(), LIGHT_MODE);
      assertValidResolvedTheme(theme);
      expect(theme.mode).toBe(LIGHT_MODE);
    });

    it('resolves dark mode without errors', () => {
      const theme = resolveTheme(makeMinimalConfig(), DARK_MODE);
      assertValidResolvedTheme(theme);
      expect(theme.mode).toBe(DARK_MODE);
    });

    it('falls back to default typography when omitted', () => {
      const theme = resolveTheme(makeMinimalConfig(), LIGHT_MODE);
      expect(theme.typography.fontFamily).toBe('System');
      expect(theme.typography.headingScale).toBe(1.0);
    });

    it('generates semantic scales from defaults when omitted', () => {
      const theme = resolveTheme(makeMinimalConfig(), LIGHT_MODE);
      expect(theme.semantic.success['500']).toMatch(HEX_PATTERN);
      expect(theme.semantic.warning['500']).toMatch(HEX_PATTERN);
      expect(theme.semantic.error['500']).toMatch(HEX_PATTERN);
      expect(theme.semantic.info['500']).toMatch(HEX_PATTERN);
    });
  });

  describe('full config (all optional fields populated)', () => {
    it('resolves with custom typography', () => {
      const theme = resolveTheme(makeFullConfig(), LIGHT_MODE);
      expect(theme.typography.fontFamily).toBe('Roboto');
      expect(theme.typography.headingScale).toBe(1.2);
    });

    it('resolves branding URLs from config', () => {
      const theme = resolveTheme(makeFullConfig(), LIGHT_MODE);
      expect(theme.branding.logoUrl).toBe('logo-id');
      expect(theme.branding.faviconUrl).toBe('fav-id');
    });

    it('uses custom semantic colors', () => {
      const theme = resolveTheme(makeFullConfig(), LIGHT_MODE);
      expect(theme.semantic.success['500']).toBe('#0f9d58');
      expect(theme.semantic.error['500']).toBe('#ea4335');
    });
  });

  describe('null config fallback', () => {
    it('falls back to DEFAULT_THEME_CONFIG when config is null', () => {
      const theme = resolveTheme(null, LIGHT_MODE);
      assertValidResolvedTheme(theme);
      expect(theme.colors).toEqual(DEFAULT_THEME_CONFIG.light);
    });
  });

  describe('rapid mode switching', () => {
    it(`switches between light/dark ${MODE_SWITCH_ITERATIONS} times without error`, () => {
      const config = makeFullConfig();
      for (let i = 0; i < MODE_SWITCH_ITERATIONS; i++) {
        const mode = i % 2 === 0 ? LIGHT_MODE : DARK_MODE;
        const theme = resolveTheme(config, mode);
        expect(theme.mode).toBe(mode);
        assertValidResolvedTheme(theme);
      }
    });
  });

  describe('empty-string color overrides in optional semantic', () => {
    it('handles config with empty semantic object gracefully', () => {
      const config: TenantThemeConfig = {
        ...makeMinimalConfig(),
        semantic: {},
      };
      const theme = resolveTheme(config, LIGHT_MODE);
      assertValidResolvedTheme(theme);
    });
  });
});

// -- Preset validation stress -------------------------------------------------

describe('preset validation stress', () => {
  it(`has exactly ${EXPECTED_PRESET_COUNT} presets`, () => {
    expect(THEME_PRESETS).toHaveLength(EXPECTED_PRESET_COUNT);
  });

  describe('all presets produce valid resolved themes', () => {
    for (const preset of THEME_PRESETS) {
      it(`preset "${preset.name}" resolves in light mode`, () => {
        const theme = resolveTheme(preset.config, LIGHT_MODE);
        assertValidResolvedTheme(theme);
      });

      it(`preset "${preset.name}" resolves in dark mode`, () => {
        const theme = resolveTheme(preset.config, DARK_MODE);
        assertValidResolvedTheme(theme);
      });
    }
  });

  describe('all presets have valid hex in required fields', () => {
    const allConfigs: Array<{ name: string; config: TenantThemeConfig }> = [
      { name: 'default', config: DEFAULT_THEME_CONFIG },
      { name: 'tagHeuer', config: TAG_HEUER_THEME_CONFIG },
      { name: 'ocean', config: OCEAN_THEME_CONFIG },
      { name: 'forest', config: FOREST_THEME_CONFIG },
      { name: 'sunset', config: SUNSET_THEME_CONFIG },
    ];

    for (const { name, config } of allConfigs) {
      it(`${name}: primary/secondary/accent are valid hex`, () => {
        expect(isValidHex(config.primary)).toBe(true);
        expect(isValidHex(config.secondary)).toBe(true);
        expect(isValidHex(config.accent)).toBe(true);
      });

      it(`${name}: all light mode colors are valid hex`, () => {
        for (const key of THEME_MODE_COLOR_KEYS)
          expect(isValidHex(config.light[key])).toBe(true);
      });

      it(`${name}: all dark mode colors are valid hex`, () => {
        for (const key of THEME_MODE_COLOR_KEYS)
          expect(isValidHex(config.dark[key])).toBe(true);
      });

      it(`${name}: semantic overrides (if present) are valid hex`, () => {
        if (!config.semantic) return;
        const { success, warning, error, info } = config.semantic;
        if (success !== undefined) expect(isValidHex(success)).toBe(true);
        if (warning !== undefined) expect(isValidHex(warning)).toBe(true);
        if (error !== undefined) expect(isValidHex(error)).toBe(true);
        if (info !== undefined) expect(isValidHex(info)).toBe(true);
      });
    }
  });

  describe('default preset cross-check with palette.ts defaults', () => {
    it('default preset primary matches palette.ts basePalette light.primary', () => {
      expect(DEFAULT_THEME_CONFIG.primary).toBe('#005f73');
    });

    it('default preset secondary matches palette.ts basePalette light.secondary', () => {
      expect(DEFAULT_THEME_CONFIG.secondary).toBe('#94d2bd');
    });

    it('default preset generates same scale as direct generateColorScale', () => {
      const fromPreset = generateThemePalette(DEFAULT_THEME_CONFIG);
      const directPrimary = generateColorScale('#005f73');
      for (const key of SHADE_KEYS)
        expect(fromPreset.primary[key]).toBe(directPrimary[key]);
    });
  });

  describe('all presets have unique ids', () => {
    it('no duplicate preset ids', () => {
      const ids = THEME_PRESETS.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
