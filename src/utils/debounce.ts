/**
 * Debounce and throttle utilities for rate limiting function calls.
 */

/**
 * Creates a debounced version of a function that delays invoking until after
 * `wait` milliseconds have elapsed since the last time it was invoked.
 *
 * @param fn - The function to debounce
 * @param wait - The number of milliseconds to delay (default: 300)
 * @returns A debounced version of the function
 *
 * @example
 * const debouncedSave = debounce(saveData, 500);
 * // Rapid calls will only trigger saveData after 500ms of inactivity
 */
/**
 * React hook for creating a debounced callback.
 * The callback reference is stable and won't cause re-renders.
 *
 * @param callback - The callback function to debounce
 * @param wait - The debounce delay in milliseconds
 * @param deps - Dependencies array (similar to useCallback)
 * @returns A stable debounced callback
 *
 * @example
 * const debouncedSearch = useDebouncedCallback(
 *   (query: string) => searchAPI(query),
 *   300,
 *   []
 * );
 */
import { useCallback, useRef, useEffect } from 'react';

import { isValueDefined } from './is';

export function debounce<T extends (...args: readonly unknown[]) => unknown>(
  fn: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (isValueDefined(timeoutId)) 
      clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Creates a throttled version of a function that only invokes at most once
 * per every `wait` milliseconds.
 *
 * @param fn - The function to throttle
 * @param wait - The number of milliseconds to wait between invocations (default: 300)
 * @returns A throttled version of the function
 *
 * @example
 * const throttledUpdate = throttle(updatePosition, 100);
 * // Rapid calls will only trigger updatePosition every 100ms
 */
export function throttle<T extends (...args: readonly unknown[]) => unknown>(
  fn: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let lastCallTime: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();

    if (!isValueDefined(lastCallTime) || now - lastCallTime >= wait) {
      // Enough time has passed, call immediately
      lastCallTime = now;
      fn(...args);
    } else {
      // Schedule a call for the end of the wait period
      if (isValueDefined(timeoutId)) 
        clearTimeout(timeoutId);
      
      const remaining = wait - (now - lastCallTime);
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        fn(...args);
        timeoutId = null;
      }, remaining);
    }
  };
}

export interface DebouncedCallback<T extends (...args: readonly unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  /** Fire the pending call now (if any) and clear it. No-op if nothing pending. */
  flush: () => void;
  /** Drop the pending call (if any) without firing it. No-op if nothing pending. */
  cancel: () => void;
}

export function useDebouncedCallback<T extends (...args: readonly unknown[]) => unknown>(
  callback: T,
  wait: number
): DebouncedCallback<T> {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const pendingArgsRef = useRef<Parameters<T> | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const flush = useCallback((): void => {
    if (!isValueDefined(timeoutRef.current) || !isValueDefined(pendingArgsRef.current)) return;
    clearTimeout(timeoutRef.current);
    const args = pendingArgsRef.current;
    timeoutRef.current = null;
    pendingArgsRef.current = null;
    callbackRef.current(...args);
  }, []);

  const cancel = useCallback((): void => {
    if (isValueDefined(timeoutRef.current)) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    pendingArgsRef.current = null;
  }, []);

  // On unmount, fire any pending save synchronously so navigation away
  // doesn't drop in-flight changes (e.g., an uploaded image whose autoSave
  // debounce hadn't fired yet).
  useEffect(() => () => { flush(); }, [flush]);

  const debounced = useCallback((...args: Parameters<T>) => {
    if (isValueDefined(timeoutRef.current)) clearTimeout(timeoutRef.current);
    pendingArgsRef.current = args;
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
      timeoutRef.current = null;
      pendingArgsRef.current = null;
    }, wait);
  }, [wait]);

  const result = debounced as DebouncedCallback<T>;
  result.flush = flush;
  result.cancel = cancel;
  return result;
}
