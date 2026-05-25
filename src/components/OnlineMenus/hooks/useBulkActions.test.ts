/**
 * Tests for bulk action pure helpers and useBulkActions hook.
 * Focuses on logic: correct item filtering, price math, and callback wiring.
 */
import { renderHook, act } from '@testing-library/react-native';

import {
  applyBulkDelete,
  applyBulkMove,
  applyBulkSetAvailability,
  applyBulkPriceAdjust,
  useBulkActions,
} from './useBulkActions';
import { BulkPriceMode } from '../../../shared/enums/BulkPriceMode';

import type { MenuContents } from '../../../types/menuTypes';

function makeContents(): MenuContents {
  return {
    categories: [
      {
        name: 'Drinks',
        items: [
          { id: 'item-1', name: 'Coffee', price: 10, isAvailable: true },
          { id: 'item-2', name: 'Tea', price: 5, isAvailable: true },
        ],
      },
      {
        name: 'Food',
        items: [
          { id: 'item-3', name: 'Sandwich', price: 8, isAvailable: false },
          { id: 'item-4', name: 'Salad', price: 12, isAvailable: true },
        ],
      },
    ],
  };
}

describe('applyBulkDelete', () => {
  it('removes selected items from all categories', () => {
    const ids = new Set(['item-1', 'item-3']);
    const result = applyBulkDelete(makeContents(), ids);

    expect(result.categories?.[0].items).toHaveLength(1);
    expect(result.categories?.[0].items?.[0].id).toBe('item-2');
    expect(result.categories?.[1].items).toHaveLength(1);
    expect(result.categories?.[1].items?.[0].id).toBe('item-4');
  });

  it('does not modify categories with no selected items', () => {
    const ids = new Set(['item-1']);
    const result = applyBulkDelete(makeContents(), ids);

    expect(result.categories?.[1].items).toHaveLength(2);
  });

  it('handles empty selection gracefully', () => {
    const result = applyBulkDelete(makeContents(), new Set());

    expect(result.categories?.[0].items).toHaveLength(2);
    expect(result.categories?.[1].items).toHaveLength(2);
  });

  it('handles missing categories gracefully', () => {
    const result = applyBulkDelete({}, new Set(['item-1']));

    expect(result.categories).toEqual([]);
  });
});

describe('applyBulkMove', () => {
  const TARGET_CATEGORY = 1;

  it('moves items from source to target category', () => {
    const ids = new Set(['item-1']);
    const result = applyBulkMove(makeContents(), ids, TARGET_CATEGORY);

    expect(result.categories?.[0].items).toHaveLength(1);
    expect(result.categories?.[1].items).toHaveLength(3);
    expect(result.categories?.[1].items?.[2]?.id).toBe('item-1');
  });

  it('moves items from multiple sources to target', () => {
    const ids = new Set(['item-1', 'item-3']);
    const FIRST_CATEGORY = 0;
    const result = applyBulkMove(makeContents(), ids, FIRST_CATEGORY);

    expect(result.categories?.[0].items).toHaveLength(3);
    expect(result.categories?.[1].items).toHaveLength(1);
  });

  it('returns original contents for invalid target index', () => {
    const INVALID_INDEX = 99;
    const contents = makeContents();
    const result = applyBulkMove(contents, new Set(['item-1']), INVALID_INDEX);

    expect(result).toBe(contents);
  });

  it('handles empty selection gracefully', () => {
    const result = applyBulkMove(makeContents(), new Set(), TARGET_CATEGORY);

    expect(result.categories?.[0].items).toHaveLength(2);
    expect(result.categories?.[1].items).toHaveLength(2);
  });
});

describe('applyBulkSetAvailability', () => {
  it('marks selected items as unavailable', () => {
    const ids = new Set(['item-1', 'item-4']);
    const result = applyBulkSetAvailability(makeContents(), ids, false);

    expect(result.categories?.[0].items?.[0].isAvailable).toBe(false);
    expect(result.categories?.[0].items?.[1].isAvailable).toBe(true);
    expect(result.categories?.[1].items?.[0].isAvailable).toBe(false);
    expect(result.categories?.[1].items?.[1].isAvailable).toBe(false);
  });

  it('marks selected items as available', () => {
    const ids = new Set(['item-3']);
    const result = applyBulkSetAvailability(makeContents(), ids, true);

    expect(result.categories?.[1].items?.[0].isAvailable).toBe(true);
  });

  it('does not modify unselected items', () => {
    const ids = new Set(['item-1']);
    const result = applyBulkSetAvailability(makeContents(), ids, false);

    expect(result.categories?.[0].items?.[1].isAvailable).toBe(true);
  });
});

describe('applyBulkPriceAdjust', () => {
  it('adds fixed amount to selected item prices', () => {
    const ids = new Set(['item-1', 'item-2']);
    const AMOUNT = 2;
    const result = applyBulkPriceAdjust(makeContents(), ids, BulkPriceMode.Fixed, AMOUNT);

    expect(result.categories?.[0].items?.[0].price).toBe(12);
    expect(result.categories?.[0].items?.[1].price).toBe(7);
  });

  it('subtracts fixed amount (negative) from selected item prices', () => {
    const ids = new Set(['item-2']);
    const AMOUNT = -3;
    const result = applyBulkPriceAdjust(makeContents(), ids, BulkPriceMode.Fixed, AMOUNT);

    expect(result.categories?.[0].items?.[1].price).toBe(2);
  });

  it('clamps price to zero (never negative)', () => {
    const ids = new Set(['item-2']);
    const AMOUNT = -100;
    const result = applyBulkPriceAdjust(makeContents(), ids, BulkPriceMode.Fixed, AMOUNT);

    expect(result.categories?.[0].items?.[1].price).toBe(0);
  });

  it('applies percentage increase to selected items', () => {
    const ids = new Set(['item-1']);
    const PERCENTAGE = 50;
    const result = applyBulkPriceAdjust(makeContents(), ids, BulkPriceMode.Percentage, PERCENTAGE);

    expect(result.categories?.[0].items?.[0].price).toBe(15);
  });

  it('applies percentage decrease to selected items', () => {
    const ids = new Set(['item-1']);
    const PERCENTAGE = -20;
    const result = applyBulkPriceAdjust(makeContents(), ids, BulkPriceMode.Percentage, PERCENTAGE);

    expect(result.categories?.[0].items?.[0].price).toBe(8);
  });

  it('rounds to 2 decimal places', () => {
    const ids = new Set(['item-1']);
    const PERCENTAGE = 33;
    const result = applyBulkPriceAdjust(makeContents(), ids, BulkPriceMode.Percentage, PERCENTAGE);

    expect(result.categories?.[0].items?.[0].price).toBe(13.3);
  });

  it('does not modify unselected item prices', () => {
    const ids = new Set(['item-1']);
    const AMOUNT = 5;
    const result = applyBulkPriceAdjust(makeContents(), ids, BulkPriceMode.Fixed, AMOUNT);

    expect(result.categories?.[0].items?.[1].price).toBe(5);
    expect(result.categories?.[1].items?.[0].price).toBe(8);
  });
});

describe('useBulkActions hook', () => {
  it('calls onChange and exitSelectionMode on bulkDelete', () => {
    const onChange = jest.fn();
    const exitSelectionMode = jest.fn();
    const selectedItemIds = new Set(['item-1']);

    const { result } = renderHook(() =>
      useBulkActions({
        currentContents: makeContents(),
        onChange,
        selectedItemIds,
        exitSelectionMode,
      }),
    );

    act(() => { result.current.bulkDelete(); });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(exitSelectionMode).toHaveBeenCalledTimes(1);
    const updatedContents = onChange.mock.calls[0][0] as MenuContents;
    expect(updatedContents.categories?.[0].items).toHaveLength(1);
  });

  it('calls onChange and exitSelectionMode on bulkMove', () => {
    const onChange = jest.fn();
    const exitSelectionMode = jest.fn();
    const selectedItemIds = new Set(['item-1']);
    const TARGET_INDEX = 1;

    const { result } = renderHook(() =>
      useBulkActions({
        currentContents: makeContents(),
        onChange,
        selectedItemIds,
        exitSelectionMode,
      }),
    );

    act(() => { result.current.bulkMove(TARGET_INDEX); });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(exitSelectionMode).toHaveBeenCalledTimes(1);
  });

  it('calls onChange and exitSelectionMode on bulkSetAvailability', () => {
    const onChange = jest.fn();
    const exitSelectionMode = jest.fn();
    const selectedItemIds = new Set(['item-1']);

    const { result } = renderHook(() =>
      useBulkActions({
        currentContents: makeContents(),
        onChange,
        selectedItemIds,
        exitSelectionMode,
      }),
    );

    act(() => { result.current.bulkSetAvailability(false); });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(exitSelectionMode).toHaveBeenCalledTimes(1);
  });

  it('calls onChange and exitSelectionMode on bulkPriceAdjust', () => {
    const onChange = jest.fn();
    const exitSelectionMode = jest.fn();
    const selectedItemIds = new Set(['item-1']);
    const AMOUNT = 5;

    const { result } = renderHook(() =>
      useBulkActions({
        currentContents: makeContents(),
        onChange,
        selectedItemIds,
        exitSelectionMode,
      }),
    );

    act(() => { result.current.bulkPriceAdjust(BulkPriceMode.Fixed, AMOUNT); });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(exitSelectionMode).toHaveBeenCalledTimes(1);
  });
});
