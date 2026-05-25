import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react-native';

import NotificationBellButton from './NotificationBellButton';

// Mock dependencies
const mockPush = jest.fn();
let mockUnreadCount = 0;

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: { text: '#000000' },
      palette: { primary: { '500': '#3b82f6' } },
      mode: 'light',
    },
    mode: 'light',
    toggleMode: jest.fn(),
    setMode: jest.fn(),
    setTenantConfig: jest.fn(),
  }),
}));

jest.mock('@dloizides/notification-client/react/hooks', () => ({
  useUnreadCount: () => mockUnreadCount,
}));

describe('NotificationBellButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUnreadCount = 0;
  });

  it('navigates to notifications screen when pressed', () => {
    render(<NotificationBellButton />);

    const button = screen.getByTestId('notification-bell');
    fireEvent.press(button);

    expect(mockPush).toHaveBeenCalledWith('/(protected)/notifications');
  });

  it('does not show badge when unread count is 0', () => {
    mockUnreadCount = 0;

    render(<NotificationBellButton />);

    const badge = screen.queryByTestId('notification-bell-badge');
    expect(badge).toBeNull();
  });

  it('shows badge when unread count is greater than 0', () => {
    mockUnreadCount = 5;

    render(<NotificationBellButton />);

    const badge = screen.getByTestId('notification-bell-badge');
    expect(badge).toBeTruthy();
  });

  it('displays correct unread count on badge', () => {
    mockUnreadCount = 42;

    render(<NotificationBellButton />);

    const badge = screen.getByTestId('notification-bell-badge');
    expect(badge).toBeTruthy();
  });

  it('displays 99+ when unread count exceeds 99', () => {
    mockUnreadCount = 150;

    render(<NotificationBellButton />);

    const badge = screen.getByTestId('notification-bell-badge');
    expect(badge).toBeTruthy();
    // The badge text should show 99+
  });

  it('has correct accessibility properties', () => {
    render(<NotificationBellButton />);

    const button = screen.getByTestId('notification-bell');
    expect(button.props.accessibilityLabel).toBe('Notifications');
    expect(button.props.accessibilityHint).toBe('Opens the notifications screen');
    expect(button.props.accessibilityRole).toBe('button');
  });
});
