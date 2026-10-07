import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const LOCALE_SEPARATOR = '-';

const RTL_LANGUAGE_CODES = new Set(['ar', 'he', 'fa', 'ur']);

/** Extracts the base language code from a BCP 47 locale string. */
export function extractBaseLocale(locale: string): string {
  if (locale === '') return '';
  return locale.split(LOCALE_SEPARATOR)[0].toLowerCase();
}

/** Detects the browser's preferred language. */
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

/** Reads the `lang` query parameter from the current URL. */
export function getUrlLanguageParam(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('lang') ?? '';
}

/** Updates the `lang` query parameter in the browser URL without a full page reload. */
export function setUrlLanguageParam(code: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (code === '') url.searchParams.delete('lang');
  else url.searchParams.set('lang', code);
  window.history.replaceState({}, '', url.toString());
}

interface UsePublicMenuLanguageReturn {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  detectedLanguage: string;
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
