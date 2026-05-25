/**
 * Hook for managing a right-click context menu on table rows.
 * Handles positioning, viewport boundary detection, open/close state,
 * and tracking which row was right-clicked.
 */
import { useState, useCallback, useEffect, useRef } from 'react';

import { isValueDefined } from '../../../../utils/is';

import type { ContextMenuItem, ContextMenuPosition } from '../types';

// =============================================================================
// Constants
// =============================================================================

const MENU_WIDTH_ESTIMATE = 200;
const MENU_HEIGHT_ESTIMATE = 250;
const VIEWPORT_PADDING = 8;

// =============================================================================
// Types
// =============================================================================

interface UseContextMenuResult {
  isOpen: boolean;
  position: ContextMenuPosition;
  contextRow: Record<string, unknown> | null;
  openMenu: (event: React.MouseEvent, row?: Record<string, unknown>) => void;
  closeMenu: () => void;
  handleItemClick: (item: ContextMenuItem) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

interface MenuState {
  isOpen: boolean;
  position: ContextMenuPosition;
  contextRow: Record<string, unknown> | null;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPosition: React.Dispatch<React.SetStateAction<ContextMenuPosition>>;
  setContextRow: React.Dispatch<React.SetStateAction<Record<string, unknown> | null>>;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

// =============================================================================
// Helpers
// =============================================================================

function computeMenuPosition(clientX: number, clientY: number): ContextMenuPosition {
  const viewW = typeof window !== 'undefined' ? window.innerWidth : 0;
  const viewH = typeof window !== 'undefined' ? window.innerHeight : 0;
  let x = clientX;
  let y = clientY;
  if (clientX + MENU_WIDTH_ESTIMATE > viewW - VIEWPORT_PADDING)
    x = clientX - MENU_WIDTH_ESTIMATE;
  if (clientY + MENU_HEIGHT_ESTIMATE > viewH - VIEWPORT_PADDING)
    y = clientY - MENU_HEIGHT_ESTIMATE;
  return { x: Math.max(VIEWPORT_PADDING, x), y: Math.max(VIEWPORT_PADDING, y) };
}

// =============================================================================
// Sub-hooks
// =============================================================================

function useMenuState(): MenuState {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  const [contextRow, setContextRow] = useState<Record<string, unknown> | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  return { isOpen, position, contextRow, setIsOpen, setPosition, setContextRow, menuRef };
}

function useCloseOnOutside(
  isOpen: boolean,
  menuRef: React.RefObject<HTMLDivElement | null>,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
): void {
  useEffect(() => {
    if (!isOpen) return undefined;
    function handleClick(event: MouseEvent): void {
      const isInside = isValueDefined(menuRef.current) && event.target instanceof Node && menuRef.current.contains(event.target);
      if (!isInside) setIsOpen(false);
    }
    function handleKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, menuRef, setIsOpen]);
}

function useMenuActions(
  state: MenuState,
  onItemClick: (item: ContextMenuItem, rowData?: Record<string, unknown>) => void,
): Pick<UseContextMenuResult, 'openMenu' | 'closeMenu' | 'handleItemClick'> {
  const openMenu = useCallback(
    (event: React.MouseEvent, row?: Record<string, unknown>) => {
      event.preventDefault();
      state.setPosition(computeMenuPosition(event.clientX, event.clientY));
      state.setContextRow(row ?? null);
      state.setIsOpen(true);
    },
    [state],
  );
  const closeMenu = useCallback(() => {
    state.setIsOpen(false);
    state.setContextRow(null);
  }, [state]);
  const handleItemClick = useCallback(
    (item: ContextMenuItem) => {
      if (item.disabled === true) return;
      onItemClick(item, state.contextRow ?? undefined);
      closeMenu();
    },
    [onItemClick, state.contextRow, closeMenu],
  );
  return { openMenu, closeMenu, handleItemClick };
}

// =============================================================================
// Hook
// =============================================================================

export function useContextMenu(
  onItemClick: (item: ContextMenuItem, rowData?: Record<string, unknown>) => void,
): UseContextMenuResult {
  const state = useMenuState();
  const actions = useMenuActions(state, onItemClick);
  useCloseOnOutside(state.isOpen, state.menuRef, state.setIsOpen);
  return {
    isOpen: state.isOpen, position: state.position, contextRow: state.contextRow,
    openMenu: actions.openMenu, closeMenu: actions.closeMenu,
    handleItemClick: actions.handleItemClick, menuRef: state.menuRef,
  };
}

export { MENU_WIDTH_ESTIMATE, MENU_HEIGHT_ESTIMATE, VIEWPORT_PADDING };
