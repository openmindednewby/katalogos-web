/**
 * Manages location selection for public menus with URL persistence.
 * When a menu is available at multiple locations, customers can select
 * a location to see location-specific prices and availability.
 *
 * Follows the same URL-persistence pattern as usePublicMenuLanguage.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** A location where a menu is available. */
export interface PublicMenuLocation {
  readonly id: string;
  readonly name: string;
  readonly city: string;
}

const MIN_LOCATIONS_FOR_PICKER = 2;

/**
 * Reads the `location` query parameter from the current URL.
 * Returns empty string in non-browser environments or when the param is absent.
 */
export function getUrlLocationParam(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('location') ?? '';
}

/**
 * Updates the `location` query parameter in the browser URL without a full page reload.
 * Removes the param when locationId is empty (reverting to all-locations view).
 */
export function setUrlLocationParam(locationId: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (locationId === '') url.searchParams.delete('location');
  else url.searchParams.set('location', locationId);
  window.history.replaceState({}, '', url.toString());
}

/**
 * Resolves the initial location from URL param, falling back to empty (all locations).
 * Only returns a locationId if it matches an available location.
 */
export function resolveLocation(
  availableLocations: PublicMenuLocation[],
  urlLocationId: string,
): string {
  if (urlLocationId !== '' && availableLocations.some((loc) => loc.id === urlLocationId))
    return urlLocationId;

  return '';
}

interface UsePublicMenuLocationReturn {
  /** Currently selected location ID, or empty string for base menu (all locations). */
  selectedLocationId: string;
  /** Switch to a specific location (empty string reverts to base menu). */
  setLocation: (locationId: string) => void;
  /** Available locations from the menu response. */
  availableLocations: PublicMenuLocation[];
  /** Whether the location picker should be shown (2+ locations). */
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
