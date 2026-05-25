/**
 * Tests for SafeNotificationBell component.
 *
 * Tests the context-check guard logic:
 * - returns null when NotificationContext is absent (no lazy import triggered)
 *
 * The "renders bell when context is present" case involves React.lazy async rendering
 * which is verified by Playwright E2E tests, not unit tests (per testing philosophy:
 * unit tests focus on logic, E2E tests focus on rendering/user flows).
 */
import React from 'react';

import { render } from '@testing-library/react-native';

import SafeNotificationBell from './SafeNotificationBell';

// Mock the NotificationBellButton to prevent actual import side effects
jest.mock('./NotificationBellButton', () => {
  const MockedComponent = (): React.ReactElement => {
    const ReactNative = require('react-native') as Record<string, unknown>;
    const ViewComponent = ReactNative.View as React.ComponentType<{ testID?: string }>;
    return <ViewComponent testID="mocked-notification-bell" />;
  };
  return { __esModule: true, default: MockedComponent };
});

// Create the mock context inside the factory function
jest.mock('@dloizides/notification-client/react/context', () => {
  const ReactModule = require('react') as { createContext: typeof React.createContext };
  const mockContext = ReactModule.createContext<Record<string, unknown> | null>(null);
  return { NotificationContext: mockContext };
});

// Type for the mocked module
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

    // Component should render nothing when context is null
    expect(toJSON()).toBeNull();
  });

  it('returns null when notification context is undefined (default)', () => {
    // Render without any provider so context defaults to null
    const { toJSON } = render(<SafeNotificationBell />);

    expect(toJSON()).toBeNull();
  });
});
