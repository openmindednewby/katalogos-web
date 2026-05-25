/**
 * Unit tests for useOnlineStatus hook.
 * Tests logic: online/offline state transitions and event handling.
 */
import { Platform } from 'react-native';

import { renderHook, act } from '@testing-library/react-native';

import { useOnlineStatus } from './useOnlineStatus';

// Store event handlers so tests can simulate browser events
const eventHandlers: Record<string, (() => void) | undefined> = {};

beforeEach(() => {
  jest.clearAllMocks();
  // Reset event handlers
  Object.keys(eventHandlers).forEach((key) => {
    eventHandlers[key] = undefined;
  });

  jest.spyOn(window, 'addEventListener').mockImplementation(
    (event: string, handler: EventListenerOrEventListenerObject) => {
      eventHandlers[event] = handler as () => void;
    },
  );
  jest.spyOn(window, 'removeEventListener').mockImplementation(
    (event: string) => {
      eventHandlers[event] = undefined;
    },
  );
});

describe('useOnlineStatus', () => {
  describe('on web platform', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'web', writable: true });
    });

    it('returns online when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it('returns offline when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
    });

    it('transitions to offline when offline event fires', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current.isOnline).toBe(true);

      act(() => {
        eventHandlers.offline?.();
      });

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
    });

    it('transitions to online when online event fires', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current.isOffline).toBe(true);

      act(() => {
        eventHandlers.online?.();
      });

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it('registers event listeners on mount', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      renderHook(() => useOnlineStatus());

      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('removes event listeners on unmount', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      const { unmount } = renderHook(() => useOnlineStatus());
      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });

  describe('on native platform', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });
    });

    it('always reports as online on native platforms', () => {
      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it('does not register event listeners on native', () => {
      renderHook(() => useOnlineStatus());

      expect(window.addEventListener).not.toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.addEventListener).not.toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });
});
