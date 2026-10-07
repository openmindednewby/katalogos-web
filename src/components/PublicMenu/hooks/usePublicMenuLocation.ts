import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** A location where a menu is available. */
export interface PublicMenuLocation {
  readonly id: string;
  readonly name: string;
  readonly city: string;
}

const MIN_LOCATIONS_FOR_PICKER = 2;

/** Reads the `location` query parameter from the current URL. */
export function getUrlLocationParam(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('location') ?? '';
}

/** Updates the `location` query parameter in the browser URL without a full page reload. */
export function setUrlLocationParam(locationId: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (locationId === '') url.searchParams.delete('location');
  else url.searchParams.set('location', locationId);
  window.history.replaceState({}, '', url.toString());
}

/** Resolves the initial location from URL param, falling back to empty (all locations). */
export function resolveLocation(
  availableLocations: PublicMenuLocation[],
  urlLocationId: string,
): string {
  if (urlLocationId !== '' && availableLocations.some((loc) => loc.id === urlLocationId))
    return urlLocationId;

  return '';
}

interface UsePublicMenuLocationReturn {
  selectedLocationId: string;
  setLocation: (locationId: string) => void;
  availableLocations: PublicMenuLocation[];
  showLocationPicker: boolean;
}

export function usePublicMenuLocation(
  locations: PublicMenuLocation[],
): UsePublicMenuLocationReturn {
  const urlLocationId = useMemo(() => getUrlLocationParam(), []);
  const hasUserSelected = useRef(false);

  const [selectedLocationId, setSelectedLocationId] = useState('');

  useEffect(() => {
    if (hasUserSelected.current) return;
    if (locations.length === 0) return;
    const resolved = resolveLocation(locations, urlLocationId);
    setSelectedLocationId(resolved);
  }, [locations, urlLocationId]);

  const setLocation = useCallback((locationId: string) => {
    hasUserSelected.current = true;
    setSelectedLocationId(locationId);
    setUrlLocationParam(locationId);
  }, []);

  const showLocationPicker = locations.length >= MIN_LOCATIONS_FOR_PICKER;

  return { selectedLocationId, setLocation, availableLocations: locations, showLocationPicker };
}
