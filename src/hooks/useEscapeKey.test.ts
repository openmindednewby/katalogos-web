import { Platform } from 'react-native';

import { renderHook } from '@testing-library/react-native';

import { useEscapeKey } from './useEscapeKey';

describe('useEscapeKey', () => {
  const originalPlatformOS = Platform.OS;

  afterEach(() => {
     
    (Platform as { OS: string }).OS = originalPlatformOS;
  });

  it('calls handler when Escape is pressed on web', () => {
     
    (Platform as { OS: string }).OS = 'web';

    const handler = jest.fn();
    renderHook(() => useEscapeKey(handler));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler for non-Escape keys', () => {
     
    (Platform as { OS: string }).OS = 'web';

    const handler = jest.fn();
    renderHook(() => useEscapeKey(handler));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('is a no-op on non-web platforms', () => {
     
    (Platform as { OS: string }).OS = 'ios';

    const handler = jest.fn();
    renderHook(() => useEscapeKey(handler));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not call handler when disabled', () => {
     
    (Platform as { OS: string }).OS = 'web';

    const handler = jest.fn();
    renderHook(() => useEscapeKey(handler, false));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('cleans up listener on unmount', () => {
     
    (Platform as { OS: string }).OS = 'web';

    const handler = jest.fn();
    const { unmount } = renderHook(() => useEscapeKey(handler));

    unmount();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).not.toHaveBeenCalled();
  });
});
