/**
 * Tests for useItemVisibilityTracker hook.
 * Focuses on the tracking logic callbacks.
 */
import { renderHook, act } from '@testing-library/react-native';

import type { AnalyticsTrackFn } from '@/lib/analytics/types';
import AnalyticsEventName from '@/shared/enums/AnalyticsEventName';

import { useItemVisibilityTracker } from './useItemVisibilityTracker';


jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

const SAMPLE_META = {
  itemId: 'item-1',
  menuId: 'menu-1',
  categoryName: 'Starters',
};

describe('useItemVisibilityTracker', () => {
  let mockTrack: jest.Mock<ReturnType<AnalyticsTrackFn>, Parameters<AnalyticsTrackFn>>;

  beforeEach(() => {
    mockTrack = jest.fn();
  });

  describe('trackItemClick', () => {
    it('fires MenuItemClicked event when consent is granted', () => {
      const { result } = renderHook(() =>
        useItemVisibilityTracker({ track: mockTrack, hasConsent: true }),
      );

      act(() => {
        result.current.trackItemClick(SAMPLE_META);
      });

      expect(mockTrack).toHaveBeenCalledWith(
        AnalyticsEventName.MenuItemClicked,
        { itemId: 'item-1', menuId: 'menu-1' },
      );
    });

    it('does not fire when consent is not granted', () => {
      const { result } = renderHook(() =>
        useItemVisibilityTracker({ track: mockTrack, hasConsent: false }),
      );

      act(() => {
        result.current.trackItemClick(SAMPLE_META);
      });

      expect(mockTrack).not.toHaveBeenCalled();
    });
  });

  describe('observeItem', () => {
    it('does not throw when element is null', () => {
      const { result } = renderHook(() =>
        useItemVisibilityTracker({ track: mockTrack, hasConsent: true }),
      );

      expect(() => {
        act(() => {
          result.current.observeItem(null, SAMPLE_META);
        });
      }).not.toThrow();
    });
  });
});
