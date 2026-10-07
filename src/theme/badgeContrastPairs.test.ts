import { AA_NORMAL_TEXT_RATIO, badgeColors, contrastRatio } from '@dloizides/theme-web';

import { THEME_PRESETS } from './presets';
import { resolveTheme } from './utils/resolveTheme';
import ThemeMode from '../shared/enums/ThemeMode';

import type { ThemePreset } from './presets';

interface RenderedPair {
  readonly site: string;
  readonly foreground: string;
  readonly background: string;
  readonly required: number;
}

function pairsForPreset(preset: ThemePreset): readonly RenderedPair[] {
  const theme = resolveTheme(preset.config, ThemeMode.Light);
  const primary = theme.palette.primary;

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
    badge('invitation status badge — Pending', 'warning'),
    badge('invitation status badge — Accepted', 'success'),
    badge('invitation status badge — Expired', 'error'),
    badge('team member role badge — Owner', 'info'),
    badge('team member role badge — Manager', 'warning'),
    badge('team member role badge — Staff', 'success'),
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
    const worst = THEME_PRESETS.map((preset) => {
      const theme = resolveTheme(preset.config, ThemeMode.Light);
      return contrastRatio(theme.palette.primary['500'], theme.palette.primary['100']);
    });

    expect(Math.min(...worst)).toBeLessThan(AA_NORMAL_TEXT_RATIO);
  });
});
