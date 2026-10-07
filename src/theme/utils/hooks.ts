import { useContext } from 'react';

import { useSelector } from 'react-redux';

import { themePalette } from './palette';
import { ThemeContext } from './ThemeContext';
import ThemeMode from '../../shared/enums/ThemeMode';
import { isValueDefined } from '../../utils/is';

import type { ThemeColors } from './palette';
import type { RootState } from '../../store/reduxStore';

/** This hook is kept only for backwards compatibility with OnlineMenus. */
export function useThemeColors(): ThemeColors {
  const themeContext = useContext(ThemeContext);
  const rawTheme = useSelector((s: RootState) => s.ui.theme);

  const contextMode = isValueDefined(themeContext) ? themeContext.mode : undefined;
  const mode = resolveMode(contextMode, rawTheme);

  return mode === ThemeMode.Dark ? themePalette.dark : themePalette.light;
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === ThemeMode.Dark || value === ThemeMode.Light;
}

function resolveMode(contextMode: ThemeMode | undefined, rawTheme: unknown): ThemeMode {
  if (isValueDefined(contextMode)) return contextMode;
  if (isThemeMode(rawTheme)) return rawTheme;
  return ThemeMode.Light;
}
