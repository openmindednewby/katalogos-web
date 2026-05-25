import { isValueDefined } from '../../../utils/is';

import type { MenuContents } from '../../../types/menuTypes';

export interface MenuStyling {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  textSecondary: string;
}

interface ThemeColors {
  background?: string;
  text?: string;
  border?: string;
  textSecondary?: string;
}

/**
 * Extracts menu styling from menu contents, falling back to theme colors.
 * @param menuContents - The menu contents with optional color overrides
 * @param colors - The theme colors to use as fallbacks
 * @returns Resolved styling values
 */
export function extractMenuStyling(
  menuContents: MenuContents | undefined,
  colors: ThemeColors,
): MenuStyling {
  const DEFAULT_BORDER_COLOR = '#ccc';

  const menuBackgroundColor =
    isValueDefined(menuContents?.backgroundColor)
      ? String(menuContents.backgroundColor)
      : String(colors.background);

  const menuTextColor =
    isValueDefined(menuContents?.textColor)
      ? String(menuContents.textColor)
      : String(colors.text);

  const borderColor = String(colors.border) !== '' ? String(colors.border) : DEFAULT_BORDER_COLOR;
  const textSecondary = String(colors.textSecondary);

  return {
    backgroundColor: menuBackgroundColor,
    textColor: menuTextColor,
    borderColor,
    textSecondary,
  };
}
