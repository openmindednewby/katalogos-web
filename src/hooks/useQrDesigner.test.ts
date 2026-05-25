/**
 * Tests for useQrDesigner hook.
 * Focuses on state management logic for QR designer modal.
 */
import { renderHook, act } from '@testing-library/react-native';

import { useQrDesigner } from './useQrDesigner';

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

const mockOrigin = 'https://test.com';

jest.mock('../components/OnlineMenus/QrCode', () => ({
  buildPublicMenuUrl: (externalId: string) => `${mockOrigin}/public/menu/${externalId}`,
}));

interface TestMenu {
  externalId: string;
  name: string;
  isActive: boolean;
}

describe('useQrDesigner', () => {
  const mockItems: TestMenu[] = [
    { externalId: 'menu-1', name: 'Lunch Menu', isActive: true },
    { externalId: 'menu-2', name: 'Dinner Menu', isActive: true },
  ];

  it('initializes with null state and not visible', () => {
    const { result } = renderHook(() => useQrDesigner(mockItems));
    expect(result.current.designerState).toBeNull();
    expect(result.current.isDesignerVisible).toBe(false);
  });

  it('sets designer state when handleOpenDesigner is called with valid ID', () => {
    const { result } = renderHook(() => useQrDesigner(mockItems));

    act(() => {
      result.current.handleOpenDesigner('menu-1');
    });

    expect(result.current.designerState).toEqual({
      menuName: 'Lunch Menu',
      publicUrl: 'https://test.com/public/menu/menu-1',
    });
    expect(result.current.isDesignerVisible).toBe(true);
  });

  it('does not set state for non-existent menu ID', () => {
    const { result } = renderHook(() => useQrDesigner(mockItems));

    act(() => {
      result.current.handleOpenDesigner('non-existent');
    });

    expect(result.current.designerState).toBeNull();
    expect(result.current.isDesignerVisible).toBe(false);
  });

  it('clears state when handleCloseDesigner is called', () => {
    const { result } = renderHook(() => useQrDesigner(mockItems));

    act(() => {
      result.current.handleOpenDesigner('menu-2');
    });
    expect(result.current.isDesignerVisible).toBe(true);

    act(() => {
      result.current.handleCloseDesigner();
    });
    expect(result.current.designerState).toBeNull();
    expect(result.current.isDesignerVisible).toBe(false);
  });

  it('builds correct public URL with menu external ID', () => {
    const { result } = renderHook(() => useQrDesigner(mockItems));

    act(() => {
      result.current.handleOpenDesigner('menu-2');
    });

    expect(result.current.designerState?.publicUrl).toBe('https://test.com/public/menu/menu-2');
  });
});
