/**
 * Unit tests for FormField theme-derived styles.
 *
 * Tests focus on LOGIC: theme color mapping, error state styling,
 * and required mark rendering. Visual correctness is tested by E2E.
 */
import React from 'react';

import { render } from '@testing-library/react-native';

import { FormField } from './FormField';

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

const ERROR_COLOR = MOCK_SEMANTIC.error['500'];

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
// Helpers
// =============================================================================

interface TreeNode {
  type: string;
  props?: Record<string, unknown>;
  children?: Array<TreeNode | string>;
}

function findNode(root: unknown, predicate: (node: TreeNode) => boolean): TreeNode | null {
  const tree = root as TreeNode | null;
  if (tree === null) return null;
  if (predicate(tree)) return tree;
  if (Array.isArray(tree.children))
    for (const child of tree.children) {
      if (typeof child === 'string') continue;
      const found = findNode(child, predicate);
      if (found !== null) return found;
    }
  return null;
}

function findByTestId(root: unknown, testID: string): TreeNode | null {
  return findNode(root, (n) => n.props?.testID === testID);
}

function findByText(root: unknown, text: string): TreeNode | null {
  return findNode(root, (n) =>
    Array.isArray(n.children) && n.children.includes(text),
  );
}

function extractFlattenedStyle(node: TreeNode): Record<string, unknown> {
  const rawStyle = node.props?.style;
  if (rawStyle === undefined || rawStyle === null) return {};
  if (Array.isArray(rawStyle))
    return rawStyle.reduce<Record<string, unknown>>((acc, s) => {
      if (s !== null && s !== undefined) return { ...acc, ...(s as Record<string, unknown>) };
      return acc;
    }, {});
  return rawStyle as Record<string, unknown>;
}

// =============================================================================
// Tests
// =============================================================================

describe('FormField', () => {
  describe('theme-derived styles', () => {
    it('applies theme text color to the label', () => {
      const { toJSON } = render(
        <FormField label="Name" />,
      );
      const label = findByText(toJSON(), 'Name');
      expect(label).not.toBeNull();
      const style = extractFlattenedStyle(label!);
      expect(style.color).toBe(MOCK_COLORS.text);
    });

    it('applies theme surface color as input background', () => {
      const { toJSON } = render(
        <FormField label="Email" />,
      );
      const input = findByTestId(toJSON(), 'form-field-input');
      expect(input).not.toBeNull();
      const style = extractFlattenedStyle(input!);
      expect(style.backgroundColor).toBe(MOCK_COLORS.surface);
    });

    it('applies theme border color to input when no error', () => {
      const { toJSON } = render(
        <FormField label="Email" />,
      );
      const input = findByTestId(toJSON(), 'form-field-input');
      expect(input).not.toBeNull();
      const style = extractFlattenedStyle(input!);
      expect(style.borderColor).toBe(MOCK_COLORS.border);
    });

    it('applies semantic error border color when error is present', () => {
      const { toJSON } = render(
        <FormField error="Required field" label="Email" />,
      );
      const input = findByTestId(toJSON(), 'form-field-input');
      expect(input).not.toBeNull();
      const style = extractFlattenedStyle(input!);
      expect(style.borderColor).toBe(ERROR_COLOR);
    });

    it('applies semantic error color to the error text', () => {
      const { toJSON } = render(
        <FormField error="Required field" label="Email" />,
      );
      const errorNode = findByText(toJSON(), 'Required field');
      expect(errorNode).not.toBeNull();
      const style = extractFlattenedStyle(errorNode!);
      expect(style.color).toBe(ERROR_COLOR);
    });

    it('does not render error text when error prop is undefined', () => {
      const { toJSON } = render(
        <FormField label="Email" />,
      );
      const errorNode = findByText(toJSON(), 'Required field');
      expect(errorNode).toBeNull();
    });

    it('does not render error text when error prop is empty string', () => {
      const { toJSON } = render(
        <FormField error="" label="Email" />,
      );
      const tree = toJSON();
      // The empty error should not produce an error text node
      expect(findByText(tree, '')).toBeNull();
    });

    it('applies error color to the required mark asterisk', () => {
      const { toJSON } = render(
        <FormField required label="Email" />,
      );
      const asterisk = findByText(toJSON(), '*');
      expect(asterisk).not.toBeNull();
      const style = extractFlattenedStyle(asterisk!);
      expect(style.color).toBe(ERROR_COLOR);
    });

    it('does not render required mark when required is false', () => {
      const { toJSON } = render(
        <FormField label="Email" />,
      );
      const asterisk = findByText(toJSON(), '*');
      expect(asterisk).toBeNull();
    });
  });
});
