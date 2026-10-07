import { AA_NORMAL_TEXT_RATIO, contrastRatio } from '@dloizides/theme-web';

import { themePalette } from './palette';

const TEXT_ROLES = ['text', 'subtext', 'textSecondary'] as const;

const SURFACE_ROLES = ['background', 'surface'] as const;

const MODES = ['light', 'dark'] as const;

describe('themePalette WCAG AA contrast', () => {
  describe.each(MODES)('%s mode', (mode) => {
    const palette = themePalette[mode];

    it.each(
      TEXT_ROLES.flatMap((role) => SURFACE_ROLES.map((surface) => [role, surface] as const))
    )('"%s" on "%s" meets the AA normal-text floor', (role, surface) => {
      const ratio = contrastRatio(palette[role], palette[surface]);

      expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_RATIO);
    });
  });

  it('pins the textSecondary regression that motivated this guard', () => {
    expect(themePalette.light.textSecondary).toBe('#717171');
    expect(contrastRatio('#777777', themePalette.light.surface)).toBeLessThan(
      AA_NORMAL_TEXT_RATIO
    );
  });
});
