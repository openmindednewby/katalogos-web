/**
 * Tests for useLocationOverrides hook.
 * Focuses on logic: override CRUD, dirty tracking, and location switching.
 */
import { renderHook, act } from '@testing-library/react-native';

import { useLocationOverrides, overrideKey } from './useLocationOverrides';

import type { MenuItemOverrideDto } from '../types';

const CATEGORY_0 = 0;
const CATEGORY_1 = 1;
const ITEM_0 = 0;
const ITEM_1 = 1;
const ITEM_2 = 2;
const BASE_PRICE = 12.99;
const OVERRIDE_PRICE = 14.99;

function makeSampleOverrides(): MenuItemOverrideDto[] {
  return [
    { categoryIndex: CATEGORY_0, itemIndex: ITEM_0, priceOverride: OVERRIDE_PRICE, isAvailableOverride: false, descriptionOverride: 'Local special' },
    { categoryIndex: CATEGORY_0, itemIndex: ITEM_1, priceOverride: BASE_PRICE, isAvailableOverride: null, descriptionOverride: null },
    { categoryIndex: CATEGORY_1, itemIndex: ITEM_0, priceOverride: null, isAvailableOverride: true, descriptionOverride: 'HQ version' },
  ];
}

describe('overrideKey', () => {
  it('creates a composite key from category and item indices', () => {
    expect(overrideKey(CATEGORY_0, ITEM_1)).toBe('0-1');
    expect(overrideKey(CATEGORY_1, ITEM_0)).toBe('1-0');
  });
});

describe('useLocationOverrides', () => {
  const MENU_ID = 'menu-abc-123';

  function renderOverridesHook(): ReturnType<typeof renderHook<ReturnType<typeof useLocationOverrides>>> {
    return renderHook(() => useLocationOverrides({ menuExternalId: MENU_ID }));
  }

  it('initializes with no location selected and empty overrides', () => {
    const { result } = renderOverridesHook();

    expect(result.current.selectedLocationId).toBeNull();
    expect(result.current.overrides.size).toBe(0);
    expect(result.current.isDirty).toBe(false);
  });

  it('loadOverrides populates the overrides map', () => {
    const { result } = renderOverridesHook();
    const sample = makeSampleOverrides();

    act(() => { result.current.loadOverrides(sample); });

    expect(result.current.overrides.size).toBe(3);
    expect(result.current.isDirty).toBe(false);
  });

  it('getOverride returns the correct override by indices', () => {
    const { result } = renderOverridesHook();

    act(() => { result.current.loadOverrides(makeSampleOverrides()); });

    const override = result.current.getOverride(CATEGORY_0, ITEM_0);
    expect(override).toBeDefined();
    expect(override?.priceOverride).toBe(OVERRIDE_PRICE);
    expect(override?.isAvailableOverride).toBe(false);
    expect(override?.descriptionOverride).toBe('Local special');
  });

  it('getOverride returns undefined for non-existent override', () => {
    const { result } = renderOverridesHook();

    act(() => { result.current.loadOverrides(makeSampleOverrides()); });

    expect(result.current.getOverride(CATEGORY_1, ITEM_2)).toBeUndefined();
  });

  it('setOverride creates a new override and marks dirty', () => {
    const { result } = renderOverridesHook();

    act(() => {
      result.current.setOverride(CATEGORY_1, ITEM_1, { priceOverride: BASE_PRICE });
    });

    expect(result.current.isDirty).toBe(true);
    const override = result.current.getOverride(CATEGORY_1, ITEM_1);
    expect(override?.priceOverride).toBe(BASE_PRICE);
    expect(override?.isAvailableOverride).toBeNull();
    expect(override?.descriptionOverride).toBeNull();
  });

  it('setOverride merges with existing override', () => {
    const { result } = renderOverridesHook();

    act(() => { result.current.loadOverrides(makeSampleOverrides()); });
    act(() => {
      result.current.setOverride(CATEGORY_0, ITEM_0, { descriptionOverride: 'Updated' });
    });

    const override = result.current.getOverride(CATEGORY_0, ITEM_0);
    expect(override?.priceOverride).toBe(OVERRIDE_PRICE);
    expect(override?.descriptionOverride).toBe('Updated');
    expect(result.current.isDirty).toBe(true);
  });

  it('clearOverride removes the override and marks dirty', () => {
    const { result } = renderOverridesHook();

    act(() => { result.current.loadOverrides(makeSampleOverrides()); });
    act(() => { result.current.clearOverride(CATEGORY_0, ITEM_0); });

    expect(result.current.getOverride(CATEGORY_0, ITEM_0)).toBeUndefined();
    expect(result.current.overrides.size).toBe(2);
    expect(result.current.isDirty).toBe(true);
  });

  it('clearOverride on non-existent override still marks dirty', () => {
    const { result } = renderOverridesHook();

    act(() => { result.current.clearOverride(CATEGORY_1, ITEM_2); });

    expect(result.current.isDirty).toBe(true);
  });

  it('hasOverride returns true for existing overrides', () => {
    const { result } = renderOverridesHook();

    act(() => { result.current.loadOverrides(makeSampleOverrides()); });

    expect(result.current.hasOverride(CATEGORY_0, ITEM_0)).toBe(true);
    expect(result.current.hasOverride(CATEGORY_1, ITEM_2)).toBe(false);
  });

  it('getOverridesArray returns all overrides as an array', () => {
    const { result } = renderOverridesHook();

    act(() => { result.current.loadOverrides(makeSampleOverrides()); });

    const arr = result.current.getOverridesArray();
    expect(arr).toHaveLength(3);
    expect(arr[0].categoryIndex).toBe(CATEGORY_0);
  });

  it('resetDirty clears the dirty flag', () => {
    const { result } = renderOverridesHook();

    act(() => {
      result.current.setOverride(CATEGORY_0, ITEM_0, { priceOverride: BASE_PRICE });
    });
    expect(result.current.isDirty).toBe(true);

    act(() => { result.current.resetDirty(); });
    expect(result.current.isDirty).toBe(false);
  });

  it('setSelectedLocationId clears overrides and dirty state', () => {
    const { result } = renderOverridesHook();

    act(() => { result.current.loadOverrides(makeSampleOverrides()); });
    act(() => {
      result.current.setOverride(CATEGORY_0, ITEM_0, { priceOverride: BASE_PRICE });
    });
    expect(result.current.isDirty).toBe(true);
    expect(result.current.overrides.size).toBe(3);

    act(() => { result.current.setSelectedLocationId('location-xyz'); });

    expect(result.current.selectedLocationId).toBe('location-xyz');
    expect(result.current.overrides.size).toBe(0);
    expect(result.current.isDirty).toBe(false);
  });

  it('setSelectedLocationId to null returns to base menu', () => {
    const { result } = renderOverridesHook();

    act(() => { result.current.setSelectedLocationId('loc-1'); });
    act(() => { result.current.setSelectedLocationId(null); });

    expect(result.current.selectedLocationId).toBeNull();
  });
});
