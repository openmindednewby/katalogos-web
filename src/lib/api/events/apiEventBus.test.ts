import { ApiEventBus, apiEventBus } from './apiEventBus';

import type { ApiEvent } from './apiEventTypes';

describe('ApiEventBus', () => {
  afterEach(() => {
    apiEventBus.clear();
  });

  describe('subscribe and emit', () => {
    it('subscriber receives emitted events', () => {
      const listener = jest.fn();
      apiEventBus.subscribe(listener);

      const event: ApiEvent = { type: 'session-expired' };
      apiEventBus.emit(event);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(event);
    });

    it('multiple subscribers all receive emitted events', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      apiEventBus.subscribe(listener1);
      apiEventBus.subscribe(listener2);
      apiEventBus.subscribe(listener3);

      const event: ApiEvent = { type: 'session-expired' };
      apiEventBus.emit(event);

      expect(listener1).toHaveBeenCalledWith(event);
      expect(listener2).toHaveBeenCalledWith(event);
      expect(listener3).toHaveBeenCalledWith(event);
    });

    it('subscriber receives multiple emitted events', () => {
      const listener = jest.fn();
      apiEventBus.subscribe(listener);

      const event1: ApiEvent = { type: 'session-expired' };
      const event2: ApiEvent = {
        type: 'toast',
        severity: 'error' as never,
        message: 'Something went wrong',
      };

      apiEventBus.emit(event1);
      apiEventBus.emit(event2);

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, event1);
      expect(listener).toHaveBeenNthCalledWith(2, event2);
    });
  });

  describe('unsubscribe', () => {
    it('stops receiving events after unsubscribe', () => {
      const listener = jest.fn();
      const unsubscribe = apiEventBus.subscribe(listener);

      apiEventBus.emit({ type: 'session-expired' });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      apiEventBus.emit({ type: 'session-expired' });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('other subscribers still receive events after one unsubscribes', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const unsubscribe1 = apiEventBus.subscribe(listener1);
      apiEventBus.subscribe(listener2);

      unsubscribe1();

      apiEventBus.emit({ type: 'session-expired' });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('calling unsubscribe multiple times is safe', () => {
      const listener = jest.fn();
      const unsubscribe = apiEventBus.subscribe(listener);

      unsubscribe();
      unsubscribe();

      apiEventBus.emit({ type: 'session-expired' });
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('error isolation', () => {
    it('listener errors do not prevent other listeners from receiving events', () => {
      const listener1 = jest.fn();
      const throwingListener = jest.fn(() => {
        throw new Error('Listener broke');
      });
      const listener3 = jest.fn();

      apiEventBus.subscribe(listener1);
      apiEventBus.subscribe(throwingListener);
      apiEventBus.subscribe(listener3);

      const event: ApiEvent = { type: 'session-expired' };
      apiEventBus.emit(event);

      expect(listener1).toHaveBeenCalledWith(event);
      expect(throwingListener).toHaveBeenCalledWith(event);
      expect(listener3).toHaveBeenCalledWith(event);
    });

    it('emit does not throw even when a listener throws', () => {
      apiEventBus.subscribe(() => {
        throw new Error('boom');
      });

      expect(() => {
        apiEventBus.emit({ type: 'session-expired' });
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('removes all listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      apiEventBus.subscribe(listener1);
      apiEventBus.subscribe(listener2);

      apiEventBus.clear();

      apiEventBus.emit({ type: 'session-expired' });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('independent instances', () => {
    it('separate ApiEventBus instances do not share listeners', () => {
      const bus1 = new ApiEventBus();
      const bus2 = new ApiEventBus();

      const listener1 = jest.fn();
      const listener2 = jest.fn();

      bus1.subscribe(listener1);
      bus2.subscribe(listener2);

      bus1.emit({ type: 'session-expired' });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).not.toHaveBeenCalled();

      bus1.clear();
      bus2.clear();
    });
  });

  describe('event types', () => {
    it('handles toast events', () => {
      const listener = jest.fn();
      apiEventBus.subscribe(listener);

      const event: ApiEvent = {
        type: 'toast',
        severity: 'warning' as never,
        message: 'Rate limited',
      };
      apiEventBus.emit(event);

      expect(listener).toHaveBeenCalledWith(event);
    });

    it('handles modal events', () => {
      const listener = jest.fn();
      apiEventBus.subscribe(listener);

      const event: ApiEvent = {
        type: 'modal',
        modalComponent: 'FeatureGateModal',
        message: 'Feature not available',
        severity: 'info' as never,
      };
      apiEventBus.emit(event);

      expect(listener).toHaveBeenCalledWith(event);
    });

    it('handles redirect events', () => {
      const listener = jest.fn();
      apiEventBus.subscribe(listener);

      const event: ApiEvent = {
        type: 'redirect',
        target: '/(auth)/login',
        message: 'Session expired',
      };
      apiEventBus.emit(event);

      expect(listener).toHaveBeenCalledWith(event);
    });

    it('handles maintenance-mode events', () => {
      const listener = jest.fn();
      apiEventBus.subscribe(listener);

      const event: ApiEvent = {
        type: 'maintenance-mode',
        estimatedEnd: '2026-02-11T12:00:00Z',
      };
      apiEventBus.emit(event);

      expect(listener).toHaveBeenCalledWith(event);
    });
  });
});
