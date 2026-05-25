/**
 * White-label configuration fields matching the backend ThemeConfigJson
 * white-label properties in IdentityService.
 */
export interface WhiteLabelConfig {
  customLogoUrl: string | null;
  customFaviconUrl: string | null;
  customCss: string | null;
  headerHtml: string | null;
  footerHtml: string | null;
  showPoweredBy: boolean;
  companyName: string | null;
  supportEmail: string | null;
}

/** Mutable form state for the white-label settings screen. */
export interface WhiteLabelFormState {
  customLogoUrl: string;
  customFaviconUrl: string;
  customCss: string;
  headerHtml: string;
  footerHtml: string;
  showPoweredBy: boolean;
  companyName: string;
  supportEmail: string;
}
