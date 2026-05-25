import React from 'react';

import { renderHook, act } from '@testing-library/react-native';

import { useAnalytics } from './useAnalytics';
import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import { AnalyticsContext } from '../components/AnalyticsProvider';

import type { AnalyticsClient } from '../types';

function createMockClient(): jest.Mocked<AnalyticsClient> {
  return { track: jest.fn(), identify: jest.fn(), page: jest.fn(), reset: jest.fn() };
}

function renderWithClient(client: AnalyticsClient): ReturnType<typeof renderHook> {
  const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <AnalyticsContext.Provider value={client}>{children}</AnalyticsContext.Provider>
  );
  return renderHook(() => useAnalytics(), { wrapper });
}

describe('useAnalytics', () => {
  it('delegates track to the context client', () => {
    const client = createMockClient();
    const { result } = renderWithClient(client);

    act(() => {
      result.current.track(AnalyticsEventName.MenuCreated, { type: 'cafe' });
    });

    expect(client.track).toHaveBeenCalledWith(AnalyticsEventName.MenuCreated, { type: 'cafe' });
  });

  it('delegates identify to the context client', () => {
    const client = createMockClient();
    const { result } = renderWithClient(client);

    act(() => {
      result.current.identify('user-123');
    });

    expect(client.identify).toHaveBeenCalledWith('user-123', undefined);
  });

  it('delegates page to the context client', () => {
    const client = createMockClient();
    const { result } = renderWithClient(client);

    act(() => {
      result.current.page('/dashboard');
    });

    expect(client.page).toHaveBeenCalledWith('/dashboard', undefined);
  });

  it('delegates reset to the context client', () => {
    const client = createMockClient();
    const { result } = renderWithClient(client);

    act(() => {
      result.current.reset();
    });

    expect(client.reset).toHaveBeenCalled();
  });
});
