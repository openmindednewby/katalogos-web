/**
 * Tests for useMenuEmbed hook.
 * Focuses on state management logic for embed widget modal.
 */
import { renderHook, act } from '@testing-library/react-native';

import { useMenuEmbed } from './useMenuEmbed';

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

const mockOrigin = 'https://test.com';

// Mock window.location.origin for web platform
Object.defineProperty(window, 'location', {
  value: { origin: mockOrigin },
  writable: true,
});

interface TestMenu {
  externalId: string;
  name: string;
  isActive: boolean;
}

describe('useMenuEmbed', () => {
  const mockItems: TestMenu[] = [
    { externalId: 'menu-1', name: 'Lunch Menu', isActive: true },
    { externalId: 'menu-2', name: 'Dinner Menu', isActive: true },
  ];

  it('initializes with null state and not visible', () => {
    const { result } = renderHook(() => useMenuEmbed(mockItems));
    expect(result.current.embedState).toBeNull();
    expect(result.current.isEmbedVisible).toBe(false);
  });

  it('sets embedState when handleEmbed is called with valid ID', () => {
    const { result } = renderHook(() => useMenuEmbed(mockItems));

    act(() => {
      result.current.handleEmbed('menu-1');
    });

    expect(result.current.embedState).toEqual({
      menuName: 'Lunch Menu',
      publicUrl: mockOrigin,
      menuId: 'menu-1',
    });
    expect(result.current.isEmbedVisible).toBe(true);
  });

  it('does not set state for non-existent menu ID', () => {
    const { result } = renderHook(() => useMenuEmbed(mockItems));

    act(() => {
      result.current.handleEmbed('non-existent');
    });

    expect(result.current.embedState).toBeNull();
    expect(result.current.isEmbedVisible).toBe(false);
  });

  it('clears state when handleCloseEmbed is called', () => {
    const { result } = renderHook(() => useMenuEmbed(mockItems));

    act(() => {
      result.current.handleEmbed('menu-2');
    });
    expect(result.current.isEmbedVisible).toBe(true);

    act(() => {
      result.current.handleCloseEmbed();
    });
    expect(result.current.embedState).toBeNull();
    expect(result.current.isEmbedVisible).toBe(false);
  });

  it('uses the correct menu name from the items list', () => {
    const { result } = renderHook(() => useMenuEmbed(mockItems));

    act(() => {
      result.current.handleEmbed('menu-2');
    });

    expect(result.current.embedState?.menuName).toBe('Dinner Menu');
    expect(result.current.embedState?.menuId).toBe('menu-2');
  });
});
