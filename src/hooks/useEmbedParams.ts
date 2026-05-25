import { useLocalSearchParams } from 'expo-router';

import { isValueDefined } from '../utils/is';

export interface EmbedParams {
  isEmbed: boolean;
  themeOverride: 'light' | 'dark' | null;
  accentColor: string | null;
  visibleSections: string[] | null;
}

const VALID_THEMES = ['light', 'dark'] as const;

type ValidTheme = (typeof VALID_THEMES)[number];

function isValidTheme(value: string): value is ValidTheme {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- checking membership of string literal union
  return VALID_THEMES.includes(value as ValidTheme);
}

function parseTheme(raw: string | undefined): ValidTheme | null {
  if (!isValueDefined(raw)) return null;
  const lower = raw.toLowerCase();
  if (isValidTheme(lower)) return lower;
  return null;
}

function parseSections(raw: string | undefined): string[] | null {
  if (!isValueDefined(raw) || raw.trim() === '') return null;
  return raw.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
}

function parseAccentColor(raw: string | undefined): string | null {
  if (!isValueDefined(raw) || raw.trim() === '') return null;
  return raw.trim();
}

/** Parses embed-specific query parameters from the URL. */
export function useEmbedParams(): EmbedParams {
  const params = useLocalSearchParams<{
    embed?: string;
    theme?: string;
    accentColor?: string;
    sections?: string;
  }>();

  const isEmbed = params.embed === '1' || params.embed === 'true';

  return {
    isEmbed,
    themeOverride: parseTheme(params.theme),
    accentColor: parseAccentColor(params.accentColor),
    visibleSections: parseSections(params.sections),
  };
}

/** Pure parsing functions exported for testing. */
export { parseTheme, parseSections, parseAccentColor };
