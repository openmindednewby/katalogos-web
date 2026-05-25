/**
 * Unit tests for ColorInput validation logic.
 * Tests focus on logic (error display conditions), not rendering.
 */
import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import ColorInput from './ColorInput';

jest.mock('../../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: '#001219',
        textSecondary: '#777777',
        surface: '#f7f7f7',
        border: '#e6e6e6',
      },
      semantic: {
        error: { '500': '#ae2012' },
      },
    },
  }),
}));

const DEFAULT_PROPS = {
  label: 'Primary Color',
  value: '#005f73',
  onChangeText: jest.fn(),
  testID: 'test-color-input',
  disabled: false,
};

describe('ColorInput', () => {
  it('should not show error for valid hex value', () => {
    const { queryByTestId } = render(<ColorInput {...DEFAULT_PROPS} />);
    expect(queryByTestId('test-color-input-error')).toBeNull();
  });

  it('should not show error for empty value before blur', () => {
    const { queryByTestId } = render(
      <ColorInput {...DEFAULT_PROPS} value="" />,
    );
    expect(queryByTestId('test-color-input-error')).toBeNull();
  });

  it('should show error for invalid hex after blur', () => {
    const { getByTestId, queryByTestId } = render(
      <ColorInput {...DEFAULT_PROPS} value="invalid" />,
    );
    fireEvent(getByTestId('test-color-input'), 'blur');
    expect(queryByTestId('test-color-input-error')).not.toBeNull();
  });

  it('should not show error for valid shorthand hex after blur', () => {
    const { getByTestId, queryByTestId } = render(
      <ColorInput {...DEFAULT_PROPS} value="#f00" />,
    );
    fireEvent(getByTestId('test-color-input'), 'blur');
    expect(queryByTestId('test-color-input-error')).toBeNull();
  });

  it('should call onChangeText when input changes', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <ColorInput {...DEFAULT_PROPS} onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByTestId('test-color-input'), '#ff0000');
    expect(onChangeText).toHaveBeenCalledWith('#ff0000');
  });
});
