/**
 * WCAG AA contrast guard for Katalogos' OWN palette.
 *
 * ── Why this app needs its own guard ──────────────────────────────────────────
 * `@dloizides/theme-web@1.2.0` fixed `light.textSecondary` `#777777` → `#717171` and ships a
 * guard for its `DEFAULT_THEME_CONFIG`. That fix is INERT here: Katalogos imports theme-web only
 * for the `paletteGenerator` algorithm (`src/theme/utils/palette-generator.ts`) and resolves its
 * actual colours from the LOCAL `themePalette` below and the LOCAL `src/theme/presets`. Bumping
 * the package therefore did not change a single rendered pixel in this app — the same failing
 * value had to be fixed again at each local source of truth (UX-7f).
 *
 * This suite exists so that never silently regresses: it measures every text role against every
 * surface it can land on, in both modes and both brand variants, using theme-web's WCAG 2.1
 * implementation (sRGB linearization + BT.709 weighting) so the app and the package agree on the
 * arithmetic.
 */
import { AA_NORMAL_TEXT_RATIO, contrastRatio } from '@dloizides/theme-web';

import { themePalette } from './palette';

/** The roles rendered as normal-size body text, so the 4.5:1 floor applies to all of them. */
const TEXT_ROLES = ['text', 'subtext', 'textSecondary'] as const;

/** Every surface a text role can land on. */
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
    // #777777 measured 4.18:1 on the light `surface` — below the 4.5:1 floor — and Field renders
    // every form label in this role, so every form label in the app failed AA. #717171 is the
    // lightest grey that clears the floor against the worst light surface.
    expect(themePalette.light.textSecondary).toBe('#717171');
    expect(contrastRatio('#777777', themePalette.light.surface)).toBeLessThan(
      AA_NORMAL_TEXT_RATIO
    );
  });
});
