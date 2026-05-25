/**
 * Tests for useMenuQrCode hook.
 * Focuses on state management logic for QR code modal.
 */
import { renderHook, act } from '@testing-library/react-native';

import { useMenuQrCode } from './useMenuQrCode';

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

describe('useMenuQrCode', () => {
  const mockItems: TestMenu[] = [
    { externalId: 'menu-1', name: 'Lunch Menu', isActive: true },
    { externalId: 'menu-2', name: 'Dinner Menu', isActive: true },
  ];

  it('initializes with null state and not visible', () => {
    const { result } = renderHook(() => useMenuQrCode(mockItems));
    expect(result.current.qrCodeState).toBeNull();
    expect(result.current.isQrCodeVisible).toBe(false);
  });

  it('sets qrCodeState when handleQrCode is called with valid ID', () => {
    const { result } = renderHook(() => useMenuQrCode(mockItems));

    act(() => {
      result.current.handleQrCode('menu-1');
    });

    expect(result.current.qrCodeState).toEqual({
      menuName: 'Lunch Menu',
      publicUrl: 'https://test.com/public/menu/menu-1',
    });
    expect(result.current.isQrCodeVisible).toBe(true);
  });

  it('does not set state for non-existent menu ID', () => {
    const { result } = renderHook(() => useMenuQrCode(mockItems));

    act(() => {
      result.current.handleQrCode('non-existent');
    });

    expect(result.current.qrCodeState).toBeNull();
    expect(result.current.isQrCodeVisible).toBe(false);
  });

  it('clears state when handleCloseQrCode is called', () => {
    const { result } = renderHook(() => useMenuQrCode(mockItems));

    act(() => {
      result.current.handleQrCode('menu-2');
    });
    expect(result.current.isQrCodeVisible).toBe(true);

    act(() => {
      result.current.handleCloseQrCode();
    });
    expect(result.current.qrCodeState).toBeNull();
    expect(result.current.isQrCodeVisible).toBe(false);
  });

  it('builds correct public URL with menu external ID', () => {
    const { result } = renderHook(() => useMenuQrCode(mockItems));

    act(() => {
      result.current.handleQrCode('menu-2');
    });

    expect(result.current.qrCodeState?.publicUrl).toBe('https://test.com/public/menu/menu-2');
  });
});
