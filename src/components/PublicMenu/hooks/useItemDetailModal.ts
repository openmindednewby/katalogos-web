import { useCallback, useEffect, useState } from 'react';

import { Platform } from 'react-native';

import { isValueDefined } from '@dloizides/utils';

import type { MenuItem } from '../../../types/menuTypes';

const ESCAPE_KEY = 'Escape';

interface UseItemDetailModalResult {
  readonly selectedItem: MenuItem | null;
  readonly isOpen: boolean;
  readonly openModal: (item: MenuItem) => void;
  readonly closeModal: () => void;
}

function isItemSelected(item: MenuItem | null): item is MenuItem {
   
  return isValueDefined(item);
}

export function useItemDetailModal(): UseItemDetailModalResult {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const isOpen: boolean = isItemSelected(selectedItem);

  const openModal = useCallback((item: MenuItem) => {
    setSelectedItem(item);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  useEffect(() => {
    if (!isOpen || Platform.OS !== 'web') return undefined;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === ESCAPE_KEY) closeModal();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal]);

  return { selectedItem, isOpen, openModal, closeModal };
}
