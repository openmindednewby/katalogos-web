/**
 * Hook for virtualizing table rows to handle large datasets.
 * Only renders visible rows plus a configurable buffer, using
 * spacer elements above and below for correct scroll position.
 */
import { useState, useCallback, useRef, useMemo } from 'react';

import { DEFAULT_BUFFER_COUNT, DEFAULT_ROW_HEIGHT } from '../types';

// =============================================================================
// Types
// =============================================================================

interface UseVirtualScrollProps {
  totalItems: number;
  rowHeight?: number;
  containerHeight: number;
  bufferCount?: number;
}

interface VisibleRange {
  start: number;
  end: number;
}

interface UseVirtualScrollResult {
  visibleRange: VisibleRange;
  totalHeight: number;
  offsetY: number;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface ComputeRangeParams {
  scrollTop: number;
  containerHeight: number;
  rowHeight: number;
  totalItems: number;
  bufferCount: number;
}

interface ComputeRangeResult {
  visibleRange: VisibleRange;
  offsetY: number;
}

// =============================================================================
// Pure Computation
// =============================================================================

export function computeVisibleRange(params: ComputeRangeParams): ComputeRangeResult {
  const { scrollTop, containerHeight, rowHeight, totalItems, bufferCount } = params;

  if (totalItems === 0 || rowHeight === 0)
    return { visibleRange: { start: 0, end: 0 }, offsetY: 0 };

  const firstVisibleIndex = Math.floor(scrollTop / rowHeight);
  const visibleCount = Math.ceil(containerHeight / rowHeight);

  const start = Math.max(0, firstVisibleIndex - bufferCount);
  const end = Math.min(totalItems, firstVisibleIndex + visibleCount + bufferCount);

  return { visibleRange: { start, end }, offsetY: start * rowHeight };
}

// =============================================================================
// Hook
// =============================================================================

export function useVirtualScroll({
  totalItems,
  rowHeight = DEFAULT_ROW_HEIGHT,
  containerHeight,
  bufferCount = DEFAULT_BUFFER_COUNT,
}: UseVirtualScrollProps): UseVirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const totalHeight = totalItems * rowHeight;

  const { visibleRange, offsetY } = useMemo(
    () => computeVisibleRange({ scrollTop, containerHeight, rowHeight, totalItems, bufferCount }),
    [scrollTop, containerHeight, rowHeight, totalItems, bufferCount],
  );

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return { visibleRange, totalHeight, offsetY, onScroll, containerRef };
}
