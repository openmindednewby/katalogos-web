/**
 * Tests for RealTimeNotificationProvider — BFF era.
 *
 * Post-BFF-cutover the SPA holds no access token, so the SignalR
 * `NotificationProvider` is no longer mounted (its hub WebSocket needs a
 * Bearer the SPA cannot supply). The provider now always renders its
 * children; `TestApiRegistration` mounts only when there is a BFF session.
 */

// All mocks MUST be declared before imports for Jest hoisting to work correctly
import React from 'react';

import { Text } from 'react-native';

import { render, screen } from '@testing-library/react-native';

import RealTimeNotificationProvider from './RealTimeNotificationProvider';
import { useAuth } from '../../auth/AuthProvider';

jest.mock('@dloizides/notification-client/workers', () => ({
  osNotificationService: {
    initialize: jest.fn().mockResolvedValue(true),
    showNotification: jest.fn().mockResolvedValue(true),
    isSupported: jest.fn().mockReturnValue(true),
    hasPermission: jest.fn().mockReturnValue(false),
    getPermissionStatus: jest.fn().mockReturnValue('default'),
    requestPermission: jest.fn().mockResolvedValue('granted'),
  },
}));

// Mock service worker registration - MUST be before imports
jest.mock('../../lib/notifications', () => ({
  registerNotificationServiceWorker: jest.fn().mockResolvedValue(null),
  onServiceWorkerMessage: jest.fn().mockReturnValue(() => {}),
  isNotificationClickedMessage: jest.fn().mockReturnValue(false),
  ServiceWorkerMessageType: {
    NotificationClicked: 'NOTIFICATION_CLICKED',
    NotificationClosed: 'NOTIFICATION_CLOSED',
  },
  registerNotificationStore: jest.fn(),
  unregisterNotificationStore: jest.fn(),
}));

jest.mock('../../auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockUseAuth = useAuth as jest.Mock;

describe('RealTimeNotificationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ isLoggedIn: false });
  });

  it('renders its children when there is no BFF session', () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: false });

    render(
      <RealTimeNotificationProvider>
        <Text testID="child-element">Test Child</Text>
      </RealTimeNotificationProvider>,
    );

    expect(screen.getByTestId('child-element')).toBeTruthy();
  });

  it('renders its children when there is a BFF session', () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: true });

    render(
      <RealTimeNotificationProvider>
        <Text testID="child-element">Test Child</Text>
      </RealTimeNotificationProvider>,
    );

    expect(screen.getByTestId('child-element')).toBeTruthy();
  });

  it('does NOT mount a SignalR NotificationProvider (no token post-BFF-cutover)', () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: true });

    render(
      <RealTimeNotificationProvider>
        <Text testID="child-element">Test Child</Text>
      </RealTimeNotificationProvider>,
    );

    expect(screen.queryByTestId('notification-provider')).toBeNull();
  });
});
