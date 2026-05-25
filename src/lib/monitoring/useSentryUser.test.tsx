import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { useSentryUser } from './useSentryUser';

const mockSetSentryUser = jest.fn().mockResolvedValue(undefined);
const mockClearSentryUser = jest.fn().mockResolvedValue(undefined);

jest.mock('./sentry', () => ({
  setSentryUser: (...args: unknown[]) => mockSetSentryUser(...args),
  clearSentryUser: (...args: unknown[]) => mockClearSentryUser(...args),
}));

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

function renderWithStore(authState: Record<string, unknown>): ReturnType<typeof renderHook> {
  const store = createStore(authState);
  const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useSentryUser(), { wrapper });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSentryUser', () => {
  it('sets sentry user when auth state has a user', () => {
    renderWithStore({
      user: { id: 'user-guid-123' },
      userInfo: { tenantId: 'tenant-1' },
    });

    expect(mockSetSentryUser).toHaveBeenCalledWith('user-guid-123', 'tenant-1');
  });

  it('does not set user when auth state is empty', () => {
    renderWithStore({ user: null, userInfo: null });

    expect(mockSetSentryUser).not.toHaveBeenCalled();
    expect(mockClearSentryUser).not.toHaveBeenCalled();
  });

  it('passes undefined tenantId when userInfo has no tenantId', () => {
    renderWithStore({
      user: { id: 'user-guid-456' },
      userInfo: {},
    });

    expect(mockSetSentryUser).toHaveBeenCalledWith('user-guid-456', undefined);
  });
});
