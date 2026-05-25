/**
 * Detects the browser language and provides state for manual language switching.
 * Supports URL query parameter persistence and RTL language detection.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const LOCALE_SEPARATOR = '-';

/** Languages that use right-to-left text direction. */
const RTL_LANGUAGE_CODES = new Set(['ar', 'he', 'fa', 'ur']);

/**
 * Extracts the base language code from a BCP 47 locale string.
 * Examples: "es-MX" -> "es", "zh-Hans-CN" -> "zh", "en" -> "en"
 */
export function extractBaseLocale(locale: string): string {
  if (locale === '') return '';
  return locale.split(LOCALE_SEPARATOR)[0].toLowerCase();
}

/**
 * Detects the browser's preferred language.
 * Returns empty string when running in non-browser environments.
 */
export function detectBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return '';
  const raw = navigator.language;
  return extractBaseLocale(raw);
}

/**
 * Returns true if the given language code uses right-to-left text direction.
 */
export function isRtlLanguage(code: string): boolean {
  return RTL_LANGUAGE_CODES.has(code);
}

/**
 * Reads the `lang` query parameter from the current URL.
 * Returns empty string in non-browser environments or when the param is absent.
 */
export function getUrlLanguageParam(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('lang') ?? '';
}

/**
 * Updates the `lang` query parameter in the browser URL without a full page reload.
 * Removes the param when code is empty (reverting to original language).
 */
export function setUrlLanguageParam(code: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (code === '') url.searchParams.delete('lang');
  else url.searchParams.set('lang', code);
  window.history.replaceState({}, '', url.toString());
}

interface UsePublicMenuLanguageReturn {
  /** Currently selected language code, or empty string for the original language. */
  currentLanguage: string;
  /** Switch to a specific language (empty string reverts to original). */
  setLanguage: (code: string) => void;
  /** The auto-detected browser language (base code). */
  detectedLanguage: string;
  /** Whether the current language uses right-to-left text direction. */
  isRtl: boolean;
}

/**
 * Resolves the preferred language from URL param, then browser detection, then empty.
 */
export function resolveLanguage(
  availableLanguages: string[],
  urlLang: string,
  browserLang: string,
): string {
  if (urlLang !== '' && availableLanguages.includes(urlLang)) return urlLang;
  if (availableLanguages.includes(browserLang)) return browserLang;
  return '';
}

export function usePublicMenuLanguage(availableLanguages: string[]): UsePublicMenuLanguageReturn {
  const detectedLanguage = useMemo(() => detectBrowserLanguage(), []);
  const urlLanguage = useMemo(() => getUrlLanguageParam(), []);
  const hasUserSelected = useRef(false);

  const [currentLanguage, setCurrentLanguage] = useState('');

  // Auto-select language when availableLanguages arrives (from API response).
  // Only runs when the user has not manually selected a language yet.
  useEffect(() => {
    if (hasUserSelected.current) return;
    if (availableLanguages.length === 0) return;
    const resolved = resolveLanguage(availableLanguages, urlLanguage, detectedLanguage);
    setCurrentLanguage(resolved);
  }, [availableLanguages, urlLanguage, detectedLanguage]);

  const setLanguage = useCallback((code: string) => {
    hasUserSelected.current = true;
    setCurrentLanguage(code);
    setUrlLanguageParam(code);
  }, []);

  const isRtl = useMemo(() => isRtlLanguage(currentLanguage), [currentLanguage]);

  return { currentLanguage, setLanguage, detectedLanguage, isRtl };
}
