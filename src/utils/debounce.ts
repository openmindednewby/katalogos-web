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
import { useMemo, useRef, useEffect } from 'react';

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

interface DebouncedCallback<T extends (...args: readonly unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  /** Fire the pending call now (if any) and clear it. No-op if nothing pending. */
  flush: () => void;
  /** Drop the pending call (if any) without firing it. No-op if nothing pending. */
  cancel: () => void;
}

/**
 * Mutable bookkeeping shared by the scheduled call, `flush` and `cancel`. Held
 * in a single ref so the helpers below can be plain module functions (keeps
 * `useDebouncedCallback` itself small and avoids reading refs during render).
 */
interface DebounceState<T extends (...args: readonly unknown[]) => unknown> {
  timeoutId: ReturnType<typeof setTimeout> | null;
  pendingArgs: Parameters<T> | null;
  callback: T;
}

interface DebounceStateRef<T extends (...args: readonly unknown[]) => unknown> {
  current: DebounceState<T>;
}

/** Fire the pending call now (if any) and clear it. */
function flushPending<T extends (...args: readonly unknown[]) => unknown>(
  stateRef: DebounceStateRef<T>
): void {
  const state = stateRef.current;
  if (!isValueDefined(state.timeoutId) || !isValueDefined(state.pendingArgs)) return;
  clearTimeout(state.timeoutId);
  const args = state.pendingArgs;
  state.timeoutId = null;
  state.pendingArgs = null;
  state.callback(...args);
}

/** Drop the pending call (if any) without firing it. */
function cancelPending<T extends (...args: readonly unknown[]) => unknown>(
  stateRef: DebounceStateRef<T>
): void {
  const state = stateRef.current;
  if (isValueDefined(state.timeoutId)) clearTimeout(state.timeoutId);
  state.timeoutId = null;
  state.pendingArgs = null;
}

/** (Re)schedule the trailing-edge call for `wait` ms from now. */
function schedulePending<T extends (...args: readonly unknown[]) => unknown>(
  stateRef: DebounceStateRef<T>,
  args: Parameters<T>,
  wait: number
): void {
  const state = stateRef.current;
  if (isValueDefined(state.timeoutId)) clearTimeout(state.timeoutId);
  state.pendingArgs = args;
  state.timeoutId = setTimeout(() => {
    state.callback(...args);
    state.timeoutId = null;
    state.pendingArgs = null;
  }, wait);
}

export function useDebouncedCallback<T extends (...args: readonly unknown[]) => unknown>(
  callback: T,
  wait: number
): DebouncedCallback<T> {
  const stateRef = useRef<DebounceState<T>>({ timeoutId: null, pendingArgs: null, callback });

  // Update callback ref when callback changes
  useEffect(() => {
    stateRef.current.callback = callback;
  }, [callback]);

  // The callable + flush/cancel are built in one expression so no value React
  // has already memoised gets mutated afterwards (react-compiler safe), and no
  // type assertion is needed — Object.assign yields the intersection type.
  const result = useMemo<DebouncedCallback<T>>(
    () =>
      Object.assign(
        (...args: Parameters<T>): void => { schedulePending(stateRef, args, wait); },
        {
          flush: (): void => { flushPending(stateRef); },
          cancel: (): void => { cancelPending(stateRef); },
        }
      ),
    [wait]
  );

  // On unmount, fire any pending save synchronously so navigation away
  // doesn't drop in-flight changes (e.g., an uploaded image whose autoSave
  // debounce hadn't fired yet).
  useEffect(() => () => { result.flush(); }, [result]);

  return result;
}
