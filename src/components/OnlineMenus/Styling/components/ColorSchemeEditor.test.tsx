import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import ColorSchemeEditor, { COLOR_PRESETS } from './ColorSchemeEditor';

import type { ColorScheme } from '../utils/colorSchemeConstants';

// Mock dependencies
jest.mock('react-redux', () => ({
  useSelector: () => 'light',
}));

describe('ColorSchemeEditor', () => {
  const mockOnChange = jest.fn();
  const mockOnReset = jest.fn();

  const defaultValue: ColorScheme = {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    accent: '#007AFF',
    price: '#000000',
    border: '#E0E0E0',
    divider: '#EEEEEE',
    unavailable: '#999999',
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

  describe('color inputs', () => {
    it('renders all 9 color inputs', () => {
      const { getByTestId } = render(<ColorSchemeEditor {...defaultProps} />);

      const colorKeys = [
        'background',
        'surface',
        'text',
        'textSecondary',
        'accent',
        'price',
        'border',
        'divider',
        'unavailable',
      ];

      colorKeys.forEach((key) => {
        expect(getByTestId(`color-scheme-input-${key}`)).toBeTruthy();
      });
    });

    it('displays current color values', () => {
      const { getByTestId } = render(<ColorSchemeEditor {...defaultProps} />);

      const backgroundInput = getByTestId('color-scheme-input-background');
      expect(backgroundInput.props.value).toBe('#FFFFFF');

      const textInput = getByTestId('color-scheme-input-text');
      expect(textInput.props.value).toBe('#000000');
    });

    it('calls onChange when color is changed', () => {
      const { getByTestId } = render(<ColorSchemeEditor {...defaultProps} />);

      const backgroundInput = getByTestId('color-scheme-input-background');
      fireEvent.changeText(backgroundInput, '#FF0000');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        background: '#FF0000',
      });
    });

    it('shows error for invalid color', () => {
      const { getByTestId, queryByText } = render(
        <ColorSchemeEditor {...defaultProps} />,
      );

      const backgroundInput = getByTestId('color-scheme-input-background');
      fireEvent.changeText(backgroundInput, 'invalid');

      expect(queryByText('Invalid hex color')).toBeTruthy();
    });

    it('clears error when valid color is entered', () => {
      const { getByTestId, queryByText } = render(
        <ColorSchemeEditor {...defaultProps} />,
      );

      const backgroundInput = getByTestId('color-scheme-input-background');

      fireEvent.changeText(backgroundInput, 'invalid');
      expect(queryByText('Invalid hex color')).toBeTruthy();

      fireEvent.changeText(backgroundInput, '#FF0000');
      expect(queryByText('Invalid hex color')).toBeNull();
    });
  });

  describe('presets', () => {
    it('renders all preset options', () => {
      const { getByTestId } = render(<ColorSchemeEditor {...defaultProps} />);

      COLOR_PRESETS.forEach((preset) => {
        expect(getByTestId(`color-scheme-preset-${preset.key}`)).toBeTruthy();
      });
    });

    it('applies preset colors when selected', () => {
      const { getByTestId } = render(<ColorSchemeEditor {...defaultProps} />);

      const darkPreset = getByTestId('color-scheme-preset-dark');
      fireEvent.press(darkPreset);

      const expectedScheme = COLOR_PRESETS.find((p) => p.key === 'dark')?.scheme;
      expect(mockOnChange).toHaveBeenCalledWith(expectedScheme);
    });

    it('does not call onChange when disabled', () => {
      const { getByTestId } = render(
        <ColorSchemeEditor {...defaultProps} disabled />,
      );

      const darkPreset = getByTestId('color-scheme-preset-dark');
      fireEvent.press(darkPreset);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('calls onReset when reset button pressed', () => {
      const { getByTestId } = render(<ColorSchemeEditor {...defaultProps} />);

      const resetButton = getByTestId('color-scheme-reset-button');
      fireEvent.press(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('does not render reset button when onReset is not provided', () => {
      const { queryByTestId } = render(
        <ColorSchemeEditor {...defaultProps} onReset={undefined} />,
      );

      expect(queryByTestId('color-scheme-reset-button')).toBeNull();
    });

    it('does not call onReset when disabled', () => {
      const { getByTestId } = render(
        <ColorSchemeEditor {...defaultProps} disabled />,
      );

      const resetButton = getByTestId('color-scheme-reset-button');
      fireEvent.press(resetButton);

      expect(mockOnReset).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has correct testIDs', () => {
      const { getByTestId } = render(<ColorSchemeEditor {...defaultProps} />);

      expect(getByTestId('color-scheme-editor')).toBeTruthy();
      expect(getByTestId('color-scheme-input-background')).toBeTruthy();
      expect(getByTestId('color-scheme-swatch-background')).toBeTruthy();
      expect(getByTestId('color-scheme-reset-button')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles empty ColorScheme value', () => {
      const emptyValue: ColorScheme = {};
      const { getByTestId } = render(
        <ColorSchemeEditor {...defaultProps} value={emptyValue} />,
      );

      const backgroundInput = getByTestId('color-scheme-input-background');
      expect(backgroundInput.props.value).toBe('');
    });

    it('handles partial ColorScheme value', () => {
      const partialValue: ColorScheme = { background: '#FF0000' };
      const { getByTestId } = render(
        <ColorSchemeEditor {...defaultProps} value={partialValue} />,
      );

      const backgroundInput = getByTestId('color-scheme-input-background');
      expect(backgroundInput.props.value).toBe('#FF0000');

      const textInput = getByTestId('color-scheme-input-text');
      expect(textInput.props.value).toBe('');
    });
  });
});
