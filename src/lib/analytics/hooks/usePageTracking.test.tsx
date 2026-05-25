import React from 'react';

import { renderHook } from '@testing-library/react-native';

import { usePageTracking } from './usePageTracking';
import { AnalyticsContext } from '../components/AnalyticsProvider';

import type { AnalyticsClient } from '../types';

let mockPathname = '/home';
jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
}));

function createMockClient(): jest.Mocked<AnalyticsClient> {
  return { track: jest.fn(), identify: jest.fn(), page: jest.fn(), reset: jest.fn() };
}

function renderWithClient(client: AnalyticsClient): ReturnType<typeof renderHook> {
  const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <AnalyticsContext.Provider value={client}>{children}</AnalyticsContext.Provider>
  );
  return renderHook(() => usePageTracking(), { wrapper });
}

describe('usePageTracking', () => {
  it('tracks the initial page view', () => {
    mockPathname = '/menus';
    const client = createMockClient();

    renderWithClient(client);

    expect(client.page).toHaveBeenCalledWith('/menus', undefined);
  });

  it('tracks page view when pathname changes', () => {
    mockPathname = '/menus';
    const client = createMockClient();

    const { rerender } = renderWithClient(client);

    expect(client.page).toHaveBeenCalledTimes(1);

    mockPathname = '/dashboard';
    rerender({});

    expect(client.page).toHaveBeenCalledTimes(2);
    expect(client.page).toHaveBeenLastCalledWith('/dashboard', undefined);
  });

  it('does not re-track when pathname stays the same', () => {
    mockPathname = '/menus';
    const client = createMockClient();

    const { rerender } = renderWithClient(client);
    rerender({});

    expect(client.page).toHaveBeenCalledTimes(1);
  });
});
