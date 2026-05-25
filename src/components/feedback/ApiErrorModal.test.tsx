import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react-native';

import ApiErrorModal from './ApiErrorModal';

import type { ModalEvent } from '../../lib/api/events/apiEventTypes';

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

describe('ApiErrorModal', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when event is null', () => {
    const { toJSON } = render(
      <ApiErrorModal event={null} onDismiss={mockOnDismiss} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders error modal with correct title for ErrorModal type', () => {
    const event: ModalEvent = {
      type: 'modal',
      modalComponent: 'ErrorModal',
      message: 'Server error occurred',
      severity: 'error' as never,
    };
    render(<ApiErrorModal event={event} onDismiss={mockOnDismiss} />);

    expect(screen.getByTestId('api-error-modal')).toBeTruthy();
    expect(screen.getByText('An error occurred')).toBeTruthy();
    expect(screen.getByText('Server error occurred')).toBeTruthy();
  });

  it('renders maintenance title for MaintenanceModal type', () => {
    const event: ModalEvent = {
      type: 'modal',
      modalComponent: 'MaintenanceModal',
      message: 'Under maintenance',
      severity: 'warning' as never,
    };
    render(<ApiErrorModal event={event} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('The system is currently under maintenance. Please try again later.')).toBeTruthy();
  });

  it('renders upgrade title for UpgradePrompt type', () => {
    const event: ModalEvent = {
      type: 'modal',
      modalComponent: 'UpgradePrompt',
      message: 'Upgrade needed',
      severity: 'warning' as never,
    };
    render(<ApiErrorModal event={event} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('Upgrade your plan to access this feature.')).toBeTruthy();
  });

  it('renders feature gate title for FeatureGateModal type', () => {
    const event: ModalEvent = {
      type: 'modal',
      modalComponent: 'FeatureGateModal',
      message: 'Not available',
      severity: 'info' as never,
    };
    render(<ApiErrorModal event={event} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('This feature is not available on your current plan.')).toBeTruthy();
  });

  it('calls onDismiss when close button is pressed', () => {
    const event: ModalEvent = {
      type: 'modal',
      modalComponent: 'ErrorModal',
      message: 'Test',
      severity: 'error' as never,
    };
    render(<ApiErrorModal event={event} onDismiss={mockOnDismiss} />);

    const closeButton = screen.getByTestId('api-error-modal-close');
    fireEvent.press(closeButton);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });
});
