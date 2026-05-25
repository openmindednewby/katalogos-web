/**
 * Mode-specific color tokens shared by both light and dark configurations.
 * All values are hex strings (e.g. '#ffffff').
 */
export interface ThemeModeColors {
  /** Page/body background */
  background: string;
  /** Cards, panels */
  surface: string;
  /** Modals, dropdowns */
  surfaceElevated: string;
  /** Primary text */
  text: string;
  /** Secondary/muted text */
  textSecondary: string;
  /** Default borders */
  border: string;
  /** Divider lines */
  divider: string;
}
