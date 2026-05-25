import { renderHook, act } from '@testing-library/react-native';

import { apiEventBus } from './apiEventBus';
import { useApiEvents } from './useApiEvents';

import type { ModalEvent, ToastEvent } from './apiEventTypes';

// Mock dependencies
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('../../../auth/authStorageCleanup', () => ({
  clearClientAuthState: jest.fn(),
}));

jest.mock('../../../localization/helpers', () => ({
  FM: (key: string) => key,
}));

const mockNotify = jest.fn();
jest.mock('../../notifications', () => ({
  notify: (...args: unknown[]) => mockNotify(...args),
}));

// Save original window.location
const originalLocation = window.location;

beforeEach(() => {
  jest.clearAllMocks();
  apiEventBus.clear();

  // Mock window.location
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' },
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
});

describe('useApiEvents', () => {
  it('subscribes to event bus on mount and unsubscribes on unmount', () => {
    const subscribeSpy = jest.spyOn(apiEventBus, 'subscribe');
    const { unmount } = renderHook(() => useApiEvents());

    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    expect(subscribeSpy).toHaveBeenCalledWith(expect.any(Function));

    unmount();
    // After unmount, emitting should not trigger any side effects
    mockNotify.mockClear();
    const toastEvent: ToastEvent = {
      type: 'toast',
      severity: 'error' as never,
      message: 'test toast',
    };
    apiEventBus.emit(toastEvent);
    expect(mockNotify).not.toHaveBeenCalled();

    subscribeSpy.mockRestore();
  });

  it('forwards toast events to notify', () => {
    renderHook(() => useApiEvents());

    const toastEvent: ToastEvent = {
      type: 'toast',
      severity: 'error' as never,
      message: 'Something went wrong',
    };

    act(() => {
      apiEventBus.emit(toastEvent);
    });

    expect(mockNotify).toHaveBeenCalledWith('error', { message: 'Something went wrong' });
  });

  it('sets activeModal on modal events and dismissModal clears it', () => {
    const { result } = renderHook(() => useApiEvents());

    expect(result.current.activeModal).toBeNull();

    const modalEvent: ModalEvent = {
      type: 'modal',
      modalComponent: 'ErrorModal',
      message: 'An error occurred',
      severity: 'error' as never,
    };

    act(() => {
      apiEventBus.emit(modalEvent);
    });

    expect(result.current.activeModal).toEqual(modalEvent);

    act(() => {
      result.current.dismissModal();
    });

    expect(result.current.activeModal).toBeNull();
  });

  it('navigates to target on redirect events', () => {
    renderHook(() => useApiEvents());

    act(() => {
      apiEventBus.emit({ type: 'redirect', target: '/tenants' });
    });

    expect(window.location.href).toBe('/tenants');
  });

  it('clears auth state and redirects to login on session-expired', () => {
    const { clearClientAuthState } = jest.requireMock('../../../auth/authStorageCleanup');
    renderHook(() => useApiEvents());

    act(() => {
      apiEventBus.emit({ type: 'session-expired' });
    });

    expect(clearClientAuthState).toHaveBeenCalledWith(mockDispatch);
    expect(mockNotify).toHaveBeenCalledWith('signout', { message: 'errors.sessionExpired' });
    expect(window.location.href).toBe('/login');
  });

  it('opens maintenance modal on maintenance-mode event', () => {
    const { result } = renderHook(() => useApiEvents());

    act(() => {
      apiEventBus.emit({ type: 'maintenance-mode', estimatedEnd: '2026-01-15T12:00:00Z' });
    });

    expect(result.current.activeModal).not.toBeNull();
    expect(result.current.activeModal?.modalComponent).toBe('MaintenanceModal');
  });
});
