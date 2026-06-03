/**
 * Supported languages for AI menu translation.
 */

interface SupportedLanguage {
  code: string;
  name: string;
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
] as const;

/**
 * Returns the display name for a language code, or the code itself if unknown.
 */
export function getLanguageName(code: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name ?? code;
}
