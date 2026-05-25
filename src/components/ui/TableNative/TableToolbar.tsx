/**
 * Toolbar component rendered above the table.
 * Supports search, add, delete, export, print, column chooser,
 * and custom action items.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

import { FM } from '../../../localization/helpers';
import { isValueDefined } from '../../../utils/is';

import type { TableToolbarProps, ToolbarItem } from './types';

// =============================================================================
// Constants
// =============================================================================

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_WIDTH = 180;
const BUTTON_PADDING = '4px 12px';
const BUTTON_BORDER_RADIUS = 4;
const TOOLBAR_PADDING = '8px 12px';
const TOOLBAR_GAP = 8;

// =============================================================================
// Styles (defined before usage)
// =============================================================================

const toolbarContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: TOOLBAR_GAP,
  padding: TOOLBAR_PADDING,
  borderBottom: '1px solid var(--component-datagrid-toolbarBorderColor, #ddd)',
  backgroundColor: 'var(--component-datagrid-toolbarBackground, #f5f5f5)',
  flexWrap: 'wrap',
};

const searchStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: '1px solid var(--component-datagrid-cellBorderColor, #ddd)',
  borderRadius: BUTTON_BORDER_RADIUS,
  minWidth: SEARCH_MIN_WIDTH,
};

const buttonStyle: React.CSSProperties = {
  padding: BUTTON_PADDING,
  border: '1px solid var(--component-datagrid-cellBorderColor, #ddd)',
  borderRadius: BUTTON_BORDER_RADIUS,
  backgroundColor: 'var(--component-datagrid-headerBackground, #fff)',
  cursor: 'pointer',
};

// =============================================================================
// Component
// =============================================================================

export const TableToolbar = ({
  items,
  onSearch,
  onAdd,
  onDelete,
  onExport,
  onPrint,
  searchValue = '',
}: TableToolbarProps): ReactElement => {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setLocalSearch(value);

      if (isValueDefined(debounceRef.current))
        clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        if (isValueDefined(onSearch)) onSearch(value);
      }, SEARCH_DEBOUNCE_MS);
    },
    [onSearch],
  );

  useEffect(() => {
    return () => {
      if (isValueDefined(debounceRef.current)) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="table-native-toolbar" data-testid="table-toolbar" style={toolbarContainerStyle}>
      {items.map((item, index) =>
        renderToolbarItem(item, index, { localSearch, handleSearchChange, onAdd, onDelete, onExport, onPrint }),
      )}
    </div>
  );
};

// =============================================================================
// Types
// =============================================================================

interface ToolbarHandlers {
  localSearch: string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd?: () => void;
  onDelete?: () => void;
  onExport?: (type: 'csv' | 'excel' | 'pdf') => void;
  onPrint?: () => void;
}

// =============================================================================
// Renderers
// =============================================================================

function renderToolbarItem(
  item: ToolbarItem,
  index: number,
  handlers: ToolbarHandlers,
): ReactElement | null {
  if (typeof item === 'string')
    return renderBuiltInItem(item, index, handlers);

  return (
    <button key={`custom-${index}`} className="table-native-toolbar__button" style={buttonStyle} type="button" onClick={item.onClick}>
      {item.text}
    </button>
  );
}

function renderBuiltInItem(
  item: string,
  index: number,
  handlers: ToolbarHandlers,
): ReactElement | null {
  switch (item) {
    case 'Search':
      return (
        <input
          key={`search-${index}`}
          aria-label={FM('common.search')}
          className="table-native-toolbar__search"
          placeholder={FM('common.search')}
          style={searchStyle}
          type="text"
          value={handlers.localSearch}
          onChange={handlers.handleSearchChange}
        />
      );
    case 'Add':
      return renderButton(`add-${index}`, FM('common.add'), handlers.onAdd);
    case 'Delete':
      return renderButton(`delete-${index}`, FM('common.delete'), handlers.onDelete);
    case 'CsvExport':
      return renderButton(`csv-${index}`, FM('common.exportCsv'), () => handlers.onExport?.('csv'));
    case 'ExcelExport':
      return renderButton(`excel-${index}`, FM('common.exportExcel'), () => handlers.onExport?.('excel'));
    case 'PdfExport':
      return renderButton(`pdf-${index}`, FM('common.exportPdf'), () => handlers.onExport?.('pdf'));
    case 'Print':
      return renderButton(`print-${index}`, FM('common.print'), handlers.onPrint);
    case 'ColumnChooser':
      return null;
    default:
      return null;
  }
}

function renderButton(key: string, label: string, onClick?: () => void): ReactElement {
  return (
    <button key={key} className="table-native-toolbar__button" style={buttonStyle} type="button" onClick={onClick}>
      {label}
    </button>
  );
}
