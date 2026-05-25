/**
 * Column chooser dropdown that allows users to toggle column visibility.
 * Renders a list of checkboxes, one per column, with show-all option.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

import { FM } from '../../../localization/helpers';
import { isValueDefined } from '../../../utils/is';

import type { ColumnVisibility } from './types';

// =============================================================================
// Constants
// =============================================================================

const DROPDOWN_MIN_WIDTH = 180;
const DROPDOWN_MAX_HEIGHT = 300;
const DROPDOWN_Z_INDEX = 1000;
const DROPDOWN_BORDER_RADIUS = 4;
const DROPDOWN_PADDING = 8;
const ITEM_GAP = 8;

// =============================================================================
// Styles (defined before usage)
// =============================================================================

const containerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-block',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  minWidth: DROPDOWN_MIN_WIDTH,
  maxHeight: DROPDOWN_MAX_HEIGHT,
  overflowY: 'auto',
  zIndex: DROPDOWN_Z_INDEX,
  border: '1px solid var(--component-datagrid-cellBorderColor, #ddd)',
  borderRadius: DROPDOWN_BORDER_RADIUS,
  backgroundColor: 'var(--component-datagrid-headerBackground, #fff)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  padding: DROPDOWN_PADDING,
};

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: ITEM_GAP,
  padding: '4px 0',
  cursor: 'pointer',
};

// =============================================================================
// Types
// =============================================================================

interface Props {
  columns: ColumnVisibility[];
  onToggle: (field: string) => void;
  onShowAll: () => void;
  testID?: string;
}

// =============================================================================
// Component
// =============================================================================

export const ColumnChooser = ({
  columns,
  onToggle,
  onShowAll,
  testID,
}: Props): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleClickOutside(event: MouseEvent): void {
      const isInside = isValueDefined(containerRef.current)
        && event.target instanceof Node
        && containerRef.current.contains(event.target);
      if (!isInside) setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="table-native-column-chooser"
      data-testid={testID}
      style={containerStyle}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={FM('common.columnChooser')}
        className="table-native-column-chooser__trigger"
        type="button"
        onClick={handleToggleOpen}
      >
        {FM('common.columnChooser')}
      </button>

      {isOpen ? (
        <div className="table-native-column-chooser__dropdown" role="listbox" style={dropdownStyle}>
          <button className="table-native-column-chooser__show-all" type="button" onClick={onShowAll}>
            {FM('common.showAll')}
          </button>
          {columns.map((col) => (
            <label key={col.field} className="table-native-column-chooser__item" style={itemStyle}>
              <input checked={col.visible} type="checkbox" onChange={() => onToggle(col.field)} />
              <span>{col.headerText}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
};
