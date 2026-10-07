import React from 'react';

import { render } from '@testing-library/react-native';

import SafeNotificationBell from './SafeNotificationBell';

jest.mock('./NotificationBellButton', () => {
  const MockedComponent = (): React.ReactElement => {
    const ReactNative = require('react-native') as Record<string, unknown>;
    const ViewComponent = ReactNative.View as React.ComponentType<{ testID?: string }>;
    return <ViewComponent testID="mocked-notification-bell" />;
  };
  return { __esModule: true, default: MockedComponent };
});

jest.mock('@dloizides/notification-client/react/context', () => {
  const ReactModule = require('react') as { createContext: typeof React.createContext };
  const mockContext = ReactModule.createContext<Record<string, unknown> | null>(null);
  return { NotificationContext: mockContext };
});

interface MockedNotificationModule {
  NotificationContext: React.Context<Record<string, unknown> | null>;
}

describe('SafeNotificationBell', () => {
  const getTestContext = (): React.Context<Record<string, unknown> | null> => {
    const mod = require('@dloizides/notification-client/react/context') as MockedNotificationModule;
    return mod.NotificationContext;
  };

  it('returns null when notification context is absent', () => {
    const TestContext = getTestContext();

    const { toJSON } = render(
      <TestContext.Provider value={null}>
        <SafeNotificationBell />
      </TestContext.Provider>,
    );

    expect(toJSON()).toBeNull();
  });

  it('returns null when notification context is undefined (default)', () => {
    const { toJSON } = render(<SafeNotificationBell />);

    expect(toJSON()).toBeNull();
  });
});
