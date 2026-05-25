/**
 * Hook to manage the item detail modal open/close state
 * and the currently selected menu item.
 */
import { useCallback, useEffect, useState } from 'react';

import { Platform } from 'react-native';

import { isValueDefined } from '@dloizides/utils';

import type { MenuItem } from '../../../types/menuTypes';

const ESCAPE_KEY = 'Escape';

interface UseItemDetailModalResult {
  /** The item currently displayed in the modal, or null */
  readonly selectedItem: MenuItem | null;
  /** Whether the modal is open */
  readonly isOpen: boolean;
  /** Open the modal with the given item */
  readonly openModal: (item: MenuItem) => void;
  /** Close the modal and clear the selected item */
  readonly closeModal: () => void;
}

/** Type guard for non-null MenuItem. */
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
