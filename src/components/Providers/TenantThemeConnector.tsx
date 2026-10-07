import type { ReactElement } from 'react';

import { useTenantThemeBridge } from '../../hooks/theme/utils/TenantThemeBridge';

const TenantThemeConnector = (): ReactElement | null => {
  useTenantThemeBridge();
  return null;
};

export default TenantThemeConnector;
