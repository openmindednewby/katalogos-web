import { act, renderHook } from '@testing-library/react-native';

import { useVirtualScroll, computeVisibleRange } from './useVirtualScroll';

// =============================================================================
// Constants
// =============================================================================

const ROW_HEIGHT = 40;
const CONTAINER_HEIGHT = 400;
const BUFFER = 5;
const TOTAL_ITEMS = 1000;
const ROWS_PER_PAGE = 10; // CONTAINER_HEIGHT / ROW_HEIGHT

// =============================================================================
// computeVisibleRange (Pure Function Tests)
// =============================================================================

describe('computeVisibleRange', () => {
  it('returns correct range at scroll top 0', () => {
    const { visibleRange, offsetY } = computeVisibleRange({
      scrollTop: 0, containerHeight: CONTAINER_HEIGHT, rowHeight: ROW_HEIGHT, totalItems: TOTAL_ITEMS, bufferCount: BUFFER,
    });

    expect(visibleRange.start).toBe(0);
    expect(visibleRange.end).toBe(ROWS_PER_PAGE + BUFFER);
    expect(offsetY).toBe(0);
  });

  it('returns correct range when scrolled down', () => {
    const scrollTop = ROW_HEIGHT * 20;
    const { visibleRange, offsetY } = computeVisibleRange({
      scrollTop, containerHeight: CONTAINER_HEIGHT, rowHeight: ROW_HEIGHT, totalItems: TOTAL_ITEMS, bufferCount: BUFFER,
    });

    expect(visibleRange.start).toBe(20 - BUFFER);
    expect(visibleRange.end).toBe(20 + ROWS_PER_PAGE + BUFFER);
    expect(offsetY).toBe((20 - BUFFER) * ROW_HEIGHT);
  });

  it('clamps start to 0 when near the top', () => {
    const scrollTop = ROW_HEIGHT * 2;
    const { visibleRange } = computeVisibleRange({
      scrollTop, containerHeight: CONTAINER_HEIGHT, rowHeight: ROW_HEIGHT, totalItems: TOTAL_ITEMS, bufferCount: BUFFER,
    });

    expect(visibleRange.start).toBe(0);
  });

  it('clamps end to totalItems when near the bottom', () => {
    const scrollTop = (TOTAL_ITEMS - 2) * ROW_HEIGHT;
    const { visibleRange } = computeVisibleRange({
      scrollTop, containerHeight: CONTAINER_HEIGHT, rowHeight: ROW_HEIGHT, totalItems: TOTAL_ITEMS, bufferCount: BUFFER,
    });

    expect(visibleRange.end).toBe(TOTAL_ITEMS);
  });

  it('returns empty range when totalItems is 0', () => {
    const { visibleRange, offsetY } = computeVisibleRange({
      scrollTop: 0, containerHeight: CONTAINER_HEIGHT, rowHeight: ROW_HEIGHT, totalItems: 0, bufferCount: BUFFER,
    });

    expect(visibleRange.start).toBe(0);
    expect(visibleRange.end).toBe(0);
    expect(offsetY).toBe(0);
  });

  it('returns empty range when rowHeight is 0', () => {
    const { visibleRange, offsetY } = computeVisibleRange({
      scrollTop: 0, containerHeight: CONTAINER_HEIGHT, rowHeight: 0, totalItems: TOTAL_ITEMS, bufferCount: BUFFER,
    });

    expect(visibleRange.start).toBe(0);
    expect(visibleRange.end).toBe(0);
    expect(offsetY).toBe(0);
  });

  it('handles small dataset that fits in container', () => {
    const smallItems = 5;
    const { visibleRange } = computeVisibleRange({
      scrollTop: 0, containerHeight: CONTAINER_HEIGHT, rowHeight: ROW_HEIGHT, totalItems: smallItems, bufferCount: BUFFER,
    });

    expect(visibleRange.start).toBe(0);
    expect(visibleRange.end).toBe(smallItems);
  });

  it('calculates offsetY based on visible start', () => {
    const scrollTop = ROW_HEIGHT * 50;
    const { visibleRange, offsetY } = computeVisibleRange({
      scrollTop, containerHeight: CONTAINER_HEIGHT, rowHeight: ROW_HEIGHT, totalItems: TOTAL_ITEMS, bufferCount: BUFFER,
    });

    expect(offsetY).toBe(visibleRange.start * ROW_HEIGHT);
  });

  it('handles buffer of 0', () => {
    const { visibleRange } = computeVisibleRange({
      scrollTop: ROW_HEIGHT * 10, containerHeight: CONTAINER_HEIGHT, rowHeight: ROW_HEIGHT, totalItems: TOTAL_ITEMS, bufferCount: 0,
    });

    expect(visibleRange.start).toBe(10);
    expect(visibleRange.end).toBe(10 + ROWS_PER_PAGE);
  });
});

// =============================================================================
// useVirtualScroll Hook Tests
// =============================================================================

describe('useVirtualScroll', () => {
  it('provides total height based on items and row height', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ totalItems: TOTAL_ITEMS, rowHeight: ROW_HEIGHT, containerHeight: CONTAINER_HEIGHT }),
    );

    expect(result.current.totalHeight).toBe(TOTAL_ITEMS * ROW_HEIGHT);
  });

  it('provides a container ref', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ totalItems: TOTAL_ITEMS, rowHeight: ROW_HEIGHT, containerHeight: CONTAINER_HEIGHT }),
    );

    expect(result.current.containerRef).toBeDefined();
  });

  it('starts at the beginning of the list', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ totalItems: TOTAL_ITEMS, rowHeight: ROW_HEIGHT, containerHeight: CONTAINER_HEIGHT }),
    );

    expect(result.current.visibleRange.start).toBe(0);
    expect(result.current.offsetY).toBe(0);
  });

  it('updates visible range when scroll event fires', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ totalItems: TOTAL_ITEMS, rowHeight: ROW_HEIGHT, containerHeight: CONTAINER_HEIGHT }),
    );

    const scrollTop = ROW_HEIGHT * 30;

    act(() => {
      const event = { currentTarget: { scrollTop } } as unknown as React.UIEvent<HTMLDivElement>;
      result.current.onScroll(event);
    });

    expect(result.current.visibleRange.start).toBe(30 - BUFFER);
    expect(result.current.visibleRange.end).toBe(30 + ROWS_PER_PAGE + BUFFER);
  });

  it('uses default row height when not provided', () => {
    const DEFAULT_HEIGHT = 40;
    const { result } = renderHook(() =>
      useVirtualScroll({ totalItems: 100, containerHeight: CONTAINER_HEIGHT }),
    );

    expect(result.current.totalHeight).toBe(100 * DEFAULT_HEIGHT);
  });

  it('uses custom buffer count', () => {
    const customBuffer = 10;
    const { result } = renderHook(() =>
      useVirtualScroll({ totalItems: TOTAL_ITEMS, rowHeight: ROW_HEIGHT, containerHeight: CONTAINER_HEIGHT, bufferCount: customBuffer }),
    );

    const scrollTop = ROW_HEIGHT * 50;

    act(() => {
      const event = { currentTarget: { scrollTop } } as unknown as React.UIEvent<HTMLDivElement>;
      result.current.onScroll(event);
    });

    expect(result.current.visibleRange.start).toBe(50 - customBuffer);
    expect(result.current.visibleRange.end).toBe(50 + ROWS_PER_PAGE + customBuffer);
  });
});
