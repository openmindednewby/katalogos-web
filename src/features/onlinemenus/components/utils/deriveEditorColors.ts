import type { themePalette } from '@/theme/utils/styles';

import type { EditorColors } from '../../types';

const FALLBACK_BORDER = '#ccc';

function deriveEditorColors(colors: typeof themePalette.dark): EditorColors {
  return {
    borderColor: String(colors.border) !== '' ? String(colors.border) : FALLBACK_BORDER,
    textColor: String(colors.text),
    errorColor: String(colors.error),
    successColor: String(colors.success),
    backgroundColor: String(colors.surface),
    primaryColor: String(colors.primary),
    textOnPrimary: String(colors.textOnPrimary),
    textSecondary: String(colors.textSecondary),
    inactiveTabBg: String(colors.background),
  };
}

export { deriveEditorColors };
