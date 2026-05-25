import type React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import PriceStyleEditor from './PriceStyleEditor';
import CurrencyPosition from '../../../../types/enums/CurrencyPosition';
import FontWeight from '../../../../types/enums/FontWeight';

import type { PriceStyle } from '../../../../types/menuStyleTypes';

// =============================================================================
// Mocks
// =============================================================================

jest.mock('react-redux', () => ({
  useSelector: () => 'light',
}));

jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ onValueChange, value, testID, ...props }: {
      onValueChange?: (value: number) => void;
      value?: number;
      testID?: string;
    }) => {
      const handleTouchEnd = (): void => {
        if (onValueChange) onValueChange(24);
      };
      return (
        <View testID={testID} {...props} onTouchEnd={handleTouchEnd}>
          {value}
        </View>
      );
    },
  };
});

// =============================================================================
// Test Suite
// =============================================================================

describe('PriceStyleEditor', () => {
  const mockOnChange = jest.fn();

  const defaultValue: PriceStyle = {
    fontSize: 18,
    fontWeight: FontWeight.Bold,
    color: '#000000',
    currencyPosition: CurrencyPosition.Before,
    showCurrency: true,
    strikethroughWhenUnavailable: true,
  };

  const defaultProps = {
    value: defaultValue,
    onChange: mockOnChange,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('font size', () => {
    it('calls onChange with new fontSize when slider changes', () => {
      const { getByTestId } = render(<PriceStyleEditor {...defaultProps} />);

      const slider = getByTestId('price-style-font-size-slider');
      fireEvent(slider, 'touchEnd');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        fontSize: 24,
      });
    });

    it('displays current font size value', () => {
      const { getByText } = render(<PriceStyleEditor {...defaultProps} />);
      expect(getByText('18')).toBeTruthy();
    });

    it('uses default fontSize when value.fontSize is undefined', () => {
      const valueWithoutFontSize: PriceStyle = { ...defaultValue, fontSize: undefined };
      const { getByText } = render(
        <PriceStyleEditor {...defaultProps} value={valueWithoutFontSize} />,
      );
      expect(getByText('18')).toBeTruthy();
    });
  });

  describe('font weight', () => {
    it('displays current font weight label', () => {
      const { getByText } = render(<PriceStyleEditor {...defaultProps} />);
      expect(getByText('Bold')).toBeTruthy();
    });

    it('calls onChange when font weight is selected', () => {
      const { getByTestId, getByText } = render(<PriceStyleEditor {...defaultProps} />);

      const dropdown = getByTestId('price-style-font-weight-dropdown');
      fireEvent.press(dropdown);

      const normalOption = getByText('Normal');
      fireEvent.press(normalOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        fontWeight: 'normal',
      });
    });

    it('shows Medium option in dropdown', () => {
      const { getByTestId, getByText } = render(<PriceStyleEditor {...defaultProps} />);

      const dropdown = getByTestId('price-style-font-weight-dropdown');
      fireEvent.press(dropdown);

      expect(getByText('Medium')).toBeTruthy();
    });

    it('shows Semibold option in dropdown', () => {
      const { getByTestId, getByText } = render(<PriceStyleEditor {...defaultProps} />);

      const dropdown = getByTestId('price-style-font-weight-dropdown');
      fireEvent.press(dropdown);

      expect(getByText('Semibold')).toBeTruthy();
    });

    it('uses default fontWeight when value.fontWeight is undefined', () => {
      const valueWithoutWeight: PriceStyle = { ...defaultValue, fontWeight: undefined };
      const { getByText } = render(
        <PriceStyleEditor {...defaultProps} value={valueWithoutWeight} />,
      );
      expect(getByText('Bold')).toBeTruthy();
    });
  });

  describe('color input', () => {
    it('displays current color value', () => {
      const { getByTestId } = render(<PriceStyleEditor {...defaultProps} />);

      const colorInput = getByTestId('price-style-color-input');
      expect(colorInput.props.value).toBe('#000000');
    });

    it('calls onChange when color is changed', () => {
      const { getByTestId } = render(<PriceStyleEditor {...defaultProps} />);

      const colorInput = getByTestId('price-style-color-input');
      fireEvent.changeText(colorInput, '#FF0000');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        color: '#FF0000',
      });
    });

    it('shows error for invalid hex color', () => {
      const { getByTestId, getByText } = render(<PriceStyleEditor {...defaultProps} />);

      const colorInput = getByTestId('price-style-color-input');
      fireEvent.changeText(colorInput, 'invalid');

      expect(getByText('Invalid hex color')).toBeTruthy();
    });

    it('clears error when valid color is entered', () => {
      const { getByTestId, queryByText } = render(<PriceStyleEditor {...defaultProps} />);

      const colorInput = getByTestId('price-style-color-input');

      fireEvent.changeText(colorInput, 'invalid');
      expect(queryByText('Invalid hex color')).toBeTruthy();

      fireEvent.changeText(colorInput, '#FF0000');
      expect(queryByText('Invalid hex color')).toBeNull();
    });

    it('handles empty color value', () => {
      const valueWithoutColor: PriceStyle = { ...defaultValue, color: undefined };
      const { getByTestId } = render(
        <PriceStyleEditor {...defaultProps} value={valueWithoutColor} />,
      );

      const colorInput = getByTestId('price-style-color-input');
      expect(colorInput.props.value).toBe('');
    });
  });

  describe('currency position', () => {
    it('calls onChange when currency position is changed to after', () => {
      const { getByTestId } = render(<PriceStyleEditor {...defaultProps} />);

      const afterButton = getByTestId('price-style-currency-position-after');
      fireEvent.press(afterButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        currencyPosition: 'after',
      });
    });

    it('calls onChange when currency position is changed to before', () => {
      const valueWithAfter: PriceStyle = { ...defaultValue, currencyPosition: CurrencyPosition.After };
      const { getByTestId } = render(
        <PriceStyleEditor {...defaultProps} value={valueWithAfter} />,
      );

      const beforeButton = getByTestId('price-style-currency-position-before');
      fireEvent.press(beforeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...valueWithAfter,
        currencyPosition: 'before',
      });
    });
  });

  describe('show currency toggle', () => {
    it('calls onChange when show currency is toggled off', () => {
      const { getByTestId } = render(<PriceStyleEditor {...defaultProps} />);

      const toggle = getByTestId('price-style-show-currency-toggle');
      fireEvent.press(toggle);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        showCurrency: false,
      });
    });

    it('calls onChange when show currency is toggled on', () => {
      const valueWithNoCurrency: PriceStyle = { ...defaultValue, showCurrency: false };
      const { getByTestId } = render(
        <PriceStyleEditor {...defaultProps} value={valueWithNoCurrency} />,
      );

      const toggle = getByTestId('price-style-show-currency-toggle');
      fireEvent.press(toggle);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...valueWithNoCurrency,
        showCurrency: true,
      });
    });
  });

  describe('strikethrough toggle', () => {
    it('calls onChange when strikethrough is toggled off', () => {
      const { getByTestId } = render(<PriceStyleEditor {...defaultProps} />);

      const toggle = getByTestId('price-style-strikethrough-toggle');
      fireEvent.press(toggle);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        strikethroughWhenUnavailable: false,
      });
    });

    it('calls onChange when strikethrough is toggled on', () => {
      const valueWithNoStrikethrough: PriceStyle = {
        ...defaultValue,
        strikethroughWhenUnavailable: false,
      };
      const { getByTestId } = render(
        <PriceStyleEditor {...defaultProps} value={valueWithNoStrikethrough} />,
      );

      const toggle = getByTestId('price-style-strikethrough-toggle');
      fireEvent.press(toggle);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...valueWithNoStrikethrough,
        strikethroughWhenUnavailable: true,
      });
    });
  });

  describe('preview', () => {
    it('displays price with currency before when position is before', () => {
      const { getByTestId } = render(<PriceStyleEditor {...defaultProps} />);

      const preview = getByTestId('price-style-preview');
      expect(preview.children[0]).toBe('$12.99');
    });

    it('displays price with currency after when position is after', () => {
      const valueWithAfter: PriceStyle = { ...defaultValue, currencyPosition: CurrencyPosition.After };
      const { getByTestId } = render(
        <PriceStyleEditor {...defaultProps} value={valueWithAfter} />,
      );

      const preview = getByTestId('price-style-preview');
      expect(preview.children[0]).toBe('12.99$');
    });

    it('displays price without currency when showCurrency is false', () => {
      const valueWithNoCurrency: PriceStyle = { ...defaultValue, showCurrency: false };
      const { getByTestId } = render(
        <PriceStyleEditor {...defaultProps} value={valueWithNoCurrency} />,
      );

      const preview = getByTestId('price-style-preview');
      expect(preview.children[0]).toBe('12.99');
    });
  });

  describe('disabled state', () => {
    it('does not open font weight menu when disabled', () => {
      const { getByTestId, queryByText } = render(
        <PriceStyleEditor {...defaultProps} disabled />,
      );

      const dropdown = getByTestId('price-style-font-weight-dropdown');
      fireEvent.press(dropdown);

      expect(queryByText('Normal')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has correct testIDs', () => {
      const { getByTestId } = render(<PriceStyleEditor {...defaultProps} />);

      expect(getByTestId('price-style-editor')).toBeTruthy();
      expect(getByTestId('price-style-font-size-slider')).toBeTruthy();
      expect(getByTestId('price-style-font-weight-dropdown')).toBeTruthy();
      expect(getByTestId('price-style-color-input')).toBeTruthy();
      expect(getByTestId('price-style-color-swatch')).toBeTruthy();
      expect(getByTestId('price-style-show-currency-toggle')).toBeTruthy();
      expect(getByTestId('price-style-strikethrough-toggle')).toBeTruthy();
      expect(getByTestId('price-style-preview')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles empty PriceStyle value', () => {
      const emptyValue: PriceStyle = {};
      const { getByTestId, getByText } = render(
        <PriceStyleEditor {...defaultProps} value={emptyValue} />,
      );

      expect(getByText('18')).toBeTruthy();
      expect(getByText('Bold')).toBeTruthy();

      const colorInput = getByTestId('price-style-color-input');
      expect(colorInput.props.value).toBe('');
    });

    it('handles partial PriceStyle value', () => {
      const partialValue: PriceStyle = { fontSize: 24 };
      const { getByText } = render(
        <PriceStyleEditor {...defaultProps} value={partialValue} />,
      );

      expect(getByText('24')).toBeTruthy();
      expect(getByText('Bold')).toBeTruthy();
    });
  });
});
