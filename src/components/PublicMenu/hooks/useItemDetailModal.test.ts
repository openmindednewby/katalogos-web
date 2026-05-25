import { Platform } from 'react-native';

import { renderHook, act } from '@testing-library/react-native';

import { useItemDetailModal } from './useItemDetailModal';

import type { MenuItem } from '../../../types/menuTypes';

const MOCK_ITEM: MenuItem = {
  id: 'item-1',
  name: 'Margherita Pizza',
  description: 'Classic pizza with tomato and mozzarella',
  price: 12.99,
  isAvailable: true,
};

const SECOND_MOCK_ITEM: MenuItem = {
  id: 'item-2',
  name: 'Caesar Salad',
  price: 8.5,
  isAvailable: true,
};

describe('useItemDetailModal', () => {
  beforeEach(() => {
    // Ensure Platform.OS is 'web' for keyboard tests
    Object.defineProperty(Platform, 'OS', { value: 'web', writable: true });
  });

  it('starts with modal closed and no selected item', () => {
    const { result } = renderHook(() => useItemDetailModal());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it('opens modal with the given item', () => {
    const { result } = renderHook(() => useItemDetailModal());

    act(() => {
      result.current.openModal(MOCK_ITEM);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedItem).toBe(MOCK_ITEM);
  });

  it('closes modal and clears selected item', () => {
    const { result } = renderHook(() => useItemDetailModal());

    act(() => {
      result.current.openModal(MOCK_ITEM);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it('replaces selected item when opening with a different item', () => {
    const { result } = renderHook(() => useItemDetailModal());

    act(() => {
      result.current.openModal(MOCK_ITEM);
    });

    expect(result.current.selectedItem).toBe(MOCK_ITEM);

    act(() => {
      result.current.openModal(SECOND_MOCK_ITEM);
    });

    expect(result.current.selectedItem).toBe(SECOND_MOCK_ITEM);
    expect(result.current.isOpen).toBe(true);
  });

  it('closes modal on Escape key press', () => {
    const { result } = renderHook(() => useItemDetailModal());

    act(() => {
      result.current.openModal(MOCK_ITEM);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it('does not close on other key presses', () => {
    const { result } = renderHook(() => useItemDetailModal());

    act(() => {
      result.current.openModal(MOCK_ITEM);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedItem).toBe(MOCK_ITEM);
  });

  it('does not register keydown listener when modal is closed', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { result } = renderHook(() => useItemDetailModal());

    // Modal is closed, no keydown listener should be added
    const keydownCalls = addSpy.mock.calls.filter(
      ([event]) => event === 'keydown',
    );
    expect(keydownCalls).toHaveLength(0);

    // Open and close to verify cleanup
    act(() => {
      result.current.openModal(MOCK_ITEM);
    });

    act(() => {
      result.current.closeModal();
    });

    const removeKeydownCalls = removeSpy.mock.calls.filter(
      ([event]) => event === 'keydown',
    );
    expect(removeKeydownCalls.length).toBeGreaterThan(0);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('maintains stable function references across renders', () => {
    const { result, rerender } = renderHook(() => useItemDetailModal());

    const { openModal: openFirst, closeModal: closeFirst } = result.current;

    rerender({});

    expect(result.current.openModal).toBe(openFirst);
    expect(result.current.closeModal).toBe(closeFirst);
  });
});
