import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { useAnalyticsIdentify } from './useAnalyticsIdentify';
import { AnalyticsContext } from '../components/AnalyticsProvider';

import type { AnalyticsClient } from '../types';

function createMockClient(): jest.Mocked<AnalyticsClient> {
  return { track: jest.fn(), identify: jest.fn(), page: jest.fn(), reset: jest.fn() };
}

function createStore(authState: Record<string, unknown>): ReturnType<typeof configureStore> {
  return configureStore({
    reducer: {
      auth: () => ({
        accessToken: null,
        refreshToken: null,
        user: null,
        userInfo: null,
        loading: false,
        ...authState,
      }),
      ui: () => ({ locale: 'en' }),
    },
  });
}

function renderWithProviders(client: AnalyticsClient, authState: Record<string, unknown>): ReturnType<typeof renderHook> {
  const store = createStore(authState);
  const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <Provider store={store}>
      <AnalyticsContext.Provider value={client}>{children}</AnalyticsContext.Provider>
    </Provider>
  );
  return renderHook(() => useAnalyticsIdentify(), { wrapper });
}

describe('useAnalyticsIdentify', () => {
  it('identifies user when auth state has a user', () => {
    const client = createMockClient();

    renderWithProviders(client, {
      user: { id: 'user-guid-123', username: 'john' },
      userInfo: { tenantId: 'tenant-1' },
    });

    expect(client.identify).toHaveBeenCalledWith('user-guid-123', { tenantId: 'tenant-1' });
  });

  it('does not identify when no user is set', () => {
    const client = createMockClient();

    renderWithProviders(client, { user: null, userInfo: null });

    expect(client.identify).not.toHaveBeenCalled();
  });

  it('does not include tenantId when not available', () => {
    const client = createMockClient();

    renderWithProviders(client, {
      user: { id: 'user-guid-456' },
      userInfo: {},
    });

    expect(client.identify).toHaveBeenCalledWith('user-guid-456', {});
  });
});
