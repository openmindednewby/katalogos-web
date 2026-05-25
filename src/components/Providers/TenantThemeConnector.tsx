/**
 * Invisible connector that synchronizes the tenant theme fetch lifecycle
 * with the ThemeProvider. Must be rendered inside both QueryClientProvider
 * and ThemeProvider.
 *
 * Renders no visual output.
 */
import type { ReactElement } from 'react';

import { useTenantThemeBridge } from '../../hooks/theme/utils/TenantThemeBridge';

const TenantThemeConnector = (): ReactElement | null => {
  useTenantThemeBridge();
  return null;
};

export default TenantThemeConnector;
