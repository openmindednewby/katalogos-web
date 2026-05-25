/**
 * Tests for NotificationPermissionBanner component.
 *
 * Unit tests focus on callback behavior and state management logic.
 * Visual testing is done via Playwright E2E tests.
 */

// Mock the notification service module with inline functions
// This avoids Jest hoisting issues with external variable references
// Import after mocks are set up
import React from 'react';

import { osNotificationService } from '@dloizides/notification-client/workers';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';


import NotificationPermissionBanner from './NotificationPermissionBanner';
import { TestIds } from '../../shared/testIds';

jest.mock('@dloizides/notification-client/workers', () => ({
  osNotificationService: {
    isSupported: jest.fn().mockReturnValue(true),
    getPermissionStatus: jest.fn().mockReturnValue('default'),
    requestPermission: jest.fn().mockResolvedValue('granted'),
    initialize: jest.fn().mockResolvedValue(true),
    showNotification: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: { text: '#001219', textSecondary: '#555555', background: '#ffffff', surface: '#f7f7f7', surfaceElevated: '#ffffff', border: '#e6e6e6', divider: '#eeeeee' },
      palette: { primary: { '500': '#005f73' }, secondary: { '500': '#94d2bd' }, accent: { '500': '#ee9b00' } },
      semantic: { success: { '500': '#2d6a4f' }, warning: { '500': '#ee9b00' }, error: { '500': '#ae2012' }, info: { '500': '#005f73' } },
      typography: { fontFamily: 'System', headingScale: 1.25 },
      mode: 'light',
      branding: { logoUrl: null, faviconUrl: null },
    },
    mode: 'light',
    toggleMode: jest.fn(),
    setMode: jest.fn(),
    setTenantConfig: jest.fn(),
  }),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Get typed references to mock functions
const mockIsSupported = osNotificationService.isSupported as jest.Mock;
const mockGetPermissionStatus = osNotificationService.getPermissionStatus as jest.Mock;
const mockRequestPermission = osNotificationService.requestPermission as jest.Mock;

describe('NotificationPermissionBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default state
    mockIsSupported.mockReturnValue(true);
    mockGetPermissionStatus.mockReturnValue('default');
    mockRequestPermission.mockResolvedValue('granted');
  });

  describe('visibility', () => {
    it('renders banner when permission is default', async () => {
      render(<NotificationPermissionBanner />);

      await waitFor(() => {
        const banner = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeTruthy();
      });
    });

    it('does not render when permission is granted', async () => {
      mockGetPermissionStatus.mockReturnValue('granted');

      render(<NotificationPermissionBanner />);

      await waitFor(() => {
        const banner = screen.queryByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeNull();
      });
    });

    it('does not render when permission is denied', async () => {
      mockGetPermissionStatus.mockReturnValue('denied');

      render(<NotificationPermissionBanner />);

      await waitFor(() => {
        const banner = screen.queryByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeNull();
      });
    });

    it('does not render when notifications are not supported', async () => {
      mockIsSupported.mockReturnValue(false);

      render(<NotificationPermissionBanner />);

      await waitFor(() => {
        const banner = screen.queryByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeNull();
      });
    });
  });

  describe('enable button', () => {
    it('calls requestPermission when Enable button is pressed', async () => {
      render(<NotificationPermissionBanner />);

      await waitFor(() => {
        const enableButton = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_ENABLE_BUTTON);
        expect(enableButton).toBeTruthy();
      });

      const enableButton = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_ENABLE_BUTTON);
      fireEvent.press(enableButton);

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalledTimes(1);
      });
    });

    it('hides banner after permission is granted', async () => {
      mockRequestPermission.mockResolvedValue('granted');

      render(<NotificationPermissionBanner />);

      await waitFor(() => {
        const banner = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeTruthy();
      });

      const enableButton = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_ENABLE_BUTTON);
      await act(async () => {
        fireEvent.press(enableButton);
      });

      await waitFor(() => {
        const banner = screen.queryByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeNull();
      });
    });

    it('hides banner after permission is denied', async () => {
      mockRequestPermission.mockResolvedValue('denied');

      render(<NotificationPermissionBanner />);

      await waitFor(() => {
        const banner = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeTruthy();
      });

      const enableButton = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_ENABLE_BUTTON);
      await act(async () => {
        fireEvent.press(enableButton);
      });

      await waitFor(() => {
        const banner = screen.queryByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeNull();
      });
    });
  });

  describe('later button', () => {
    it('hides banner when Later button is pressed', async () => {
      render(<NotificationPermissionBanner />);

      await waitFor(() => {
        const laterButton = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_LATER_BUTTON);
        expect(laterButton).toBeTruthy();
      });

      const laterButton = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_LATER_BUTTON);
      fireEvent.press(laterButton);

      await waitFor(() => {
        const banner = screen.queryByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeNull();
      });
    });

    it('does not call requestPermission when Later is pressed', async () => {
      render(<NotificationPermissionBanner />);

      await waitFor(() => {
        const laterButton = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_LATER_BUTTON);
        expect(laterButton).toBeTruthy();
      });

      const laterButton = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_LATER_BUTTON);
      fireEvent.press(laterButton);

      expect(mockRequestPermission).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('hides banner when requestPermission throws error', async () => {
      mockRequestPermission.mockRejectedValue(new Error('Permission error'));

      render(<NotificationPermissionBanner />);

      await waitFor(() => {
        const banner = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeTruthy();
      });

      const enableButton = screen.getByTestId(TestIds.NOTIFICATION_PERMISSION_ENABLE_BUTTON);
      await act(async () => {
        fireEvent.press(enableButton);
      });

      await waitFor(() => {
        const banner = screen.queryByTestId(TestIds.NOTIFICATION_PERMISSION_BANNER);
        expect(banner).toBeNull();
      });
    });
  });
});
