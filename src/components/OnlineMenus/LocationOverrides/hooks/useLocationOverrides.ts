/**
 * Hook for managing per-location menu item overrides.
 * Fetches overrides for the selected location + menu and provides
 * getOverride, setOverride, and clearOverride accessors.
 */
import { useCallback, useMemo, useState } from 'react';

import { overrideKey, useOverrideMap } from './useOverrideMap';

import type { MenuItemOverrideDto } from '../types';

interface UseLocationOverridesParams {
  menuExternalId?: string;
}

interface UseLocationOverridesReturn {
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
  overrides: Map<string, MenuItemOverrideDto>;
  isDirty: boolean;
  getOverride: ReturnType<typeof useOverrideMap>['getOverride'];
  setOverride: ReturnType<typeof useOverrideMap>['setOverride'];
  clearOverride: ReturnType<typeof useOverrideMap>['clearOverride'];
  hasOverride: ReturnType<typeof useOverrideMap>['hasOverride'];
  loadOverrides: ReturnType<typeof useOverrideMap>['loadOverrides'];
  getOverridesArray: ReturnType<typeof useOverrideMap>['getOverridesArray'];
  resetDirty: ReturnType<typeof useOverrideMap>['resetDirty'];
}

export function useLocationOverrides(_params: UseLocationOverridesParams): UseLocationOverridesReturn {
  const [locationId, setLocationId] = useState<string | null>(null);
  const {
    overrides, isDirty, getOverride, setOverride, clearOverride,
    hasOverride, loadOverrides, getOverridesArray, resetDirty, clearAll,
  } = useOverrideMap();

  const handleSetLocationId = useCallback((id: string | null) => {
    setLocationId(id);
    clearAll();
  }, [clearAll]);

  return useMemo(() => ({
    selectedLocationId: locationId, setSelectedLocationId: handleSetLocationId,
    overrides, isDirty, getOverride, setOverride, clearOverride,
    hasOverride, loadOverrides, getOverridesArray, resetDirty,
  }), [
    locationId, handleSetLocationId,
    overrides, isDirty, getOverride, setOverride, clearOverride,
    hasOverride, loadOverrides, getOverridesArray, resetDirty,
  ]);
}

export { overrideKey };
