/**
 * WCAG AA guard over the BADGE / CHIP / PILL pairs katalogos actually renders,
 * measured against EVERY bundled preset.
 *
 * ── Why indexed by RENDER SITE, and why across all presets ───────────────────
 * Ported from `agora-web/src/theme/contrastPairs.test.ts`. Contrast is a property
 * of the PAIR, not of which token role each side came from — agora's earlier
 * role-indexed coverage asked "does each TEXT role clear its threshold against
 * each SURFACE?" and so never looked at a brand colour used as a button FILL,
 * which shipped at 4.36:1 across 45 call sites. Every entry below is a real place
 * in the running app where two colours meet.
 *
 * Katalogos adds a second axis the agora guard does not need: a tenant picks one of
 * five presets, so a pair is only safe if it holds for ALL of them. A guard
 * pinned to the default preset would have cleared `ChoicePill` while the Ocean
 * tenant rendered it illegibly.
 *
 * ── The defect class ─────────────────────────────────────────────────────────
 * A semantic scale's mid shade used as TEXT on its own light tint. `500`-on-`100`
 * bottoms out at 1.00:1 across the seed space, because `500` is the seed VERBATIM
 * (luminance unconstrained) and `100` is a tint of it. `700`-on-`100` is no fix —
 * it bottoms out at 1.09:1 and merely looks safe on dark seeds. The badge rows
 * shipped `700`-on-`100` and DID clear the floor on all five presets (4.75:1 at
 * worst) — passing by luck, not construction, and these apps also accept an
 * arbitrary tenant palette. `ChoicePill` shipped the `500` form outright.
 *
 * Badge assertions read the pair through `badgeColors` — the same call the
 * components make — so the guard cannot drift from what ships.
 */
import { AA_NORMAL_TEXT_RATIO, badgeColors, contrastRatio } from '@dloizides/theme-web';

import { THEME_PRESETS } from './presets';
import { resolveTheme } from './utils/resolveTheme';
import ThemeMode from '../shared/enums/ThemeMode';

import type { ThemePreset } from './presets';

interface RenderedPair {
  /** Where a user sees these two colours meet. */
  readonly site: string;
  readonly foreground: string;
  readonly background: string;
  readonly required: number;
}

/** Every pair one preset renders, in light mode — the mode these screens ship in. */
function pairsForPreset(preset: ThemePreset): readonly RenderedPair[] {
  const theme = resolveTheme(preset.config, ThemeMode.Light);
  const primary = theme.palette.primary;

  /** A badge pair as the row components build it — through `badgeColors`. */
  const badge = (site: string, role: 'info' | 'warning' | 'success' | 'error'): RenderedPair => {
    const pair = badgeColors(theme.semantic[role]);
    return {
      site: `${preset.id} / ${site}`,
      foreground: pair.color,
      background: pair.backgroundColor,
      required: AA_NORMAL_TEXT_RATIO,
    };
  };

  return [
    // ── settings > team, invitation rows — `PendingInvitationRow.tsx`
    badge('invitation status badge — Pending', 'warning'),
    badge('invitation status badge — Accepted', 'success'),
    badge('invitation status badge — Expired', 'error'),
    // ── settings > team, member rows — `TeamMemberRow.tsx`, via `teamRoleToSemanticColor`
    badge('team member role badge — Owner', 'info'),
    badge('team member role badge — Manager', 'warning'),
    badge('team member role badge — Staff', 'success'),
    // ── the selected states that tint with the BRAND scale rather than a semantic one
    {
      site: `${preset.id} / ChoicePill selected — primary label on the primary tint`,
      foreground: badgeColors(primary).color,
      background: badgeColors(primary).backgroundColor,
      required: AA_NORMAL_TEXT_RATIO,
    },
    {
      site: `${preset.id} / invite modal selected role — primary label on the primary tint`,
      foreground: badgeColors(primary).color,
      background: badgeColors(primary).backgroundColor,
      required: AA_NORMAL_TEXT_RATIO,
    },
    // ── the unselected branch of the same two controls
    {
      site: `${preset.id} / ChoicePill unselected — body text on the page background`,
      foreground: theme.colors.text,
      background: theme.colors.background,
      required: AA_NORMAL_TEXT_RATIO,
    },
    {
      site: `${preset.id} / invite modal unselected role — body text on a card surface`,
      foreground: theme.colors.text,
      background: theme.colors.surface,
      required: AA_NORMAL_TEXT_RATIO,
    },
  ];
}

const ALL_PAIRS: readonly RenderedPair[] = THEME_PRESETS.flatMap(pairsForPreset);

/** Assert one pair, naming the preset, the site and the measured ratio on failure. */
function expectPairMeetsAa(pair: RenderedPair): void {
  const ratio = contrastRatio(pair.foreground, pair.background);
  const detail =
    `${pair.site}: ${pair.foreground} on ${pair.background} ` +
    `measures ${ratio.toFixed(2)}:1, below the required ${pair.required}:1`;

  expect(ratio >= pair.required ? '' : detail).toBe('');
}

describe('katalogos rendered badge contrast pairs (WCAG AA, every preset)', () => {
  it.each(ALL_PAIRS.map((pair) => [pair.site, pair] as const))(
    'clears 4.5:1 — %s',
    (_site, pair) => {
      expectPairMeetsAa(pair);
    },
  );

  it('pins that the raw `500`-on-`100` pairing genuinely fails somewhere', () => {
    // Guards the guard. Every assertion above reads `badgeColors`, so it would
    // keep passing even if the function silently became the identity. This states
    // the fact that motivates it, measured on the real presets: at least one
    // preset renders the naive pairing below the floor.
    const worst = THEME_PRESETS.map((preset) => {
      const theme = resolveTheme(preset.config, ThemeMode.Light);
      return contrastRatio(theme.palette.primary['500'], theme.palette.primary['100']);
    });

    expect(Math.min(...worst)).toBeLessThan(AA_NORMAL_TEXT_RATIO);
  });
});
