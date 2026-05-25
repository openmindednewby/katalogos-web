/**
 * Runtime hook for applying white-label configuration on public pages.
 *
 * - Injects custom CSS via a <style> tag
 * - Injects custom favicon via a <link> tag
 * - Determines whether to show the "Powered by" watermark
 * - Provides custom header/footer HTML strings for rendering
 * - Provides company name and support email for display
 *
 * Only runs on the web platform; on native, injections are no-ops.
 */
import { useEffect, useMemo, useRef } from 'react';

import { Platform } from 'react-native';

import { isValueDefined } from '../../../utils/is';

import type { WhiteLabelConfig } from '../types';

const STYLE_TAG_ID = 'white-label-custom-css';
const FAVICON_LINK_ID = 'white-label-favicon';

export interface WhiteLabelRuntimeResult {
  showPoweredBy: boolean;
  headerHtml: string | null;
  footerHtml: string | null;
  companyName: string | null;
  supportEmail: string | null;
  customLogoUrl: string | null;
  customFaviconUrl: string | null;
}

/** Injects or removes a <style> tag with custom CSS in the document head. */
export function injectCustomCss(css: string | null): void {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;

  const existing = document.getElementById(STYLE_TAG_ID);

  if (!isValueDefined(css) || css.trim().length === 0) {
    if (isValueDefined(existing)) existing.remove();
    return;
  }

  if (isValueDefined(existing))
    existing.textContent = css;
   else {
    const style = document.createElement('style');
    style.id = STYLE_TAG_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }
}

/** Removes the injected custom CSS <style> tag. */
export function removeCustomCss(): void {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(STYLE_TAG_ID);
  if (isValueDefined(existing)) existing.remove();
}

/** Injects or removes a custom favicon <link> tag in the document head. */
export function injectFavicon(url: string | null): void {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;

  const existing = document.getElementById(FAVICON_LINK_ID);

  if (!isValueDefined(url) || url.trim().length === 0) {
    if (isValueDefined(existing)) existing.remove();
    return;
  }

  if (isValueDefined(existing))
    existing.setAttribute('href', url);
   else {
    const link = document.createElement('link');
    link.id = FAVICON_LINK_ID;
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);
  }
}

/** Removes the injected favicon <link> tag. */
export function removeFavicon(): void {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(FAVICON_LINK_ID);
  if (isValueDefined(existing)) existing.remove();
}

function buildRuntimeResult(config: WhiteLabelConfig | null): WhiteLabelRuntimeResult {
  return {
    showPoweredBy: config?.showPoweredBy ?? true,
    headerHtml: config?.headerHtml ?? null,
    footerHtml: config?.footerHtml ?? null,
    companyName: config?.companyName ?? null,
    supportEmail: config?.supportEmail ?? null,
    customLogoUrl: config?.customLogoUrl ?? null,
    customFaviconUrl: config?.customFaviconUrl ?? null,
  };
}

function useCssInjection(customCss: string | null | undefined): void {
  const prevCssRef = useRef<string | null>(null);
  useEffect(() => {
    const css = customCss ?? null;
    if (css !== prevCssRef.current) {
      injectCustomCss(css);
      prevCssRef.current = css;
    }
    return () => {
      removeCustomCss();
      prevCssRef.current = null;
    };
  }, [customCss]);
}

function useFaviconInjection(faviconUrl: string | null | undefined): void {
  const prevRef = useRef<string | null>(null);
  useEffect(() => {
    const url = faviconUrl ?? null;
    if (url !== prevRef.current) {
      injectFavicon(url);
      prevRef.current = url;
    }
    return () => {
      removeFavicon();
      prevRef.current = null;
    };
  }, [faviconUrl]);
}

export function useWhiteLabelRuntime(config: WhiteLabelConfig | null): WhiteLabelRuntimeResult {
  useCssInjection(config?.customCss);
  useFaviconInjection(config?.customFaviconUrl);
  return useMemo(() => buildRuntimeResult(config), [config]);
}
