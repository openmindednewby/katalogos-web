/**
 * Unit tests for the core Button component.
 *
 * Tests focus on LOGIC: callback invocation, disabled/loading behavior,
 * accessibility state attributes. Visual rendering is tested by Playwright E2E.
 */
import React from 'react';
import type { ReactNode } from 'react';

import { render, fireEvent } from '@testing-library/react-native';

import Button from './Button';
import ButtonSize from '../utils/ButtonSize';
import ButtonVariant from '../utils/ButtonVariant';


// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockTheme = {
  colors: {
    background: '#ffffff',
    surface: '#f7f7f7',
    surfaceElevated: '#ffffff',
    text: '#001219',
    textSecondary: '#777777',
    border: '#e6e6e6',
    divider: '#e5e7eb',
  },
  palette: {
    primary: {
      '50': '#e6f3f5', '100': '#bfe0e6', '200': '#99cdd6',
      '300': '#73bac7', '400': '#4da7b7', '500': '#005f73',
      '600': '#004f60', '700': '#003f4d', '800': '#002f3a',
      '900': '#001f27',
    },
    secondary: {
      '50': '#f0faf6', '100': '#d6f0e6', '200': '#bce6d6',
      '300': '#a2dcc6', '400': '#88d2b6', '500': '#94d2bd',
      '600': '#7ab8a3', '700': '#609e89', '800': '#46846f',
      '900': '#2c6a55',
    },
    accent: {
      '50': '#e6f5ee', '100': '#bfe6d3', '200': '#99d6b8',
      '300': '#73c69d', '400': '#4db682', '500': '#008d5c',
      '600': '#00764d', '700': '#005f3e', '800': '#00482f',
      '900': '#003120',
    },
  },
  semantic: {
    success: {
      '50': '#e6f5f5', '100': '#bfe6e6', '200': '#99d6d6',
      '300': '#73c6c6', '400': '#4db6b6', '500': '#0a9396',
      '600': '#087b7d', '700': '#066364', '800': '#044b4b',
      '900': '#023332',
    },
    warning: {
      '50': '#fff8e1', '100': '#ffecb3', '200': '#ffe082',
      '300': '#ffd54f', '400': '#ffca28', '500': '#ffc107',
      '600': '#ffb300', '700': '#ffa000', '800': '#ff8f00',
      '900': '#ff6f00',
    },
    error: {
      '50': '#fbe9e7', '100': '#ffccbc', '200': '#ffab91',
      '300': '#ff8a65', '400': '#ff7043', '500': '#ae2012',
      '600': '#921a0f', '700': '#76140c', '800': '#5a0e09',
      '900': '#3e0806',
    },
    info: {
      '50': '#e3f2fd', '100': '#bbdefb', '200': '#90caf9',
      '300': '#64b5f6', '400': '#42a5f5', '500': '#2196f3',
      '600': '#1e88e5', '700': '#1976d2', '800': '#1565c0',
      '900': '#0d47a1',
    },
  },
  typography: { fontFamily: 'System', headingScale: 1.0 },
  mode: 'light',
  branding: { logoUrl: null, faviconUrl: null },
};

// The shared Button reads its theme from the @dloizides/ui-feedback UiProvider
// (`useUi`); the app bridges the real theme in production. Mock it here.
jest.mock('@dloizides/ui-feedback', () => ({
  useUi: () => ({ theme: mockTheme }),
}));

jest.mock('../../../Icons/SvgIcon', () => {
  const { View } = require('react-native');
  const MockSvgIcon = (props: Record<string, unknown>): ReactNode =>
    <View testID="mock-icon" {...props} />;
  return MockSvgIcon;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Button', () => {
  const defaultProps = {
    label: 'Test',
    onPress: jest.fn(),
    testID: 'test-button',
    accessibilityLabel: 'Test button',
    accessibilityHint: 'Performs a test action',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Callback behavior
  // -------------------------------------------------------------------------

  describe('callback behavior', () => {
    it('calls onPress when pressed', () => {
      const handlePress = jest.fn();
      const { getByTestId } = render(
        <Button {...defaultProps} onPress={handlePress} />,
      );
      fireEvent.press(getByTestId('test-button'));
      expect(handlePress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const handlePress = jest.fn();
      const { getByTestId } = render(
        <Button {...defaultProps} disabled onPress={handlePress} />,
      );
      fireEvent.press(getByTestId('test-button'));
      expect(handlePress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const handlePress = jest.fn();
      const { getByTestId } = render(
        <Button {...defaultProps} loading onPress={handlePress} />,
      );
      fireEvent.press(getByTestId('test-button'));
      expect(handlePress).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility state
  // -------------------------------------------------------------------------

  describe('accessibility state', () => {
    it('reports disabled=false when enabled', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      const button = getByTestId('test-button');
      expect(button.props.accessibilityState.disabled).toBe(false);
    });

    it('reports disabled=true when disabled prop is true', () => {
      const { getByTestId } = render(<Button {...defaultProps} disabled />);
      const button = getByTestId('test-button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('reports disabled=true when loading', () => {
      const { getByTestId } = render(<Button {...defaultProps} loading />);
      const button = getByTestId('test-button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('reports busy=true when loading', () => {
      const { getByTestId } = render(<Button {...defaultProps} loading />);
      const button = getByTestId('test-button');
      expect(button.props.accessibilityState.busy).toBe(true);
    });

    it('reports busy=false when not loading', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      const button = getByTestId('test-button');
      expect(button.props.accessibilityState.busy).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Variant defaults
  // -------------------------------------------------------------------------

  describe('variant defaults', () => {
    it('defaults to primary variant', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      expect(getByTestId('test-button')).toBeTruthy();
    });

    it('accepts all variant values without error', () => {
      const variants = [
        ButtonVariant.Primary,
        ButtonVariant.Secondary,
        ButtonVariant.Outline,
        ButtonVariant.Ghost,
        ButtonVariant.Danger,
      ];

      for (const variant of variants) {
        const { getByTestId } = render(
          <Button {...defaultProps} testID={`btn-${variant}`} variant={variant} />,
        );
        expect(getByTestId(`btn-${variant}`)).toBeTruthy();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Size defaults
  // -------------------------------------------------------------------------

  describe('size defaults', () => {
    it('defaults to medium size', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      expect(getByTestId('test-button')).toBeTruthy();
    });

    it('accepts all size values without error', () => {
      const sizes = [ButtonSize.Small, ButtonSize.Medium, ButtonSize.Large];

      for (const size of sizes) {
        const { getByTestId } = render(
          <Button {...defaultProps} size={size} testID={`btn-${size}`} />,
        );
        expect(getByTestId(`btn-${size}`)).toBeTruthy();
      }
    });
  });
});
