/**
 * Hook for managing an override map with dirty tracking.
 * Extracted from useLocationOverrides to keep each hook under the line limit.
 */
import { useCallback, useState } from 'react';

import type { MenuItemOverrideDto } from '../types';

/** Builds a composite key string for override lookup. */
export function overrideKey(categoryIndex: number, itemIndex: number): string {
  return `${categoryIndex}-${itemIndex}`;
}

/** Builds a Map from an array of override DTOs. */
function buildMap(dtos: MenuItemOverrideDto[]): Map<string, MenuItemOverrideDto> {
  const map = new Map<string, MenuItemOverrideDto>();
  for (const dto of dtos)
    map.set(overrideKey(dto.categoryIndex, dto.itemIndex), dto);

  return map;
}

/** Merges partial updates into a Map entry, creating it if needed. */
function mergeEntry(
  prev: Map<string, MenuItemOverrideDto>, ci: number, ii: number, updates: Partial<MenuItemOverrideDto>,
): Map<string, MenuItemOverrideDto> {
  const next = new Map(prev);
  const key = overrideKey(ci, ii);
  const e = prev.get(key);
  next.set(key, {
    categoryIndex: ci, itemIndex: ii,
    priceOverride: e?.priceOverride ?? null,
    isAvailableOverride: e?.isAvailableOverride ?? null,
    descriptionOverride: e?.descriptionOverride ?? null,
    ...updates,
  });
  return next;
}

interface UseOverrideMapReturn {
  overrides: Map<string, MenuItemOverrideDto>;
  isDirty: boolean;
  loadOverrides: (dtos: MenuItemOverrideDto[]) => void;
  getOverride: (ci: number, ii: number) => MenuItemOverrideDto | undefined;
  setOverride: (ci: number, ii: number, updates: Partial<MenuItemOverrideDto>) => void;
  clearOverride: (ci: number, ii: number) => void;
  hasOverride: (ci: number, ii: number) => boolean;
  getOverridesArray: () => MenuItemOverrideDto[];
  resetDirty: () => void;
  clearAll: () => void;
}

export function useOverrideMap(): UseOverrideMapReturn {
  const [overrides, setOverrides] = useState<Map<string, MenuItemOverrideDto>>(new Map());
  const [isDirty, setIsDirty] = useState(false);

  const loadOverrides = useCallback((dtos: MenuItemOverrideDto[]) => { setOverrides(buildMap(dtos)); setIsDirty(false); }, []);
  const getOverride = useCallback((ci: number, ii: number) => overrides.get(overrideKey(ci, ii)), [overrides]);
  const setOverride = useCallback(
    (ci: number, ii: number, u: Partial<MenuItemOverrideDto>) => { setOverrides((p) => mergeEntry(p, ci, ii, u)); setIsDirty(true); }, [],
  );
  const clearOverride = useCallback((ci: number, ii: number) => {
    setOverrides((p) => { const n = new Map(p); n.delete(overrideKey(ci, ii)); return n; });
    setIsDirty(true);
  }, []);
  const hasOverride = useCallback((ci: number, ii: number) => overrides.has(overrideKey(ci, ii)), [overrides]);
  const getOverridesArray = useCallback(() => Array.from(overrides.values()), [overrides]);
  const resetDirty = useCallback(() => { setIsDirty(false); }, []);
  const clearAll = useCallback(() => { setOverrides(new Map()); setIsDirty(false); }, []);

  return {
    overrides, isDirty, loadOverrides, getOverride,
    setOverride, clearOverride, hasOverride, getOverridesArray, resetDirty, clearAll,
  };
}
