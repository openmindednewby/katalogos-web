import { useContext } from 'react';

import { isValueDefined } from '../../utils/is';
import { ThemeContext } from '../utils/ThemeContext';

import type { ThemeContextValue } from '../utils/ThemeContext';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!isValueDefined(context))
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
