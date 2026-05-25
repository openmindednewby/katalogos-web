import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';


import MediaPositionEditor, {
  FIT_OPTION_COUNT,
  FIT_OPTIONS,
  POSITION_OPTION_COUNT,
  POSITION_OPTIONS,
  SIZE_OPTION_COUNT,
  SIZE_OPTIONS,
} from './MediaPositionEditor';
import MediaFit from '../../../../types/enums/MediaFit';
import MediaPosition from '../../../../types/enums/MediaPosition';
import MediaSize from '../../../../types/enums/MediaSize';

import type { MediaSettings } from '../../../../types/menuStyleTypes';

// Mock dependencies
jest.mock('react-redux', () => ({
  useSelector: () => 'light',
}));

// Mock slider since native modules are not available in tests
jest.mock('@react-native-community/slider', () => {
   
  const ReactMock = require('react');
   
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({
      testID,
      value,
      onValueChange,
      disabled,
      accessibilityLabel,
      accessibilityHint,
    }: {
      testID: string;
      value: number;
      onValueChange: (value: number) => void;
      disabled: boolean;
      accessibilityLabel: string;
      accessibilityHint: string;
    }) =>
      ReactMock.createElement(View, {
        testID,
        value,
        accessibilityLabel,
        accessibilityHint,
        disabled,
        onValueChange,
        onResponderRelease: () => onValueChange(value + 1),
      }),
  };
});

describe('MediaPositionEditor', () => {
  const mockOnChange = jest.fn();

  const defaultValue: MediaSettings = {
    position: MediaPosition.Left,
    size: MediaSize.Medium,
    fit: MediaFit.Cover,
    borderRadius: 8,
  };

  const defaultProps = {
    value: defaultValue,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders container with correct testID', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      expect(getByTestId('media-position-editor')).toBeTruthy();
    });

    it('renders show/hide toggle', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      expect(getByTestId('media-show-toggle')).toBeTruthy();
    });

    it('renders preview when image is visible', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      expect(getByTestId('media-preview')).toBeTruthy();
    });

    it('renders all position option buttons', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      expect(getByTestId('media-position-button-left')).toBeTruthy();
      expect(getByTestId('media-position-button-right')).toBeTruthy();
      expect(getByTestId('media-position-button-top')).toBeTruthy();
      expect(getByTestId('media-position-button-bottom')).toBeTruthy();
      expect(getByTestId('media-position-button-background')).toBeTruthy();
    });

    it('renders all size option buttons', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      expect(getByTestId('media-size-button-small')).toBeTruthy();
      expect(getByTestId('media-size-button-medium')).toBeTruthy();
      expect(getByTestId('media-size-button-large')).toBeTruthy();
      expect(getByTestId('media-size-button-full')).toBeTruthy();
    });

    it('renders all fit option buttons', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      expect(getByTestId('media-fit-button-cover')).toBeTruthy();
      expect(getByTestId('media-fit-button-contain')).toBeTruthy();
      expect(getByTestId('media-fit-button-fill')).toBeTruthy();
    });

    it('renders border radius slider', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      expect(getByTestId('media-border-radius-slider')).toBeTruthy();
    });

    it('does not render position/size/fit controls when image is hidden', () => {
      const hiddenValue: MediaSettings = { ...defaultValue, position: MediaPosition.None };
      const { queryByTestId } = render(<MediaPositionEditor {...defaultProps} value={hiddenValue} />);

      expect(queryByTestId('media-position-button-left')).toBeNull();
      expect(queryByTestId('media-size-button-medium')).toBeNull();
      expect(queryByTestId('media-fit-button-cover')).toBeNull();
      expect(queryByTestId('media-border-radius-slider')).toBeNull();
    });

    it('still renders toggle when image is hidden', () => {
      const hiddenValue: MediaSettings = { ...defaultValue, position: MediaPosition.None };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={hiddenValue} />);

      expect(getByTestId('media-show-toggle')).toBeTruthy();
    });
  });

  describe('position selection behavior', () => {
    it('calls onChange with left position when left is pressed', () => {
      const rightValue: MediaSettings = { ...defaultValue, position: MediaPosition.Right };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={rightValue} />);

      fireEvent.press(getByTestId('media-position-button-left'));

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith({ ...rightValue, position: 'left' });
    });

    it('calls onChange with right position when right is pressed', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      fireEvent.press(getByTestId('media-position-button-right'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, position: 'right' });
    });

    it('calls onChange with top position when top is pressed', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      fireEvent.press(getByTestId('media-position-button-top'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, position: 'top' });
    });

    it('calls onChange with bottom position when bottom is pressed', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      fireEvent.press(getByTestId('media-position-button-bottom'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, position: 'bottom' });
    });

    it('calls onChange with background position when background is pressed', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      fireEvent.press(getByTestId('media-position-button-background'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, position: 'background' });
    });
  });

  describe('size selection behavior', () => {
    it('calls onChange with small size when small is pressed', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      fireEvent.press(getByTestId('media-size-button-small'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, size: 'small' });
    });

    it('calls onChange with medium size when medium is pressed', () => {
      const smallValue: MediaSettings = { ...defaultValue, size: MediaSize.Small };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={smallValue} />);

      fireEvent.press(getByTestId('media-size-button-medium'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...smallValue, size: 'medium' });
    });

    it('calls onChange with large size when large is pressed', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      fireEvent.press(getByTestId('media-size-button-large'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, size: 'large' });
    });

    it('calls onChange with full size when full is pressed', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      fireEvent.press(getByTestId('media-size-button-full'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, size: 'full' });
    });
  });

  describe('fit selection behavior', () => {
    it('calls onChange with cover fit when cover is pressed', () => {
      const containValue: MediaSettings = { ...defaultValue, fit: MediaFit.Contain };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={containValue} />);

      fireEvent.press(getByTestId('media-fit-button-cover'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...containValue, fit: 'cover' });
    });

    it('calls onChange with contain fit when contain is pressed', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      fireEvent.press(getByTestId('media-fit-button-contain'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, fit: 'contain' });
    });

    it('calls onChange with fill fit when fill is pressed', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      fireEvent.press(getByTestId('media-fit-button-fill'));

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, fit: 'fill' });
    });
  });

  describe('border radius slider behavior', () => {
    it('calls onChange when slider value changes', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const slider = getByTestId('media-border-radius-slider');
      // Simulate slider change via the onValueChange prop
      slider.props.onValueChange(12);

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, borderRadius: 12 });
    });

    it('rounds border radius to nearest integer', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const slider = getByTestId('media-border-radius-slider');
      slider.props.onValueChange(12.7);

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, borderRadius: 13 });
    });
  });

  describe('show/hide toggle behavior', () => {
    it('calls onChange with position: none when toggle is turned off', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const toggle = getByTestId('media-show-toggle');
      fireEvent(toggle, 'onValueChange', false);

      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, position: 'none' });
    });

    it('calls onChange with position: left when toggle is turned on', () => {
      const hiddenValue: MediaSettings = { ...defaultValue, position: MediaPosition.None };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={hiddenValue} />);

      const toggle = getByTestId('media-show-toggle');
      fireEvent(toggle, 'onValueChange', true);

      expect(mockOnChange).toHaveBeenCalledWith({ ...hiddenValue, position: 'left' });
    });

    it('toggle reflects image visibility state when visible', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const toggle = getByTestId('media-show-toggle');
      expect(toggle.props.value).toBe(true);
    });

    it('toggle reflects image visibility state when hidden', () => {
      const hiddenValue: MediaSettings = { ...defaultValue, position: MediaPosition.None };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={hiddenValue} />);

      const toggle = getByTestId('media-show-toggle');
      expect(toggle.props.value).toBe(false);
    });
  });

  describe('disabled state', () => {
    it('does not call onChange for position when disabled', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} disabled />);

      fireEvent.press(getByTestId('media-position-button-right'));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not call onChange for size when disabled', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} disabled />);

      fireEvent.press(getByTestId('media-size-button-large'));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not call onChange for fit when disabled', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} disabled />);

      fireEvent.press(getByTestId('media-fit-button-contain'));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not call onChange for border radius when disabled', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} disabled />);

      const slider = getByTestId('media-border-radius-slider');
      slider.props.onValueChange(12);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not call onChange for toggle when disabled', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} disabled />);

      const toggle = getByTestId('media-show-toggle');
      fireEvent(toggle, 'onValueChange', false);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('position buttons have correct accessibility role', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const leftButton = getByTestId('media-position-button-left');
      expect(leftButton.props.accessibilityRole).toBe('button');
    });

    it('position buttons have accessibilityLabel', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const leftButton = getByTestId('media-position-button-left');
      expect(leftButton.props.accessibilityLabel).toBe('Left');
    });

    it('position buttons have accessibilityHint', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const leftButton = getByTestId('media-position-button-left');
      expect(leftButton.props.accessibilityHint).toBe('Select Left');
    });

    it('position buttons show selected state in accessibility', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const leftButton = getByTestId('media-position-button-left');
      const rightButton = getByTestId('media-position-button-right');

      expect(leftButton.props.accessibilityState.selected).toBe(true);
      expect(rightButton.props.accessibilityState.selected).toBe(false);
    });

    it('position buttons show disabled state in accessibility', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} disabled />);

      const leftButton = getByTestId('media-position-button-left');
      expect(leftButton.props.accessibilityState.disabled).toBe(true);
    });

    it('toggle has accessibilityLabel', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const toggle = getByTestId('media-show-toggle');
      expect(toggle.props.accessibilityLabel).toBe('Show Image');
    });

    it('toggle has accessibilityHint', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const toggle = getByTestId('media-show-toggle');
      expect(toggle.props.accessibilityHint).toBe('Toggle image visibility');
    });

    it('slider has accessibilityLabel', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const slider = getByTestId('media-border-radius-slider');
      expect(slider.props.accessibilityLabel).toBe('Border Radius');
    });

    it('slider has accessibilityHint', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      const slider = getByTestId('media-border-radius-slider');
      expect(slider.props.accessibilityHint).toBe('Set the border radius');
    });
  });

  describe('selection state indication', () => {
    it('updates position selection when value prop changes', () => {
      const { getByTestId, rerender } = render(<MediaPositionEditor {...defaultProps} />);

      let leftButton = getByTestId('media-position-button-left');
      expect(leftButton.props.accessibilityState.selected).toBe(true);

      const rightValue: MediaSettings = { ...defaultValue, position: MediaPosition.Right };
      rerender(<MediaPositionEditor {...defaultProps} value={rightValue} />);

      leftButton = getByTestId('media-position-button-left');
      const rightButton = getByTestId('media-position-button-right');

      expect(leftButton.props.accessibilityState.selected).toBe(false);
      expect(rightButton.props.accessibilityState.selected).toBe(true);
    });

    it('updates size selection when value prop changes', () => {
      const { getByTestId, rerender } = render(<MediaPositionEditor {...defaultProps} />);

      let mediumButton = getByTestId('media-size-button-medium');
      expect(mediumButton.props.accessibilityState.selected).toBe(true);

      const largeValue: MediaSettings = { ...defaultValue, size: MediaSize.Large };
      rerender(<MediaPositionEditor {...defaultProps} value={largeValue} />);

      mediumButton = getByTestId('media-size-button-medium');
      const largeButton = getByTestId('media-size-button-large');

      expect(mediumButton.props.accessibilityState.selected).toBe(false);
      expect(largeButton.props.accessibilityState.selected).toBe(true);
    });

    it('updates fit selection when value prop changes', () => {
      const { getByTestId, rerender } = render(<MediaPositionEditor {...defaultProps} />);

      let coverButton = getByTestId('media-fit-button-cover');
      expect(coverButton.props.accessibilityState.selected).toBe(true);

      const containValue: MediaSettings = { ...defaultValue, fit: MediaFit.Contain };
      rerender(<MediaPositionEditor {...defaultProps} value={containValue} />);

      coverButton = getByTestId('media-fit-button-cover');
      const containButton = getByTestId('media-fit-button-contain');

      expect(coverButton.props.accessibilityState.selected).toBe(false);
      expect(containButton.props.accessibilityState.selected).toBe(true);
    });
  });

  describe('preview updates', () => {
    it('renders preview for left position', () => {
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} />);

      expect(getByTestId('media-preview')).toBeTruthy();
    });

    it('renders preview for background position', () => {
      const bgValue: MediaSettings = { ...defaultValue, position: MediaPosition.Background };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={bgValue} />);

      expect(getByTestId('media-preview')).toBeTruthy();
    });

    it('renders hidden state in preview when position is none', () => {
      const hiddenValue: MediaSettings = { ...defaultValue, position: MediaPosition.None };
      const { queryByTestId } = render(<MediaPositionEditor {...defaultProps} value={hiddenValue} />);

      // Preview should not exist when hidden
      expect(queryByTestId('media-preview')).toBeNull();
    });
  });

  describe('option constants', () => {
    it('POSITION_OPTIONS contains all required position IDs', () => {
      const positionIds = POSITION_OPTIONS.map((o) => o.id);

      expect(positionIds).toContain('left');
      expect(positionIds).toContain('right');
      expect(positionIds).toContain('top');
      expect(positionIds).toContain('bottom');
      expect(positionIds).toContain('background');
    });

    it('has correct number of position options', () => {
      expect(POSITION_OPTIONS).toHaveLength(POSITION_OPTION_COUNT);
    });

    it('SIZE_OPTIONS contains all required size IDs', () => {
      const sizeIds = SIZE_OPTIONS.map((o) => o.id);

      expect(sizeIds).toContain('small');
      expect(sizeIds).toContain('medium');
      expect(sizeIds).toContain('large');
      expect(sizeIds).toContain('full');
    });

    it('has correct number of size options', () => {
      expect(SIZE_OPTIONS).toHaveLength(SIZE_OPTION_COUNT);
    });

    it('FIT_OPTIONS contains all required fit IDs', () => {
      const fitIds = FIT_OPTIONS.map((o) => o.id);

      expect(fitIds).toContain('cover');
      expect(fitIds).toContain('contain');
      expect(fitIds).toContain('fill');
    });

    it('has correct number of fit options', () => {
      expect(FIT_OPTIONS).toHaveLength(FIT_OPTION_COUNT);
    });

    it('each position option has required properties', () => {
      for (const option of POSITION_OPTIONS) {
        expect(option.id).toBeDefined();
        expect(option.labelKey).toBeDefined();
        expect(option.icon).toBeDefined();
      }
    });

    it('each size option has required properties', () => {
      for (const option of SIZE_OPTIONS) {
        expect(option.id).toBeDefined();
        expect(option.labelKey).toBeDefined();
      }
    });

    it('each fit option has required properties', () => {
      for (const option of FIT_OPTIONS) {
        expect(option.id).toBeDefined();
        expect(option.labelKey).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    it('handles undefined borderRadius', () => {
      const noRadiusValue: MediaSettings = { position: MediaPosition.Left, size: MediaSize.Medium, fit: MediaFit.Cover };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={noRadiusValue} />);

      const slider = getByTestId('media-border-radius-slider');
      expect(slider.props.value).toBe(0);
    });

    it('handles undefined position gracefully', () => {
      const noPositionValue: MediaSettings = { size: MediaSize.Medium, fit: MediaFit.Cover };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={noPositionValue} />);

      // Should still render since position defaults to being visible
      expect(getByTestId('media-position-editor')).toBeTruthy();
    });

    it('handles undefined size gracefully', () => {
      const noSizeValue: MediaSettings = { position: MediaPosition.Left, fit: MediaFit.Cover };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={noSizeValue} />);

      // All size buttons should be visible
      expect(getByTestId('media-size-button-small')).toBeTruthy();
    });

    it('handles undefined fit gracefully', () => {
      const noFitValue: MediaSettings = { position: MediaPosition.Left, size: MediaSize.Medium };
      const { getByTestId } = render(<MediaPositionEditor {...defaultProps} value={noFitValue} />);

      // All fit buttons should be visible
      expect(getByTestId('media-fit-button-cover')).toBeTruthy();
    });
  });
});
