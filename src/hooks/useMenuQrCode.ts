import { useCallback, useState } from 'react';

import { buildPublicMenuUrl } from '../components/OnlineMenus/QrCode';
import { isValueDefined } from '../utils/is';

import type { TenantMenusDto } from '../types/menuTypes';

export interface QrCodeState {
  menuName: string;
  publicUrl: string;
}

interface UseMenuQrCodeResult {
  qrCodeState: QrCodeState | null;
  isQrCodeVisible: boolean;
  handleQrCode: (externalId: string) => void;
  handleCloseQrCode: () => void;
}

export function useMenuQrCode(allItems: TenantMenusDto[]): UseMenuQrCodeResult {
  const [qrCodeState, setQrCodeState] = useState<QrCodeState | null>(null);

  const handleQrCode = useCallback(
    (externalId: string) => {
      const menuItem = allItems.find((m) => m.externalId === externalId);
      if (isValueDefined(menuItem)) 
        setQrCodeState({
          menuName: menuItem.name ?? '',
          publicUrl: buildPublicMenuUrl(externalId),
        });
      
    },
    [allItems],
  );

  const handleCloseQrCode = useCallback(() => {
    setQrCodeState(null);
  }, []);

  return {
    qrCodeState,
    isQrCodeVisible: isValueDefined(qrCodeState),
    handleQrCode,
    handleCloseQrCode,
  };
}
