/**
 * React context definition for the tenant theme system.
 * Separated from ThemeProvider for clean imports.
 */
import { createContext } from 'react';

import type DarkModePreference from '../../shared/enums/DarkModePreference';
import type ThemeMode from '../../shared/enums/ThemeMode';
import type { ResolvedBranding, ResolvedTheme, TenantThemeConfig } from '../types';

export interface ThemeContextValue {
  /** Fully resolved theme for the current mode */
  theme: ResolvedTheme;
  /** Current light/dark mode */
  mode: ThemeMode;
  /** Toggle between light and dark mode */
  toggleMode: () => void;
  /** Set a specific mode */
  setMode: (mode: ThemeMode) => void;
  /** Replace the tenant theme config at runtime */
  setTenantConfig: (config: TenantThemeConfig | null) => void;
  /** Set resolved branding URLs (logo/favicon) from ContentService */
  setBrandingUrls: (urls: Partial<ResolvedBranding>) => void;
  /** Current dark mode preference (light/dark/system) */
  darkModePreference: DarkModePreference;
  /** Update the dark mode preference */
  setDarkModePreference: (preference: DarkModePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
