/**
 * Factory function for creating public menu theme presets
 * with sensible defaults. Keeps each preset definition concise
 * by only requiring the properties that differ from defaults.
 */
import type {
  PublicMenuBorders,
  PublicMenuColors,
  PublicMenuSpacing,
  PublicMenuTheme,
  PublicMenuTypography,
} from './publicMenuThemeTypes';

interface PresetInput {
  readonly id: string;
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly colors: PublicMenuColors;
  readonly typography: Partial<PublicMenuTypography> & {
    headingFont: string;
    bodyFont: string;
  };
  readonly spacing?: Partial<PublicMenuSpacing>;
  readonly borders?: Partial<PublicMenuBorders>;
}

const DEFAULT_TYPOGRAPHY: Omit<PublicMenuTypography, 'headingFont' | 'bodyFont'> = {
  titleWeight: '700',
  categoryWeight: '600',
  itemNameWeight: '500',
  priceWeight: '600',
  headingLetterSpacing: 0.5,
  bodyLetterSpacing: 0.2,
  bodyLineHeight: 1.5,
};

const DEFAULT_SPACING: PublicMenuSpacing = {
  pagePadding: 20,
  sectionGap: 32,
  itemGap: 12,
  cardPadding: 16,
  headerPadding: 24,
};

const DEFAULT_BORDERS: PublicMenuBorders = {
  cardRadius: 8,
  cardBorderWidth: 1,
  showCategoryDividers: false,
  dividerWidth: 0,
};

/** Creates a fully resolved PublicMenuTheme from partial input. */
export function createPreset(input: PresetInput): PublicMenuTheme {
  return {
    id: input.id,
    nameKey: input.nameKey,
    descriptionKey: input.descriptionKey,
    colors: input.colors,
    typography: {
      ...DEFAULT_TYPOGRAPHY,
      ...input.typography,
    },
    spacing: {
      ...DEFAULT_SPACING,
      ...input.spacing,
    },
    borders: {
      ...DEFAULT_BORDERS,
      ...input.borders,
    },
  };
}
