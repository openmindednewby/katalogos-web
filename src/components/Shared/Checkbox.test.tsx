/**
 * Unit tests for Checkbox component.
 *
 * Tests focus on LOGIC: state change callbacks, label rendering logic,
 * and theme-derived style values. Visual correctness is tested by E2E.
 */
import React from 'react';

import { render, fireEvent } from '@testing-library/react-native';

import Checkbox from './Checkbox';

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_COLORS = {
  text: '#001219',
  textSecondary: '#555555',
  background: '#ffffff',
  surface: '#f7f7f7',
  surfaceElevated: '#ffffff',
  border: '#e6e6e6',
  divider: '#eeeeee',
};

const MOCK_PALETTE = {
  primary: { '50': '#e0f7fa', '100': '#b2ebf2', '200': '#80deea', '300': '#4dd0e1', '400': '#26c6da', '500': '#005f73', '600': '#00838f', '700': '#004d5a', '800': '#003d47', '900': '#002d34' },
  secondary: { '50': '#e8f5e9', '100': '#c8e6c9', '200': '#a5d6a7', '300': '#81c784', '400': '#66bb6a', '500': '#94d2bd', '600': '#388e3c', '700': '#2e7d32', '800': '#1b5e20', '900': '#0d3b15' },
  accent: { '50': '#fff8e1', '100': '#ffecb3', '200': '#ffe082', '300': '#ffd54f', '400': '#ffca28', '500': '#ee9b00', '600': '#ffb300', '700': '#ffa000', '800': '#ff8f00', '900': '#ff6f00' },
};

const MOCK_SEMANTIC = {
  success: { '50': '#e8f5e9', '100': '#c8e6c9', '200': '#a5d6a7', '300': '#81c784', '400': '#66bb6a', '500': '#2d6a4f', '600': '#388e3c', '700': '#2e7d32', '800': '#1b5e20', '900': '#0d3b15' },
  warning: { '50': '#fff3e0', '100': '#ffe0b2', '200': '#ffcc80', '300': '#ffb74d', '400': '#ffa726', '500': '#ee9b00', '600': '#fb8c00', '700': '#f57c00', '800': '#ef6c00', '900': '#e65100' },
  error: { '50': '#fbe9e7', '100': '#ffccbc', '200': '#ffab91', '300': '#ff8a65', '400': '#ff7043', '500': '#ae2012', '600': '#f4511e', '700': '#e64a19', '800': '#d84315', '900': '#bf360c' },
  info: { '50': '#e3f2fd', '100': '#bbdefb', '200': '#90caf9', '300': '#64b5f6', '400': '#42a5f5', '500': '#005f73', '600': '#1e88e5', '700': '#1976d2', '800': '#1565c0', '900': '#0d47a1' },
};

const PRIMARY_COLOR = MOCK_PALETTE.primary['500'];

jest.mock('../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: MOCK_COLORS,
      palette: MOCK_PALETTE,
      semantic: MOCK_SEMANTIC,
    },
    mode: 'light',
  }),
}));

// =============================================================================
// Tests
// =============================================================================

describe('Checkbox', () => {
  describe('state changes', () => {
    it('calls onPress callback when pressed', () => {
      const handlePress = jest.fn();
      const { getByTestId } = render(
        <Checkbox isChecked={false} testID="test-checkbox" onPress={handlePress} />,
      );
      fireEvent.press(getByTestId('test-checkbox'));
      expect(handlePress).toHaveBeenCalledTimes(1);
    });

    it('sets accessibilityState.checked to true when isChecked is true', () => {
      const { getByTestId } = render(
        <Checkbox isChecked testID="test-checkbox" onPress={jest.fn()} />,
      );
      const checkbox = getByTestId('test-checkbox');
      expect(checkbox.props.accessibilityState).toEqual({ checked: true });
    });

    it('sets accessibilityState.checked to false when isChecked is false', () => {
      const { getByTestId } = render(
        <Checkbox isChecked={false} testID="test-checkbox" onPress={jest.fn()} />,
      );
      const checkbox = getByTestId('test-checkbox');
      expect(checkbox.props.accessibilityState).toEqual({ checked: false });
    });
  });

  describe('label rendering logic', () => {
    it('uses explicit label when provided', () => {
      const { getByTestId } = render(
        <Checkbox isChecked={false} label="Custom Label" testID="test-checkbox" onPress={jest.fn()} />,
      );
      expect(getByTestId('test-checkbox').props.accessibilityLabel).toBe('Custom Label');
    });

    it('shows "Yes" when checked and no label or baseLabel provided', () => {
      const { getByTestId } = render(
        <Checkbox isChecked testID="test-checkbox" onPress={jest.fn()} />,
      );
      expect(getByTestId('test-checkbox').props.accessibilityLabel).toBe('Yes');
    });

    it('shows "No" when unchecked and no label or baseLabel provided', () => {
      const { getByTestId } = render(
        <Checkbox isChecked={false} testID="test-checkbox" onPress={jest.fn()} />,
      );
      expect(getByTestId('test-checkbox').props.accessibilityLabel).toBe('No');
    });

    it('appends yes/no to baseLabel when provided', () => {
      const { getByTestId } = render(
        <Checkbox isChecked baseLabel="Active:" testID="test-checkbox" onPress={jest.fn()} />,
      );
      expect(getByTestId('test-checkbox').props.accessibilityLabel).toBe('Active: Yes');
    });

    it('uses custom yesLabel when provided', () => {
      const { getByTestId } = render(
        <Checkbox isChecked testID="test-checkbox" yesLabel="Enabled" onPress={jest.fn()} />,
      );
      expect(getByTestId('test-checkbox').props.accessibilityLabel).toBe('Enabled');
    });

    it('uses custom noLabel when provided', () => {
      const { getByTestId } = render(
        <Checkbox isChecked={false} noLabel="Disabled" testID="test-checkbox" onPress={jest.fn()} />,
      );
      expect(getByTestId('test-checkbox').props.accessibilityLabel).toBe('Disabled');
    });
  });

  describe('theme-derived styles', () => {
    it('uses primary color for checked checkbox background', () => {
      const { toJSON } = render(
        <Checkbox isChecked testID="test-checkbox" onPress={jest.fn()} />,
      );

      const tree = toJSON();
      const found = findNodeWithStyle(tree, { backgroundColor: PRIMARY_COLOR });
      expect(found).not.toBeNull();
    });

    it('uses transparent background for unchecked checkbox', () => {
      const { toJSON } = render(
        <Checkbox isChecked={false} testID="test-checkbox" onPress={jest.fn()} />,
      );

      const tree = toJSON();
      const found = findNodeWithStyle(tree, { backgroundColor: 'transparent' });
      expect(found).not.toBeNull();
    });

    it('uses theme border color for checkbox box border', () => {
      const { toJSON } = render(
        <Checkbox isChecked={false} testID="test-checkbox" onPress={jest.fn()} />,
      );

      const tree = toJSON();
      const found = findNodeWithStyle(tree, { borderColor: MOCK_COLORS.border });
      expect(found).not.toBeNull();
    });
  });
});

// =============================================================================
// Helpers
// =============================================================================

interface TreeNode {
  type: string;
  props?: Record<string, unknown>;
  children?: Array<TreeNode | string>;
}

function findNodeWithStyle(
  root: unknown,
  styleMatch: Record<string, string>,
): TreeNode | null {
  const tree = root as TreeNode | null;
  if (tree === null) return null;

  const flatStyle = flattenStyle(tree.props?.style);
  const allMatch = Object.entries(styleMatch).every(
    ([key, value]) => flatStyle[key] === value,
  );
  if (allMatch && Object.keys(styleMatch).length > 0) return tree;

  if (Array.isArray(tree.children))
    for (const child of tree.children) {
      if (typeof child === 'string') continue;
      const found = findNodeWithStyle(child, styleMatch);
      if (found !== null) return found;
    }

  return null;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (style === undefined || style === null) return {};
  if (Array.isArray(style))
    return style.reduce<Record<string, unknown>>((acc, s) => {
      if (s !== null && s !== undefined) return { ...acc, ...(s as Record<string, unknown>) };
      return acc;
    }, {});
  return style as Record<string, unknown>;
}
