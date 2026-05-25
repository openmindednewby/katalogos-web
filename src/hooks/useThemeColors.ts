import { useSelector } from 'react-redux';

import ThemeMode from '../shared/enums/ThemeMode';
import { themePalette } from '../theme/utils/styles';

import type { RootState } from '../store/reduxStore';
import type { ThemeColors } from '../theme/utils/palette';

export function useThemeColors(): ThemeColors {
  const theme = useSelector((s: RootState) => s.ui.theme);
  return theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;
}
