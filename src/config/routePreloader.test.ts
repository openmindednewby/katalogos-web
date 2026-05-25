/**
 * Tests for preloadProtectedRoutes.
 * Focuses on logic: requestIdleCallback vs setTimeout fallback,
 * SSR guard, and staggered heavy module preloading.
 */

const PRELOAD_IDLE_TIMEOUT_MS = 2000;
const PRELOAD_FALLBACK_DELAY_MS = 100;
const HEAVY_MODULE_DELAY_MS = 3000;

describe('preloadProtectedRoutes', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('when requestIdleCallback is available', () => {
    it('calls requestIdleCallback for routes and schedules heavy modules via setTimeout', () => {
      const mockRequestIdleCallback = jest.fn();
      window.requestIdleCallback = mockRequestIdleCallback;

      const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

      const { preloadProtectedRoutes } = require('./routePreloader') as {
        preloadProtectedRoutes: () => void;
      };

      preloadProtectedRoutes();

      expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1);
      expect(mockRequestIdleCallback).toHaveBeenCalledWith(expect.any(Function), {
        timeout: PRELOAD_IDLE_TIMEOUT_MS,
      });

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), HEAVY_MODULE_DELAY_MS);

      setTimeoutSpy.mockRestore();
    });

    it('schedules heavy modules with requestIdleCallback after delay fires', () => {
      const idleCallbacks: Array<() => void> = [];
      const mockRequestIdleCallback = jest.fn((cb: () => void) => {
        idleCallbacks.push(cb);
        return idleCallbacks.length;
      });
      window.requestIdleCallback = mockRequestIdleCallback;

      const { preloadProtectedRoutes } = require('./routePreloader') as {
        preloadProtectedRoutes: () => void;
      };

      preloadProtectedRoutes();

      expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(HEAVY_MODULE_DELAY_MS);

      expect(mockRequestIdleCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('when requestIdleCallback is not available', () => {
    it('falls back to setTimeout for both routes and heavy modules', () => {
      const originalRequestIdleCallback = window.requestIdleCallback;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).requestIdleCallback;

      const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

      const { preloadProtectedRoutes } = require('./routePreloader') as {
        preloadProtectedRoutes: () => void;
      };

      preloadProtectedRoutes();

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), PRELOAD_FALLBACK_DELAY_MS);
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), HEAVY_MODULE_DELAY_MS);

      setTimeoutSpy.mockRestore();
      window.requestIdleCallback = originalRequestIdleCallback;
    });
  });

  describe('SSR guard', () => {
    it('does nothing when window is undefined', () => {
      const originalWindow = globalThis.window;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).window;

      const { preloadProtectedRoutes } = require('./routePreloader') as {
        preloadProtectedRoutes: () => void;
      };

      // Should not throw
      expect(() => preloadProtectedRoutes()).not.toThrow();

      // Restore
      globalThis.window = originalWindow;
    });
  });
});
