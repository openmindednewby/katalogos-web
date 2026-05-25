/**
 * Tracks menu item visibility using IntersectionObserver.
 * Fires analytics events when items are visible for >1 second.
 * Web-only; no-ops on native platforms.
 */
import { useCallback, useEffect, useRef } from 'react';

import { Platform } from 'react-native';

import type { AnalyticsTrackFn } from '@/lib/analytics/types';
import AnalyticsEventName from '@/shared/enums/AnalyticsEventName';
import { isValueDefined } from '@/utils/is';

const IMPRESSION_THRESHOLD_MS = 1000;
const VISIBILITY_RATIO = 0.5;

interface ItemMeta {
  itemId: string;
  menuId: string;
  categoryName: string;
}

interface TrackerCallbacks {
  track: AnalyticsTrackFn;
  hasConsent: boolean;
}

interface UseItemVisibilityTrackerResult {
  readonly observeItem: (element: HTMLElement | null, meta: ItemMeta) => void;
  readonly trackItemClick: (meta: ItemMeta) => void;
}

function getItemIdFromEntry(entry: IntersectionObserverEntry): string {
  if (entry.target instanceof HTMLElement) return entry.target.dataset['trackItemId'] ?? '';
  return '';
}

interface ObserverRefs {
  impressed: Set<string>;
  timers: Map<string, ReturnType<typeof setTimeout>>;
  elements: Map<string, ItemMeta>;
}

function handleEntryVisible(itemId: string, refs: ObserverRefs, track: AnalyticsTrackFn): void {
  if (refs.impressed.has(itemId)) return;
  const timer = setTimeout(() => {
    if (refs.impressed.has(itemId)) return;
    refs.impressed.add(itemId);
    const meta = refs.elements.get(itemId);
    if (!isValueDefined(meta)) return;
    track(AnalyticsEventName.MenuItemViewed, {
      itemId: meta.itemId, menuId: meta.menuId, categoryName: meta.categoryName,
    });
  }, IMPRESSION_THRESHOLD_MS);
  refs.timers.set(itemId, timer);
}

function handleEntryHidden(itemId: string, timers: Map<string, ReturnType<typeof setTimeout>>): void {
  const existing = timers.get(itemId);
  if (isValueDefined(existing)) {
    clearTimeout(existing);
    timers.delete(itemId);
  }
}

function createObserver(refs: ObserverRefs, track: AnalyticsTrackFn): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const itemId = getItemIdFromEntry(entry);
        if (itemId === '') continue;
        if (entry.isIntersecting) handleEntryVisible(itemId, refs, track);
        else handleEntryHidden(itemId, refs.timers);
      }
    },
    { threshold: VISIBILITY_RATIO },
  );
}

function canUseIntersectionObserver(hasConsent: boolean): boolean {
  if (Platform.OS !== 'web' || !hasConsent) return false;
  return typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined';
}

function cleanupObserver(observer: IntersectionObserver, timers: Map<string, ReturnType<typeof setTimeout>>): void {
  observer.disconnect();
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
}

export function useItemVisibilityTracker(callbacks: TrackerCallbacks): UseItemVisibilityTrackerResult {
  const { track, hasConsent } = callbacks;
  const impressedItems = useRef(new Set<string>());
  const timerMap = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const elementMap = useRef(new Map<string, ItemMeta>());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!canUseIntersectionObserver(hasConsent)) return undefined;
    const refs: ObserverRefs = { impressed: impressedItems.current, timers: timerMap.current, elements: elementMap.current };
    const observer = createObserver(refs, track);
    observerRef.current = observer;
    return () => cleanupObserver(observer, refs.timers);
  }, [hasConsent, track]);

  const observeItem = useCallback((element: HTMLElement | null, meta: ItemMeta): void => {
    const shouldSkip = Platform.OS !== 'web' || !hasConsent || !isValueDefined(element);
    if (shouldSkip) return;
    elementMap.current.set(meta.itemId, meta);
    observerRef.current?.observe(element);
  }, [hasConsent]);

  const trackItemClick = useCallback((meta: ItemMeta): void => {
    if (!hasConsent) return;
    track(AnalyticsEventName.MenuItemClicked, { itemId: meta.itemId, menuId: meta.menuId });
  }, [hasConsent, track]);

  return { observeItem, trackItemClick };
}
