/**
 * Integration tests for buildButtonStyles across all 5 theme presets.
 *
 * Verifies that the style builder correctly uses palette values from each
 * preset rather than only the default theme. Tests logic only, no rendering.
 */
import { buildButtonStyles, DISABLED_OPACITY } from './Button.styles';
import ButtonSize from './ButtonSize';
import ButtonVariant from './ButtonVariant';
import ThemeMode from '../../../../shared/enums/ThemeMode';
import {
  DEFAULT_THEME_CONFIG,
  TAG_HEUER_THEME_CONFIG,
  OCEAN_THEME_CONFIG,
  FOREST_THEME_CONFIG,
  SUNSET_THEME_CONFIG,
  THEME_PRESETS,
} from '../../../../theme/presets';
import { resolveTheme } from '../../../../theme/utils/resolveTheme';

import type { ThemePreset } from '../../../../theme/presets';
import type { ResolvedTheme, TenantThemeConfig } from '../../../../theme/types';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function resolvePresetTheme(config: TenantThemeConfig, mode: ThemeMode): ResolvedTheme {
  return resolveTheme(config, mode);
}

const PRESET_CONFIGS: ReadonlyArray<{ name: string; config: TenantThemeConfig }> = [
  { name: 'default', config: DEFAULT_THEME_CONFIG },
  { name: 'tagHeuer', config: TAG_HEUER_THEME_CONFIG },
  { name: 'ocean', config: OCEAN_THEME_CONFIG },
  { name: 'forest', config: FOREST_THEME_CONFIG },
  { name: 'sunset', config: SUNSET_THEME_CONFIG },
];

const TEXT_ON_FILLED = '#ffffff';
const PRESET_COUNT = 5;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildButtonStyles across presets', () => {
  describe('primary variant uses each presets palette.primary[500]', () => {
    it.each(PRESET_CONFIGS)(
      '$name preset: primary background matches palette.primary[500]',
      ({ config }) => {
        const theme = resolvePresetTheme(config, ThemeMode.Light);
        const result = buildButtonStyles(theme, ButtonVariant.Primary, ButtonSize.Medium);
        expect(result.container.backgroundColor).toBe(theme.palette.primary['500']);
      },
    );
  });

  describe('danger variant uses each presets semantic.error[500]', () => {
    it.each(PRESET_CONFIGS)(
      '$name preset: danger background matches semantic.error[500]',
      ({ config }) => {
        const theme = resolvePresetTheme(config, ThemeMode.Light);
        const result = buildButtonStyles(theme, ButtonVariant.Danger, ButtonSize.Medium);
        expect(result.container.backgroundColor).toBe(theme.semantic.error['500']);
      },
    );
  });

  describe('secondary variant uses each presets surface and text colors', () => {
    it.each(PRESET_CONFIGS)(
      '$name preset: secondary background matches colors.surface',
      ({ config }) => {
        const theme = resolvePresetTheme(config, ThemeMode.Light);
        const result = buildButtonStyles(theme, ButtonVariant.Secondary, ButtonSize.Medium);
        expect(result.container.backgroundColor).toBe(theme.colors.surface);
        expect(result.text.color).toBe(theme.colors.text);
      },
    );
  });

  describe('outline variant uses each presets primary palette for border and text', () => {
    it.each(PRESET_CONFIGS)(
      '$name preset: outline border and text match palette.primary[500]',
      ({ config }) => {
        const theme = resolvePresetTheme(config, ThemeMode.Light);
        const result = buildButtonStyles(theme, ButtonVariant.Outline, ButtonSize.Medium);
        expect(result.container.borderColor).toBe(theme.palette.primary['500']);
        expect(result.text.color).toBe(theme.palette.primary['500']);
      },
    );
  });

  describe('ghost variant uses each presets primary palette for text', () => {
    it.each(PRESET_CONFIGS)(
      '$name preset: ghost text matches palette.primary[500]',
      ({ config }) => {
        const theme = resolvePresetTheme(config, ThemeMode.Light);
        const result = buildButtonStyles(theme, ButtonVariant.Ghost, ButtonSize.Medium);
        expect(result.text.color).toBe(theme.palette.primary['500']);
      },
    );
  });

  describe('presets produce distinct primary 500 values', () => {
    it('each preset has a unique primary palette 500 shade', () => {
      const primaryValues = PRESET_CONFIGS.map(({ config }) => {
        const theme = resolvePresetTheme(config, ThemeMode.Light);
        return theme.palette.primary['500'];
      });

      const unique = new Set(primaryValues);
      expect(unique.size).toBe(PRESET_COUNT);
    });
  });

  describe('dark mode uses dark colors for secondary variant', () => {
    it.each(PRESET_CONFIGS)(
      '$name preset: dark mode secondary uses dark surface and text',
      ({ config }) => {
        const theme = resolvePresetTheme(config, ThemeMode.Dark);
        const result = buildButtonStyles(theme, ButtonVariant.Secondary, ButtonSize.Medium);
        expect(result.container.backgroundColor).toBe(config.dark.surface);
        expect(result.text.color).toBe(config.dark.text);
      },
    );
  });

  describe('filled variants always use white text on all presets', () => {
    it.each(PRESET_CONFIGS)(
      '$name preset: primary variant text is white',
      ({ config }) => {
        const theme = resolvePresetTheme(config, ThemeMode.Light);
        const result = buildButtonStyles(theme, ButtonVariant.Primary, ButtonSize.Medium);
        expect(result.text.color).toBe(TEXT_ON_FILLED);
      },
    );

    it.each(PRESET_CONFIGS)(
      '$name preset: danger variant text is white',
      ({ config }) => {
        const theme = resolvePresetTheme(config, ThemeMode.Light);
        const result = buildButtonStyles(theme, ButtonVariant.Danger, ButtonSize.Medium);
        expect(result.text.color).toBe(TEXT_ON_FILLED);
      },
    );
  });

  describe('DISABLED_OPACITY is consistent across presets', () => {
    it('DISABLED_OPACITY is 0.5 regardless of preset', () => {
      expect(DISABLED_OPACITY).toBe(0.5);
    });
  });

  describe('THEME_PRESETS has all 5 entries', () => {
    it('contains exactly 5 presets', () => {
      expect(THEME_PRESETS).toHaveLength(PRESET_COUNT);
    });

    it('contains all expected preset IDs', () => {
      const ids = THEME_PRESETS.map((p: ThemePreset) => p.id);
      expect(ids).toContain('default');
      expect(ids).toContain('tagHeuer');
      expect(ids).toContain('ocean');
      expect(ids).toContain('forest');
      expect(ids).toContain('sunset');
    });
  });
});
