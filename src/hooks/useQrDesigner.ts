import { useCallback, useState } from 'react';

import { buildPublicMenuUrl } from '../components/OnlineMenus/QrCode';
import { isValueDefined } from '../utils/is';

import type { TenantMenusDto } from '../types/menuTypes';

interface QrDesignerState {
  menuName: string;
  publicUrl: string;
}

interface UseQrDesignerResult {
  designerState: QrDesignerState | null;
  isDesignerVisible: boolean;
  handleOpenDesigner: (externalId: string) => void;
  handleCloseDesigner: () => void;
}

/** Hook for managing the QR Code Designer modal open/close state. */
export function useQrDesigner(allItems: TenantMenusDto[]): UseQrDesignerResult {
  const [designerState, setDesignerState] = useState<QrDesignerState | null>(null);

  const handleOpenDesigner = useCallback(
    (externalId: string) => {
      const menuItem = allItems.find((m) => m.externalId === externalId);
      if (isValueDefined(menuItem))
        setDesignerState({
          menuName: menuItem.name ?? '',
          publicUrl: buildPublicMenuUrl(externalId),
        });
    },
    [allItems],
  );

  const handleCloseDesigner = useCallback(() => {
    setDesignerState(null);
  }, []);

  return {
    designerState,
    isDesignerVisible: isValueDefined(designerState),
    handleOpenDesigner,
    handleCloseDesigner,
  };
}
