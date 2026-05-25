import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import TypographyEditor, {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_LIMITS,
  FONT_WEIGHT_OPTIONS,
} from './TypographyEditor';
import FontWeight from '../../../../types/enums/FontWeight';

import type { GlobalTypography } from '../../../../types/menuStyleTypes';

// =============================================================================
// Mocks
// =============================================================================

jest.mock('react-redux', () => ({
  useSelector: () => 'light',
}));

// =============================================================================
// Test Suite
// =============================================================================

describe('TypographyEditor', () => {
  const mockOnChange = jest.fn();
  const mockOnReset = jest.fn();

  const defaultValue: GlobalTypography = {
    titleFont: 'System',
    titleFontSize: 32,
    titleFontWeight: FontWeight.Bold,
    bodyFont: 'System',
    bodyFontSize: 16,
    bodyFontWeight: FontWeight.Normal,
    priceFont: 'System',
    priceFontSize: 18,
    priceFontWeight: FontWeight.Bold,
  };

  const defaultProps = {
    value: defaultValue,
    onChange: mockOnChange,
    onReset: mockOnReset,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Title Typography Tests
  // ---------------------------------------------------------------------------

  describe('title typography', () => {
    it('displays current title font family', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);
      const fontPicker = getByTestId('typography-font-picker-title');
      expect(fontPicker).toBeTruthy();
    });

    it('calls onChange when title font is changed', () => {
      const { getByTestId, getByText } = render(<TypographyEditor {...defaultProps} />);

      const fontPicker = getByTestId('typography-font-picker-title');
      fireEvent.press(fontPicker);

      const serifOption = getByText('Serif');
      fireEvent.press(serifOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        titleFont: 'Serif',
      });
    });

    it('calls onChange when title font size is changed', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);

      const sizeInput = getByTestId('typography-size-input-title');
      fireEvent.changeText(sizeInput, '36');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        titleFontSize: 36,
      });
    });

    it('clamps title font size to max value', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);

      const sizeInput = getByTestId('typography-size-input-title');
      fireEvent.changeText(sizeInput, '99');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        titleFontSize: FONT_SIZE_LIMITS.title.max,
      });
    });

    it('clamps title font size to min value', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);

      const sizeInput = getByTestId('typography-size-input-title');
      fireEvent.changeText(sizeInput, '5');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        titleFontSize: FONT_SIZE_LIMITS.title.min,
      });
    });

    it('uses default size for invalid input', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);

      const sizeInput = getByTestId('typography-size-input-title');
      fireEvent.changeText(sizeInput, 'abc');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        titleFontSize: FONT_SIZE_LIMITS.title.default,
      });
    });

    it('calls onChange when title font weight is changed', () => {
      const { getByTestId, getByText } = render(<TypographyEditor {...defaultProps} />);

      const weightPicker = getByTestId('typography-weight-picker-title');
      fireEvent.press(weightPicker);

      const semiboldOption = getByText('Semibold');
      fireEvent.press(semiboldOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        titleFontWeight: '600',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Body Typography Tests
  // ---------------------------------------------------------------------------

  describe('body typography', () => {
    it('displays body section', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);
      expect(getByTestId('typography-section-body')).toBeTruthy();
    });

    it('calls onChange when body font is changed', () => {
      const { getByTestId, getAllByText } = render(<TypographyEditor {...defaultProps} />);

      const fontPicker = getByTestId('typography-font-picker-body');
      fireEvent.press(fontPicker);

      const monospaceOptions = getAllByText('Monospace');
      fireEvent.press(monospaceOptions[0]);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        bodyFont: 'Monospace',
      });
    });

    it('calls onChange when body font size is changed', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);

      const sizeInput = getByTestId('typography-size-input-body');
      fireEvent.changeText(sizeInput, '18');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        bodyFontSize: 18,
      });
    });

    it('calls onChange when body font weight is changed', () => {
      const { getByTestId, getAllByText } = render(<TypographyEditor {...defaultProps} />);

      const weightPicker = getByTestId('typography-weight-picker-body');
      fireEvent.press(weightPicker);

      const mediumOptions = getAllByText('Medium');
      fireEvent.press(mediumOptions[0]);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        bodyFontWeight: '500',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Price Typography Tests
  // ---------------------------------------------------------------------------

  describe('price typography', () => {
    it('displays price section', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);
      expect(getByTestId('typography-section-price')).toBeTruthy();
    });

    it('calls onChange when price font is changed', () => {
      const { getByTestId, getAllByText } = render(<TypographyEditor {...defaultProps} />);

      const fontPicker = getByTestId('typography-font-picker-price');
      fireEvent.press(fontPicker);

      const sansSerifOptions = getAllByText('Sans-serif');
      fireEvent.press(sansSerifOptions[0]);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        priceFont: 'Sans-serif',
      });
    });

    it('calls onChange when price font size is changed', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);

      const sizeInput = getByTestId('typography-size-input-price');
      fireEvent.changeText(sizeInput, '20');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        priceFontSize: 20,
      });
    });

    it('calls onChange when price font weight is changed', () => {
      const { getByTestId, getAllByText } = render(<TypographyEditor {...defaultProps} />);

      const weightPicker = getByTestId('typography-weight-picker-price');
      fireEvent.press(weightPicker);

      // Use Semibold to avoid confusion with existing 'Normal' labels on the page
      const semiboldOptions = getAllByText('Semibold');
      fireEvent.press(semiboldOptions[semiboldOptions.length - 1]);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        priceFontWeight: '600',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Preview Tests
  // ---------------------------------------------------------------------------

  describe('preview', () => {
    it('displays preview section', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);
      expect(getByTestId('typography-preview')).toBeTruthy();
    });

    it('displays preview texts', () => {
      const { getByText } = render(<TypographyEditor {...defaultProps} />);
      expect(getByText('Sample Title')).toBeTruthy();
      expect(getByText('This is body text for your menu items.')).toBeTruthy();
      expect(getByText('$12.99')).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Reset Button Tests
  // ---------------------------------------------------------------------------

  describe('reset button', () => {
    it('calls onReset when reset button is pressed', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);

      const resetButton = getByTestId('typography-reset-button');
      fireEvent.press(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('does not render reset button when onReset is not provided', () => {
      const { queryByTestId } = render(
        <TypographyEditor {...defaultProps} onReset={undefined} />,
      );

      expect(queryByTestId('typography-reset-button')).toBeNull();
    });

    it('does not call onReset when disabled', () => {
      const { getByTestId } = render(
        <TypographyEditor {...defaultProps} disabled />,
      );

      const resetButton = getByTestId('typography-reset-button');
      fireEvent.press(resetButton);

      expect(mockOnReset).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Disabled State Tests
  // ---------------------------------------------------------------------------

  describe('disabled state', () => {
    it('does not open font menu when disabled', () => {
      const { getByTestId, queryByText } = render(
        <TypographyEditor {...defaultProps} disabled />,
      );

      const fontPicker = getByTestId('typography-font-picker-title');
      fireEvent.press(fontPicker);

      expect(queryByText('Serif')).toBeNull();
    });

    it('does not allow text input when disabled', () => {
      const { getByTestId } = render(
        <TypographyEditor {...defaultProps} disabled />,
      );

      const sizeInput = getByTestId('typography-size-input-title');
      expect(sizeInput.props.editable).toBe(false);
    });

    it('does not open weight menu when disabled', () => {
      const { getByTestId, queryByText } = render(
        <TypographyEditor {...defaultProps} disabled />,
      );

      const weightPicker = getByTestId('typography-weight-picker-title');
      fireEvent.press(weightPicker);

      expect(queryByText('Semibold')).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility Tests
  // ---------------------------------------------------------------------------

  describe('accessibility', () => {
    it('has correct testIDs', () => {
      const { getByTestId } = render(<TypographyEditor {...defaultProps} />);

      expect(getByTestId('typography-editor')).toBeTruthy();
      expect(getByTestId('typography-section-title')).toBeTruthy();
      expect(getByTestId('typography-section-body')).toBeTruthy();
      expect(getByTestId('typography-section-price')).toBeTruthy();
      expect(getByTestId('typography-font-picker-title')).toBeTruthy();
      expect(getByTestId('typography-size-input-title')).toBeTruthy();
      expect(getByTestId('typography-weight-picker-title')).toBeTruthy();
      expect(getByTestId('typography-preview')).toBeTruthy();
      expect(getByTestId('typography-reset-button')).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Edge Cases Tests
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('handles empty GlobalTypography value', () => {
      const emptyValue: GlobalTypography = {};
      const { getByTestId } = render(
        <TypographyEditor {...defaultProps} value={emptyValue} />,
      );

      expect(getByTestId('typography-editor')).toBeTruthy();
      expect(getByTestId('typography-preview')).toBeTruthy();
    });

    it('handles partial GlobalTypography value', () => {
      const partialValue: GlobalTypography = { titleFont: 'Serif' };
      const { getByTestId } = render(
        <TypographyEditor {...defaultProps} value={partialValue} />,
      );

      expect(getByTestId('typography-editor')).toBeTruthy();
    });

    it('uses default values when properties are undefined', () => {
      const valueWithUndefined: GlobalTypography = {
        titleFont: undefined,
        titleFontSize: undefined,
        titleFontWeight: undefined,
      };
      const { getByTestId } = render(
        <TypographyEditor {...defaultProps} value={valueWithUndefined} />,
      );

      const sizeInput = getByTestId('typography-size-input-title');
      expect(sizeInput.props.value).toBe(String(FONT_SIZE_LIMITS.title.default));
    });
  });

  // ---------------------------------------------------------------------------
  // Constants Export Tests
  // ---------------------------------------------------------------------------

  describe('exported constants', () => {
    it('exports FONT_FAMILY_OPTIONS with all built-in fonts', () => {
      const EXPECTED_TOTAL_FONTS = 16;
      expect(FONT_FAMILY_OPTIONS).toBeDefined();
      expect(FONT_FAMILY_OPTIONS.length).toBe(EXPECTED_TOTAL_FONTS);
      expect(FONT_FAMILY_OPTIONS[0].value).toBe('System');
    });

    it('exports FONT_WEIGHT_OPTIONS', () => {
      expect(FONT_WEIGHT_OPTIONS).toBeDefined();
      expect(FONT_WEIGHT_OPTIONS.length).toBe(4);
      expect(FONT_WEIGHT_OPTIONS[0].value).toBe('normal');
    });

    it('exports FONT_SIZE_LIMITS', () => {
      expect(FONT_SIZE_LIMITS).toBeDefined();
      expect(FONT_SIZE_LIMITS.title.min).toBe(16);
      expect(FONT_SIZE_LIMITS.title.max).toBe(48);
      expect(FONT_SIZE_LIMITS.body.min).toBe(12);
      expect(FONT_SIZE_LIMITS.body.max).toBe(24);
      expect(FONT_SIZE_LIMITS.price.min).toBe(12);
      expect(FONT_SIZE_LIMITS.price.max).toBe(32);
    });
  });
});
