/**
 * Hook for managing column resize, reorder, and visibility.
 * Provides drag-based column resizing, header drag-to-reorder,
 * and toggle visibility for column chooser integration.
 */
import { useState, useCallback, useRef } from 'react';

import { isValueDefined } from '../../../../utils/is';

import type { TableColumn } from '../types';

// =============================================================================
// Constants
// =============================================================================

const MIN_COLUMN_WIDTH = 50;

// =============================================================================
// Types
// =============================================================================

interface UseColumnManagementProps {
  initialColumns: TableColumn[];
  allowResizing?: boolean;
  allowReordering?: boolean;
}

interface UseColumnManagementResult {
  columns: TableColumn[];
  columnWidths: Record<string, number>;
  columnOrder: string[];
  hiddenColumns: Set<string>;
  startResize: (field: string, startX: number) => void;
  onResizeMove: (currentX: number) => void;
  endResize: () => void;
  reorderColumn: (fromField: string, toField: string) => void;
  toggleColumnVisibility: (field: string) => void;
  showAllColumns: () => void;
  isResizing: boolean;
  resizingField: string | null;
}

interface ResizeState {
  resizingField: string | null;
  setResizingField: (field: string | null) => void;
  resizeStartXRef: React.MutableRefObject<number>;
  resizeStartWidthRef: React.MutableRefObject<number>;
  startResize: (field: string, startX: number) => void;
}

// =============================================================================
// Helpers
// =============================================================================

function buildInitialWidths(columns: TableColumn[]): Record<string, number> {
  const widths: Record<string, number> = {};
  for (const col of columns)
    widths[col.field] = col.width ?? MIN_COLUMN_WIDTH;
  return widths;
}

function resolveColumns(initial: TableColumn[], order: string[], hidden: Set<string>): TableColumn[] {
  const columnMap = new Map<string, TableColumn>();
  for (const col of initial)
    columnMap.set(col.field, col);
  return order
    .filter((field) => !hidden.has(field))
    .map((field) => columnMap.get(field))
    .filter((col): col is TableColumn => isValueDefined(col));
}

function moveInArray(arr: string[], from: string, to: string): string[] {
  const fromIdx = arr.indexOf(from);
  const toIdx = arr.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return arr;
  const updated = [...arr];
  updated.splice(fromIdx, 1);
  updated.splice(toIdx, 0, from);
  return updated;
}

function toggleSetItem(set: Set<string>, item: string): Set<string> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}

// =============================================================================
// Sub-hooks
// =============================================================================

function useResizeState(allowResizing: boolean, columnWidths: Record<string, number>): ResizeState {
  const [resizingField, setResizingField] = useState<string | null>(null);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(0);
  const startResize = useCallback(
    (field: string, startX: number) => {
      if (!allowResizing) return;
      setResizingField(field);
      resizeStartXRef.current = startX;
      resizeStartWidthRef.current = columnWidths[field] ?? MIN_COLUMN_WIDTH;
    },
    [allowResizing, columnWidths],
  );
  return { resizingField, setResizingField, resizeStartXRef, resizeStartWidthRef, startResize };
}

function useResizeActions(
  resize: ResizeState,
  setColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>,
): { onResizeMove: (currentX: number) => void; endResize: () => void } {
  const onResizeMove = useCallback(
    (currentX: number) => {
      if (!isValueDefined(resize.resizingField)) return;
      const delta = currentX - resize.resizeStartXRef.current;
      const newWidth = Math.max(MIN_COLUMN_WIDTH, resize.resizeStartWidthRef.current + delta);
      setColumnWidths((prev) => ({ ...prev, [resize.resizingField ?? '']: newWidth }));
    },
    [resize.resizingField, resize.resizeStartXRef, resize.resizeStartWidthRef, setColumnWidths],
  );
  const endResize = useCallback(() => resize.setResizingField(null), [resize]);
  return { onResizeMove, endResize };
}

function useColumnActions(
  allowReordering: boolean,
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>,
  setHiddenColumns: React.Dispatch<React.SetStateAction<Set<string>>>,
): { reorderColumn: (from: string, to: string) => void; toggleColumnVisibility: (f: string) => void; showAllColumns: () => void } {
  const reorderColumn = useCallback(
    (fromField: string, toField: string) => {
      if (!allowReordering || fromField === toField) return;
      setColumnOrder((prev) => moveInArray(prev, fromField, toField));
    },
    [allowReordering, setColumnOrder],
  );
  const toggleColumnVisibility = useCallback(
    (field: string) => setHiddenColumns((prev) => toggleSetItem(prev, field)),
    [setHiddenColumns],
  );
  const showAllColumns = useCallback(() => setHiddenColumns(new Set()), [setHiddenColumns]);
  return { reorderColumn, toggleColumnVisibility, showAllColumns };
}

// =============================================================================
// Hook
// =============================================================================

export function useColumnManagement({
  initialColumns,
  allowResizing = true,
  allowReordering = true,
}: UseColumnManagementProps): UseColumnManagementResult {
  const [columnOrder, setColumnOrder] = useState<string[]>(() => initialColumns.map((col) => col.field));
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => buildInitialWidths(initialColumns));
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const resize = useResizeState(allowResizing, columnWidths);
  const resizeActions = useResizeActions(resize, setColumnWidths);
  const columnActions = useColumnActions(allowReordering, setColumnOrder, setHiddenColumns);
  return {
    columns: resolveColumns(initialColumns, columnOrder, hiddenColumns),
    columnWidths, columnOrder, hiddenColumns,
    startResize: resize.startResize, onResizeMove: resizeActions.onResizeMove, endResize: resizeActions.endResize,
    reorderColumn: columnActions.reorderColumn, toggleColumnVisibility: columnActions.toggleColumnVisibility,
    showAllColumns: columnActions.showAllColumns,
    isResizing: isValueDefined(resize.resizingField),
    resizingField: resize.resizingField,
  };
}

export { MIN_COLUMN_WIDTH };
