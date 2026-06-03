import { useCallback, useState } from 'react';

import { Platform } from 'react-native';

import { isValueDefined } from '../utils/is';

import type { TenantMenusDto } from '../types/menuTypes';

interface EmbedState {
  menuName: string;
  publicUrl: string;
  menuId: string;
}

interface UseMenuEmbedResult {
  embedState: EmbedState | null;
  isEmbedVisible: boolean;
  handleEmbed: (externalId: string) => void;
  handleCloseEmbed: () => void;
}

function buildPublicOrigin(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function useMenuEmbed(allItems: TenantMenusDto[]): UseMenuEmbedResult {
  const [embedState, setEmbedState] = useState<EmbedState | null>(null);

  const handleEmbed = useCallback(
    (externalId: string) => {
      const menuItem = allItems.find((m) => m.externalId === externalId);
      if (isValueDefined(menuItem))
        setEmbedState({
          menuName: menuItem.name ?? '',
          publicUrl: buildPublicOrigin(),
          menuId: externalId,
        });
    },
    [allItems],
  );

  const handleCloseEmbed = useCallback(() => {
    setEmbedState(null);
  }, []);

  return {
    embedState,
    isEmbedVisible: isValueDefined(embedState),
    handleEmbed,
    handleCloseEmbed,
  };
}
