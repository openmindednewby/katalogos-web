/**
 * Shared types for the TableNative advanced features.
 * These types are used by hooks and components within TableNative.
 */
import type { ReactElement } from 'react';

import type BuiltInToolbarItemType from '../../../shared/enums/BuiltInToolbarItem';

// =============================================================================
// Column Types
// =============================================================================

export interface TableColumn {
  field: string;
  headerText: string;
  width?: number;
  minWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
  visible?: boolean;
  frozen?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  format?: (value: unknown, row: Record<string, unknown>) => string;
}

// =============================================================================
// Toolbar Types
// =============================================================================

interface CustomToolbarItem {
  type: 'Custom';
  text: string;
  onClick: () => void;
  icon?: string;
}

export { default as BuiltInToolbarItem } from '../../../shared/enums/BuiltInToolbarItem';

export type ToolbarItem = BuiltInToolbarItemType | CustomToolbarItem;

export interface TableToolbarProps {
  items: ToolbarItem[];
  onSearch?: (query: string) => void;
  onAdd?: () => void;
  onDelete?: () => void;
  onExport?: (type: 'csv' | 'excel' | 'pdf') => void;
  onPrint?: () => void;
  searchValue?: string;
}

// =============================================================================
// Context Menu Types
// =============================================================================

export interface ContextMenuItem {
  id: string;
  text: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

// =============================================================================
// Detail Row Types
// =============================================================================

export type DetailTemplate = (row: Record<string, unknown>) => ReactElement;

// =============================================================================
// Column Chooser Types
// =============================================================================

export interface ColumnVisibility {
  field: string;
  headerText: string;
  visible: boolean;
}

// =============================================================================
// Export Types
// =============================================================================

const enum ExportType {
  Csv = 'csv',
  Excel = 'excel',
  Pdf = 'pdf',
}

// =============================================================================
// Virtual Scroll Types
// =============================================================================

const DEFAULT_BUFFER_COUNT = 5;

// =============================================================================
// Drag & Drop Types
// =============================================================================

export interface DragDropCallbacks {
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onRowDrop?: (droppedRow: Record<string, unknown>, targetIndex: number) => void;
}
const DEFAULT_ROW_HEIGHT = 40;

export { ExportType };

export { DEFAULT_BUFFER_COUNT, DEFAULT_ROW_HEIGHT };
