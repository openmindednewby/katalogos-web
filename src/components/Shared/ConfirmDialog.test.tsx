import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react-native';

import ConfirmDialog from './ConfirmDialog';

// Mock useTheme
jest.mock('../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#ffffff',
        surface: '#f7f7f7',
        surfaceElevated: '#ffffff',
        text: '#001219',
        textSecondary: '#777777',
        border: '#e6e6e6',
        divider: '#e6e6e6',
      },
      palette: {
        primary: { '500': '#005f73' },
        secondary: { '500': '#94d2bd' },
        accent: { '500': '#008d5c' },
      },
      semantic: {
        success: { '500': '#0a9396' },
        warning: { '500': '#ee9b00' },
        error: { '500': '#ae2012' },
        info: { '500': '#005f73' },
      },
    },
    mode: 'light',
  }),
}));

describe('ConfirmDialog', () => {
  const defaultProps = {
    visible: true,
    title: 'Delete Items',
    message: 'Are you sure you want to delete all items?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog with title and message when visible', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Delete Items')).toBeTruthy();
    expect(screen.getByText('Are you sure you want to delete all items?')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    render(<ConfirmDialog {...defaultProps} visible={false} />);

    expect(screen.queryByText('Delete Items')).toBeNull();
  });

  it('calls onConfirm when confirm button is pressed', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.press(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const cancelButton = screen.getByTestId('cancel-confirm-button');
    fireEvent.press(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders custom confirm and cancel labels', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        cancelLabel="No, Keep"
        confirmLabel="Yes, Delete"
      />
    );

    expect(screen.getByText('Yes, Delete')).toBeTruthy();
    expect(screen.getByText('No, Keep')).toBeTruthy();
  });

  it('uses default labels from translations when not provided', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Confirm')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('disables confirm button when confirmDisabled is true', () => {
    render(<ConfirmDialog {...defaultProps} confirmDisabled />);

    const confirmButton = screen.getByTestId('confirm-button');
    // In React Native, disabled state is checked via accessibility
    expect(confirmButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('shows loading state on confirm button when loading is true', () => {
    render(<ConfirmDialog {...defaultProps} loading />);

    // When loading, there should be an activity indicator
    expect(screen.getByTestId('confirm-loading')).toBeTruthy();
  });

  it('has correct testID on dialog container', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByTestId('confirm-dialog')).toBeTruthy();
  });
});
