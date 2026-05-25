/**
 * Unit tests for ContentUploader component.
 * Focus on logic: callbacks, state transitions, error handling.
 */
import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { UploadProgress } from './UploadProgress';
import { TestIds } from '../../../shared/testIds';

// Mock theme
jest.mock('../../../theme/hooks/useTheme', () => ({
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

describe('UploadProgress', () => {
  const mockOnCancel = jest.fn();

  const defaultProps = {
    fileName: 'test-image.jpg',
    progress: 50,
    onCancel: mockOnCancel,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(<UploadProgress {...defaultProps} />);

    const cancelButton = getByTestId(TestIds.UPLOAD_PROGRESS_CANCEL_BUTTON);
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('does not call onCancel when disabled', () => {
    const { getByTestId } = render(<UploadProgress {...defaultProps} disabled />);

    const cancelButton = getByTestId(TestIds.UPLOAD_PROGRESS_CANCEL_BUTTON);
    fireEvent.press(cancelButton);

    // Button is disabled, so onCancel should not be called
    // Note: In React Native, disabled buttons may still fire events but the handler should check
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('displays progress percentage correctly', () => {
    const { getByText } = render(<UploadProgress {...defaultProps} progress={75} />);

    expect(getByText('75%')).toBeTruthy();
  });

  it('clamps progress to 0-100 range', () => {
    const { rerender, getByText } = render(<UploadProgress {...defaultProps} progress={-10} />);
    expect(getByText('0%')).toBeTruthy();

    rerender(<UploadProgress {...defaultProps} progress={150} />);
    expect(getByText('100%')).toBeTruthy();
  });

  it('displays file name', () => {
    const { getByTestId } = render(<UploadProgress {...defaultProps} fileName="my-document.pdf" />);

    const fileNameElement = getByTestId(TestIds.UPLOAD_PROGRESS_FILE_NAME);
    expect(fileNameElement.props.children).toBe('my-document.pdf');
  });
});

describe('UploadProgress callback behavior', () => {
  it('handles rapid cancel button presses', () => {
    const mockOnCancel = jest.fn();
    const { getByTestId } = render(
      <UploadProgress
        disabled={false}
        fileName="test.jpg"
        progress={50}
        onCancel={mockOnCancel}
      />,
    );

    const cancelButton = getByTestId(TestIds.UPLOAD_PROGRESS_CANCEL_BUTTON);

    // Simulate rapid presses
    fireEvent.press(cancelButton);
    fireEvent.press(cancelButton);
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(3);
  });

  it('maintains callback reference across re-renders', () => {
    const mockOnCancel = jest.fn();
    const { rerender, getByTestId } = render(
      <UploadProgress
        disabled={false}
        fileName="test.jpg"
        progress={25}
        onCancel={mockOnCancel}
      />,
    );

    // Re-render with different progress
    rerender(
      <UploadProgress
        disabled={false}
        fileName="test.jpg"
        progress={50}
        onCancel={mockOnCancel}
      />,
    );

    rerender(
      <UploadProgress
        disabled={false}
        fileName="test.jpg"
        progress={75}
        onCancel={mockOnCancel}
      />,
    );

    const cancelButton = getByTestId(TestIds.UPLOAD_PROGRESS_CANCEL_BUTTON);
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
