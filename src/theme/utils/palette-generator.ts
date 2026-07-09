/**
 * Palette Generator Utility
 *
 * Now delegated to the shared `@dloizides/theme-web` package, which was promoted
 * verbatim from this exact file (identical HSL algorithm + constants → byte-identical
 * output, zero visual change). Kept as a thin re-export so existing in-app imports
 * (`./palette-generator`) and tests are unchanged. See `@dloizides/theme-web` for the
 * implementation.
 */
export {
  isValidHex,
  hexToHsl,
  hslToHex,
  lighten,
  darken,
  generateColorScale,
  generateThemePalette,
} from '@dloizides/theme-web';
