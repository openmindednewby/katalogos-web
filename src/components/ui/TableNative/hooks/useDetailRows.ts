/**
 * Hook for managing expandable detail rows in the table.
 * Tracks which rows are expanded and provides toggle/expand-all/collapse-all.
 */
import { useState, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

interface UseDetailRowsResult {
  expandedRows: Set<unknown>;
  toggleExpand: (rowId: unknown) => void;
  expandAll: (allIds: unknown[]) => void;
  collapseAll: () => void;
  isExpanded: (rowId: unknown) => boolean;
}

// =============================================================================
// Hook
// =============================================================================

export function useDetailRows(enabled: boolean): UseDetailRowsResult {
  const [expandedRows, setExpandedRows] = useState<Set<unknown>>(new Set());

  const toggleExpand = useCallback(
    (rowId: unknown) => {
      if (!enabled) return;
      setExpandedRows((prev) => toggleSetEntry(prev, rowId));
    },
    [enabled],
  );

  const expandAll = useCallback(
    (allIds: unknown[]) => {
      if (!enabled) return;
      setExpandedRows(new Set(allIds));
    },
    [enabled],
  );

  const collapseAll = useCallback(() => setExpandedRows(new Set()), []);

  const isExpanded = useCallback(
    (rowId: unknown): boolean => expandedRows.has(rowId),
    [expandedRows],
  );

  return { expandedRows, toggleExpand, expandAll, collapseAll, isExpanded };
}

// =============================================================================
// Helpers
// =============================================================================

function toggleSetEntry(set: Set<unknown>, entry: unknown): Set<unknown> {
  const next = new Set(set);
  if (next.has(entry)) next.delete(entry);
  else next.add(entry);
  return next;
}
