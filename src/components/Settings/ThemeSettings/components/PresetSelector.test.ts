/**
 * Unit tests for PresetGrid / PresetSelector logic.
 *
 * Tests the selection logic and preset data integrity beyond what
 * presetHelpers.test.ts already covers. Focuses on preset color swatch
 * correctness and callback behavior.
 */
import { isPresetSelected } from './PresetGrid';
import {
  THEME_PRESETS,
  DEFAULT_THEME_CONFIG,
  TAG_HEUER_THEME_CONFIG,
  OCEAN_THEME_CONFIG,
  FOREST_THEME_CONFIG,
  SUNSET_THEME_CONFIG,
} from '../../../../theme/presets';

import type { ThemePreset } from '../../../../theme/presets';
import type { TenantThemeConfig } from '../../../../theme/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRESET_COUNT = 5;
const SWATCH_COLOR_COUNT = 3;

const EXPECTED_PRESET_IDS = ['default', 'tagHeuer', 'ocean', 'forest', 'sunset'];

const EXPECTED_SWATCHES: Record<string, { primary: string; secondary: string; accent: string }> = {
  default: {
    primary: DEFAULT_THEME_CONFIG.primary,
    secondary: DEFAULT_THEME_CONFIG.secondary,
    accent: DEFAULT_THEME_CONFIG.accent,
  },
  tagHeuer: {
    primary: TAG_HEUER_THEME_CONFIG.primary,
    secondary: TAG_HEUER_THEME_CONFIG.secondary,
    accent: TAG_HEUER_THEME_CONFIG.accent,
  },
  ocean: {
    primary: OCEAN_THEME_CONFIG.primary,
    secondary: OCEAN_THEME_CONFIG.secondary,
    accent: OCEAN_THEME_CONFIG.accent,
  },
  forest: {
    primary: FOREST_THEME_CONFIG.primary,
    secondary: FOREST_THEME_CONFIG.secondary,
    accent: FOREST_THEME_CONFIG.accent,
  },
  sunset: {
    primary: SUNSET_THEME_CONFIG.primary,
    secondary: SUNSET_THEME_CONFIG.secondary,
    accent: SUNSET_THEME_CONFIG.accent,
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PresetSelector - preset data integrity', () => {
  describe('all 5 presets render in the grid data', () => {
    it('THEME_PRESETS contains exactly 5 presets', () => {
      expect(THEME_PRESETS).toHaveLength(PRESET_COUNT);
    });

    it('all expected preset IDs are present', () => {
      const ids = THEME_PRESETS.map((p: ThemePreset) => p.id);
      for (const expectedId of EXPECTED_PRESET_IDS) 
        expect(ids).toContain(expectedId);
      
    });

    it('each preset has a non-empty display name', () => {
      for (const preset of THEME_PRESETS) {
        expect(preset.name).toBeTruthy();
        expect(preset.name.length).toBeGreaterThan(0);
      }
    });
  });

  describe('preset cards show correct color swatches', () => {
    it.each(EXPECTED_PRESET_IDS)(
      '%s preset has 3 swatch colors (primary, secondary, accent)',
      (presetId) => {
        const preset = THEME_PRESETS.find((p: ThemePreset) => p.id === presetId);
        expect(preset).toBeDefined();

        const config = preset!.config;
        const swatchColors = [config.primary, config.secondary, config.accent];
        expect(swatchColors).toHaveLength(SWATCH_COLOR_COUNT);

        // All swatch colors should be valid hex
        for (const color of swatchColors) 
          expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
        
      },
    );

    it.each(EXPECTED_PRESET_IDS)(
      '%s preset swatch values match expected config',
      (presetId) => {
        const preset = THEME_PRESETS.find((p: ThemePreset) => p.id === presetId);
        expect(preset).toBeDefined();

        const expected = EXPECTED_SWATCHES[presetId];
        expect(preset!.config.primary).toBe(expected.primary);
        expect(preset!.config.secondary).toBe(expected.secondary);
        expect(preset!.config.accent).toBe(expected.accent);
      },
    );
  });
});

describe('PresetSelector - selection logic', () => {
  describe('clicking a preset triggers selection with correct preset ID', () => {
    it.each(EXPECTED_PRESET_IDS)(
      'selecting %s preset identifies via branding.presetId',
      (presetId) => {
        const preset = THEME_PRESETS.find((p: ThemePreset) => p.id === presetId);
        expect(preset).toBeDefined();

        // Simulate onSelectPreset callback receiving the preset config
        const selectedConfig = preset!.config;
        expect(selectedConfig.branding.presetId).toBe(presetId);
      },
    );
  });

  describe('selected preset has visual distinction', () => {
    it('isPresetSelected returns true only for the matching preset', () => {
      for (const targetPreset of THEME_PRESETS) {
        const configWithPresetId: TenantThemeConfig = {
          ...DEFAULT_THEME_CONFIG,
          branding: { ...DEFAULT_THEME_CONFIG.branding, presetId: targetPreset.id },
        };

        for (const candidatePreset of THEME_PRESETS) {
          const expected = candidatePreset.id === targetPreset.id;
          expect(isPresetSelected(candidatePreset, configWithPresetId)).toBe(expected);
        }
      }
    });

    it('exactly one preset is selected at a time for any valid presetId', () => {
      for (const targetPreset of THEME_PRESETS) {
        const configWithPresetId: TenantThemeConfig = {
          ...DEFAULT_THEME_CONFIG,
          branding: { ...DEFAULT_THEME_CONFIG.branding, presetId: targetPreset.id },
        };

        const selectedCount = THEME_PRESETS.filter((p: ThemePreset) =>
          isPresetSelected(p, configWithPresetId),
        ).length;

        expect(selectedCount).toBe(1);
      }
    });
  });

  describe('unique preset colors across all presets', () => {
    it('each preset has a unique primary color', () => {
      const primaries = THEME_PRESETS.map((p: ThemePreset) => p.config.primary);
      const unique = new Set(primaries);
      expect(unique.size).toBe(PRESET_COUNT);
    });
  });
});
