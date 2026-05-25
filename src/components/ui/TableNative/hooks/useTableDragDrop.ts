/**
 * Hook for row drag-and-drop reordering in TableNative.
 * Uses HTML5 Drag and Drop API. Provides handlers for drag start,
 * drag over, drop, and drag end events.
 */
import { useState, useCallback, useMemo } from 'react';

import { isValueDefined } from '../../../../utils/is';

// =============================================================================
// Types
// =============================================================================

interface UseTableDragDropProps {
  data: Array<Record<string, unknown>>;
  enabled: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onRowDrop?: (droppedRow: Record<string, unknown>, targetIndex: number) => void;
}

interface UseTableDragDropResult {
  dragIndex: number | null;
  dropIndex: number | null;
  handleDragStart: (index: number) => (event: React.DragEvent) => void;
  handleDragOver: (index: number) => (event: React.DragEvent) => void;
  handleDragEnd: () => void;
  handleDrop: (index: number) => (event: React.DragEvent) => void;
  isDragging: boolean;
}

interface DropContext {
  data: Array<Record<string, unknown>>;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onRowDrop?: (droppedRow: Record<string, unknown>, targetIndex: number) => void;
}

interface DragState {
  dragIndex: number | null;
  dropIndex: number | null;
  setDragIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setDropIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

// =============================================================================
// Constants
// =============================================================================

const DRAG_DATA_TYPE = 'text/plain';
const DRAG_OPACITY = '0.5';

// =============================================================================
// Helpers
// =============================================================================

function configureDragTransfer(event: React.DragEvent, index: number): void {
  const transfer = event.dataTransfer;
  transfer.effectAllowed = 'move';
  transfer.setData(DRAG_DATA_TYPE, String(index));
}

function applyDragStyle(event: React.DragEvent): void {
  const target = event.currentTarget;
  if (target instanceof HTMLElement)
    target.style.opacity = DRAG_OPACITY;
}

function executeDrop(fromIndex: number | null, toIndex: number, ctx: DropContext): void {
  if (!isValueDefined(fromIndex) || fromIndex === toIndex) return;
  if (isValueDefined(ctx.onReorder))
    ctx.onReorder(fromIndex, toIndex);
  if (isValueDefined(ctx.onRowDrop)) {
    const droppedRow = ctx.data[fromIndex];
    if (isValueDefined(droppedRow))
      ctx.onRowDrop(droppedRow, toIndex);
  }
}

// =============================================================================
// Sub-hooks
// =============================================================================

function useDragState(): DragState {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  return { dragIndex, dropIndex, setDragIndex, setDropIndex };
}

function useDragStartHandlers(
  enabled: boolean,
  state: DragState,
): Pick<UseTableDragDropResult, 'handleDragStart' | 'handleDragOver'> {
  const handleDragStart = useCallback(
    (index: number) => (event: React.DragEvent) => {
      if (!enabled) return;
      state.setDragIndex(index);
      configureDragTransfer(event, index);
      applyDragStyle(event);
    },
    [enabled, state],
  );
  const handleDragOver = useCallback(
    (index: number) => (event: React.DragEvent) => {
      if (!enabled) return;
      event.preventDefault();
      state.setDropIndex(index);
    },
    [enabled, state],
  );
  return { handleDragStart, handleDragOver };
}

function useDropHandlers(
  enabled: boolean,
  state: DragState,
  ctx: DropContext,
): Pick<UseTableDragDropResult, 'handleDrop' | 'handleDragEnd'> {
  const handleDrop = useCallback(
    (index: number) => (event: React.DragEvent) => {
      if (!enabled) return;
      event.preventDefault();
      executeDrop(state.dragIndex, index, ctx);
      state.setDragIndex(null);
      state.setDropIndex(null);
    },
    [enabled, state, ctx],
  );
  const handleDragEnd = useCallback(() => {
    state.setDragIndex(null);
    state.setDropIndex(null);
  }, [state]);
  return { handleDrop, handleDragEnd };
}

// =============================================================================
// Hook
// =============================================================================

export function useTableDragDrop({
  data,
  enabled,
  onReorder,
  onRowDrop,
}: UseTableDragDropProps): UseTableDragDropResult {
  const state = useDragState();
  const ctx = useMemo<DropContext>(() => ({ data, onReorder, onRowDrop }), [data, onReorder, onRowDrop]);
  const startHandlers = useDragStartHandlers(enabled, state);
  const dropHandlers = useDropHandlers(enabled, state, ctx);
  return {
    dragIndex: state.dragIndex, dropIndex: state.dropIndex,
    handleDragStart: startHandlers.handleDragStart, handleDragOver: startHandlers.handleDragOver,
    handleDragEnd: dropHandlers.handleDragEnd, handleDrop: dropHandlers.handleDrop,
    isDragging: isValueDefined(state.dragIndex),
  };
}

// =============================================================================
// Utility: Reorder an array immutably
// =============================================================================

export function reorderArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...arr];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}
