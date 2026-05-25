import type core from '../localization/locales/en/core.json';
import type layout from '../localization/locales/en/layout.json';
import type features from '../localization/locales/en/features.json';

type AllTranslations = typeof core & typeof layout & typeof features;

/** Recursively extracts dot-notation keys from a nested JSON object type. */
type NestedKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? NestedKeys<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

/** Union of all valid translation keys across all split JSON files. */
export type TranslationKey = NestedKeys<AllTranslations>;
