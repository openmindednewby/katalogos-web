import React from 'react';

import type { ViewStyle } from 'react-native';

import { isValueDefined } from '@dloizides/utils';
import { fireEvent, render } from '@testing-library/react-native';

import BoxStyleEditor from './BoxStyleEditor';

import type { BoxStyling } from '../../../../types/menuStyleTypes';

// Mock dependencies
jest.mock('react-redux', () => ({
  useSelector: () => 'light',
}));

/**
 * Helper to flatten style prop from React Native components.
 * Handles both single style objects and arrays of styles.
 */
function flattenStyle(style: ViewStyle | ViewStyle[] | undefined): ViewStyle {
  if (!isValueDefined(style)) return {};
  if (!Array.isArray(style)) return style;

  const result: ViewStyle = {};
  for (const s of style)
    if (isValueDefined(s)) Object.assign(result, s);

  return result;
}

describe('BoxStyleEditor', () => {
  const mockOnChange = jest.fn();

  const defaultValue: BoxStyling = {
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    shadowEnabled: false,
  };

  const defaultProps = {
    value: defaultValue,
    onChange: mockOnChange,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the component with all controls', () => {
      const { getByTestId, getByText } = render(<BoxStyleEditor {...defaultProps} />);

      expect(getByTestId('box-style-editor')).toBeTruthy();
      expect(getByTestId('box-style-preview')).toBeTruthy();
      expect(getByText('Box Style')).toBeTruthy();
    });

    it('renders custom label when provided', () => {
      const { getByText } = render(
        <BoxStyleEditor {...defaultProps} label="Category Box" />,
      );

      expect(getByText('Category Box')).toBeTruthy();
    });

    it('displays the preview section', () => {
      const { getByText, getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      expect(getByText('Preview')).toBeTruthy();
      expect(getByTestId('box-style-preview')).toBeTruthy();
      expect(getByText('Sample text to preview box style')).toBeTruthy();
    });

    it('renders border color input', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      expect(getByTestId('box-style-border-color-input')).toBeTruthy();
      expect(getByTestId('box-style-border-color-swatch')).toBeTruthy();
    });

    it('renders slider controls for border width, radius, and padding', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      expect(getByTestId('box-style-border-width-slider-slider')).toBeTruthy();
      expect(getByTestId('box-style-border-radius-slider-slider')).toBeTruthy();
      expect(getByTestId('box-style-padding-slider-slider')).toBeTruthy();
    });

    it('renders shadow toggle', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      expect(getByTestId('box-style-shadow-toggle')).toBeTruthy();
    });
  });

  describe('border color input', () => {
    it('displays current border color value', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const input = getByTestId('box-style-border-color-input');
      expect(input.props.value).toBe('#E0E0E0');
    });

    it('calls onChange when border color is changed', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const input = getByTestId('box-style-border-color-input');
      fireEvent.changeText(input, '#FF0000');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        borderColor: '#FF0000',
      });
    });

    it('shows error for invalid hex color', () => {
      const { getByTestId, queryByText } = render(<BoxStyleEditor {...defaultProps} />);

      const input = getByTestId('box-style-border-color-input');
      fireEvent.changeText(input, 'invalid');

      expect(queryByText('Invalid hex color')).toBeTruthy();
    });

    it('clears error when valid color is entered', () => {
      const { getByTestId, queryByText } = render(<BoxStyleEditor {...defaultProps} />);

      const input = getByTestId('box-style-border-color-input');

      fireEvent.changeText(input, 'invalid');
      expect(queryByText('Invalid hex color')).toBeTruthy();

      fireEvent.changeText(input, '#FF0000');
      expect(queryByText('Invalid hex color')).toBeNull();
    });

    it('accepts empty color value without error', () => {
      const { getByTestId, queryByText } = render(<BoxStyleEditor {...defaultProps} />);

      const input = getByTestId('box-style-border-color-input');
      fireEvent.changeText(input, '');

      expect(queryByText('Invalid hex color')).toBeNull();
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        borderColor: '',
      });
    });
  });

  describe('border width slider', () => {
    it('displays current border width value', () => {
      const { getByText } = render(<BoxStyleEditor {...defaultProps} />);

      expect(getByText('2px')).toBeTruthy();
    });

    it('calls onChange when increase button is pressed', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const increaseButton = getByTestId('box-style-border-width-slider-increase');
      fireEvent.press(increaseButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        borderWidth: 3,
      });
    });

    it('calls onChange when decrease button is pressed', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const decreaseButton = getByTestId('box-style-border-width-slider-decrease');
      fireEvent.press(decreaseButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        borderWidth: 1,
      });
    });

    it('does not decrease below minimum (0)', () => {
      const valueAtMin: BoxStyling = { ...defaultValue, borderWidth: 0 };
      const { getByTestId } = render(
        <BoxStyleEditor {...defaultProps} value={valueAtMin} />,
      );

      const decreaseButton = getByTestId('box-style-border-width-slider-decrease');
      fireEvent.press(decreaseButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not increase above maximum (4)', () => {
      const valueAtMax: BoxStyling = { ...defaultValue, borderWidth: 4 };
      const { getByTestId } = render(
        <BoxStyleEditor {...defaultProps} value={valueAtMax} />,
      );

      const increaseButton = getByTestId('box-style-border-width-slider-increase');
      fireEvent.press(increaseButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('border radius slider', () => {
    it('calls onChange when increase button is pressed', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const increaseButton = getByTestId('box-style-border-radius-slider-increase');
      fireEvent.press(increaseButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        borderRadius: 10,
      });
    });

    it('calls onChange when decrease button is pressed', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const decreaseButton = getByTestId('box-style-border-radius-slider-decrease');
      fireEvent.press(decreaseButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        borderRadius: 6,
      });
    });

    it('respects maximum value (24)', () => {
      const valueAtMax: BoxStyling = { ...defaultValue, borderRadius: 24 };
      const { getByTestId } = render(
        <BoxStyleEditor {...defaultProps} value={valueAtMax} />,
      );

      const increaseButton = getByTestId('box-style-border-radius-slider-increase');
      fireEvent.press(increaseButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('padding slider', () => {
    it('calls onChange when increase button is pressed', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const increaseButton = getByTestId('box-style-padding-slider-increase');
      fireEvent.press(increaseButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        padding: 20,
      });
    });

    it('calls onChange when decrease button is pressed', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const decreaseButton = getByTestId('box-style-padding-slider-decrease');
      fireEvent.press(decreaseButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        padding: 12,
      });
    });

    it('respects maximum value (32)', () => {
      const valueAtMax: BoxStyling = { ...defaultValue, padding: 32 };
      const { getByTestId } = render(
        <BoxStyleEditor {...defaultProps} value={valueAtMax} />,
      );

      const increaseButton = getByTestId('box-style-padding-slider-increase');
      fireEvent.press(increaseButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('shadow toggle', () => {
    it('displays current shadow state (disabled)', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const toggle = getByTestId('box-style-shadow-toggle');
      expect(toggle.props.value).toBe(false);
    });

    it('displays current shadow state (enabled)', () => {
      const valueWithShadow: BoxStyling = { ...defaultValue, shadowEnabled: true };
      const { getByTestId } = render(
        <BoxStyleEditor {...defaultProps} value={valueWithShadow} />,
      );

      const toggle = getByTestId('box-style-shadow-toggle');
      expect(toggle.props.value).toBe(true);
    });

    it('calls onChange when toggle is switched on', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const toggle = getByTestId('box-style-shadow-toggle');
      fireEvent(toggle, 'onValueChange', true);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        shadowEnabled: true,
      });
    });

    it('calls onChange when toggle is switched off', () => {
      const valueWithShadow: BoxStyling = { ...defaultValue, shadowEnabled: true };
      const { getByTestId } = render(
        <BoxStyleEditor {...defaultProps} value={valueWithShadow} />,
      );

      const toggle = getByTestId('box-style-shadow-toggle');
      fireEvent(toggle, 'onValueChange', false);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...valueWithShadow,
        shadowEnabled: false,
      });
    });
  });

  describe('preview box', () => {
    it('applies border styling to preview', () => {
      const customValue: BoxStyling = {
        padding: 8,
        borderWidth: 3,
        borderColor: '#FF0000',
        borderRadius: 12,
        shadowEnabled: false,
      };
      const { getByTestId } = render(
        <BoxStyleEditor {...defaultProps} value={customValue} />,
      );

      const preview = getByTestId('box-style-preview');
      const previewStyle = preview.props.style as ViewStyle | ViewStyle[];
      const flatStyle = flattenStyle(previewStyle);

      expect(flatStyle.borderWidth).toBe(3);
      expect(flatStyle.borderRadius).toBe(12);
      expect(flatStyle.padding).toBe(8);
    });

    it('applies shadow styling when enabled', () => {
      const valueWithShadow: BoxStyling = { ...defaultValue, shadowEnabled: true };
      const { getByTestId } = render(
        <BoxStyleEditor {...defaultProps} value={valueWithShadow} />,
      );

      const preview = getByTestId('box-style-preview');
      const previewStyle = preview.props.style as ViewStyle | ViewStyle[];
      const flatStyle = flattenStyle(previewStyle);

      expect(flatStyle.shadowColor).toBe('#000000');
      expect(flatStyle.shadowOpacity).toBeDefined();
      expect(flatStyle.elevation).toBeDefined();
    });

    it('does not apply shadow styling when disabled', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const preview = getByTestId('box-style-preview');
      const previewStyle = preview.props.style as ViewStyle | ViewStyle[];
      const flatStyle = flattenStyle(previewStyle);

      expect(flatStyle.shadowColor).toBeUndefined();
      expect(flatStyle.elevation).toBeUndefined();
    });
  });

  describe('disabled state', () => {
    it('disables border color input when disabled', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} disabled />);

      const input = getByTestId('box-style-border-color-input');
      expect(input.props.editable).toBe(false);
    });

    it('disables shadow toggle when disabled', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} disabled />);

      const toggle = getByTestId('box-style-shadow-toggle');
      expect(toggle.props.disabled).toBe(true);
    });

    it('disables slider buttons when disabled', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} disabled />);

      const increaseButton = getByTestId('box-style-border-width-slider-increase');
      expect(increaseButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles empty BoxStyling value', () => {
      const emptyValue: BoxStyling = {};
      const { getByTestId } = render(
        <BoxStyleEditor {...defaultProps} value={emptyValue} />,
      );

      const colorInput = getByTestId('box-style-border-color-input');
      expect(colorInput.props.value).toBe('');

      const toggle = getByTestId('box-style-shadow-toggle');
      expect(toggle.props.value).toBe(false);
    });

    it('handles partial BoxStyling value', () => {
      const partialValue: BoxStyling = { borderWidth: 1, shadowEnabled: true };
      const { getByTestId, getByText } = render(
        <BoxStyleEditor {...defaultProps} value={partialValue} />,
      );

      expect(getByText('1px')).toBeTruthy();

      const toggle = getByTestId('box-style-shadow-toggle');
      expect(toggle.props.value).toBe(true);
    });

    it('handles undefined values gracefully', () => {
      const undefinedValues: BoxStyling = {
        padding: undefined,
        borderWidth: undefined,
        borderColor: undefined,
        borderRadius: undefined,
        shadowEnabled: undefined,
      };
      const { getByTestId } = render(
        <BoxStyleEditor {...defaultProps} value={undefinedValues} />,
      );

      // Should render without crashing
      expect(getByTestId('box-style-editor')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has accessible labels for color input', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const input = getByTestId('box-style-border-color-input');
      expect(input.props.accessibilityLabel).toBe('Border Color');
      expect(input.props.accessibilityHint).toBe('Set the border color');
    });

    it('has accessible labels for shadow toggle', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      const toggle = getByTestId('box-style-shadow-toggle');
      expect(toggle.props.accessibilityLabel).toBe('Shadow');
      expect(toggle.props.accessibilityHint).toBe('Set the shadow');
    });

    it('has testIDs on all interactive elements', () => {
      const { getByTestId } = render(<BoxStyleEditor {...defaultProps} />);

      expect(getByTestId('box-style-editor')).toBeTruthy();
      expect(getByTestId('box-style-preview')).toBeTruthy();
      expect(getByTestId('box-style-border-color-input')).toBeTruthy();
      expect(getByTestId('box-style-border-color-swatch')).toBeTruthy();
      expect(getByTestId('box-style-border-width-slider-slider')).toBeTruthy();
      expect(getByTestId('box-style-border-width-slider-decrease')).toBeTruthy();
      expect(getByTestId('box-style-border-width-slider-increase')).toBeTruthy();
      expect(getByTestId('box-style-border-radius-slider-slider')).toBeTruthy();
      expect(getByTestId('box-style-padding-slider-slider')).toBeTruthy();
      expect(getByTestId('box-style-shadow-toggle')).toBeTruthy();
    });
  });
});
