/**
 * Context menu component rendered as a fixed-position overlay.
 * Appears on right-click on table rows and displays action items.
 * Uses fixed positioning with high z-index for proper stacking.
 */
import type { ReactElement } from 'react';

import { DISABLED_OPACITY } from '../../../shared/constants';
import { isValueDefined } from '../../../utils/is';

import type { ContextMenuItem, ContextMenuPosition } from './types';

// =============================================================================
// Constants
// =============================================================================

const CONTEXT_MENU_Z_INDEX = 9999;
const MENU_MIN_WIDTH = 160;
const MENU_BORDER_RADIUS = 4;
const ITEM_PADDING = '6px 12px';

const ENABLED_OPACITY = 1;
const SEPARATOR_HEIGHT = 1;
const SEPARATOR_MARGIN = '4px 0';

// =============================================================================
// Styles (defined before usage)
// =============================================================================

const separatorStyle: React.CSSProperties = {
  height: SEPARATOR_HEIGHT,
  margin: SEPARATOR_MARGIN,
  backgroundColor: 'var(--component-datagrid-cellBorderColor, #ddd)',
};

function buildMenuStyle(position: ContextMenuPosition): React.CSSProperties {
  return {
    position: 'fixed',
    top: position.y,
    left: position.x,
    zIndex: CONTEXT_MENU_Z_INDEX,
    minWidth: MENU_MIN_WIDTH,
    backgroundColor: 'var(--component-datagrid-headerBackground, #fff)',
    border: '1px solid var(--component-datagrid-cellBorderColor, #ddd)',
    borderRadius: MENU_BORDER_RADIUS,
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    padding: '4px 0',
  };
}

function menuItemStyle(isDisabled: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: ITEM_PADDING,
    border: 'none',
    background: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? DISABLED_OPACITY : ENABLED_OPACITY,
    textAlign: 'left',
    fontSize: 'inherit',
  };
}

// =============================================================================
// Types
// =============================================================================

interface Props {
  isOpen: boolean;
  position: ContextMenuPosition;
  items: ContextMenuItem[];
  onItemClick: (item: ContextMenuItem) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  testID?: string;
}

// =============================================================================
// Item Renderer
// =============================================================================

function renderMenuItem(
  item: ContextMenuItem,
  onItemClick: (item: ContextMenuItem) => void,
): ReactElement {
  if (item.separator === true)
    return <div key={item.id} className="table-native-context-menu__separator" style={separatorStyle} />;

  const isDisabled = item.disabled === true;

  return (
    <button
      key={item.id}
      aria-disabled={isDisabled}
      className="table-native-context-menu__item"
      disabled={isDisabled}
      role="menuitem"
      style={menuItemStyle(isDisabled)}
      type="button"
      onClick={() => onItemClick(item)}
    >
      {isValueDefined(item.icon) && (
        <span className="table-native-context-menu__icon">{item.icon}</span>
      )}
      <span>{item.text}</span>
    </button>
  );
}

// =============================================================================
// Component
// =============================================================================

export const ContextMenu = ({
  isOpen,
  position,
  items,
  onItemClick,
  menuRef,
  testID,
}: Props): ReactElement | null => {
  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="table-native-context-menu"
      data-testid={testID}
      role="menu"
      style={buildMenuStyle(position)}
    >
      {items.map((item) => renderMenuItem(item, onItemClick))}
    </div>
  );
};
