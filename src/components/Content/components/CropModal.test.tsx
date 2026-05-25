/**
 * Unit tests for CropModal component.
 * Tests logic: apply/cancel callbacks, disabled apply when no crop area.
 */
import React from 'react';

import { Platform } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';

import CropModal from './CropModal';
import AspectRatioPreset from '../../../shared/enums/AspectRatioPreset';
import { TestIds } from '../../../shared/testIds';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('react-easy-crop', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: { text: '#001219', surface: '#f7f7f7', border: '#e6e6e6', background: '#ffffff', textSecondary: '#555555' },
      palette: { primary: { '500': '#005f73' } },
      semantic: { error: { '500': '#ae2012' } },
    },
  }),
}));

jest.mock('@/localization/helpers', () => ({
  FM: (key: string) => key,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CropModal', () => {
  const defaultProps = {
    visible: true,
    imageUri: 'file:///test/image.jpg',
    aspectPreset: AspectRatioPreset.Square,
    aspectRatio: 1,
    onAspectChange: jest.fn(),
    onApply: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { get: () => 'web', configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(<CropModal {...defaultProps} />);
    const cancelButton = getByTestId(TestIds.CROP_MODAL_CANCEL);
    fireEvent.press(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not call onApply when croppedArea is null', () => {
    const { getByTestId } = render(<CropModal {...defaultProps} />);
    const applyButton = getByTestId(TestIds.CROP_MODAL_APPLY);
    fireEvent.press(applyButton);

    expect(defaultProps.onApply).not.toHaveBeenCalled();
  });

  it('renders aspect ratio selector buttons', () => {
    const { getByTestId } = render(<CropModal {...defaultProps} />);

    expect(getByTestId(TestIds.CROP_ASPECT_SQUARE)).toBeTruthy();
    expect(getByTestId(TestIds.CROP_ASPECT_LANDSCAPE)).toBeTruthy();
    expect(getByTestId(TestIds.CROP_ASPECT_CLASSIC)).toBeTruthy();
    expect(getByTestId(TestIds.CROP_ASPECT_FREE)).toBeTruthy();
  });

  it('returns null on non-web platform', () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });
    const { toJSON } = render(<CropModal {...defaultProps} />);

    expect(toJSON()).toBeNull();
  });
});
