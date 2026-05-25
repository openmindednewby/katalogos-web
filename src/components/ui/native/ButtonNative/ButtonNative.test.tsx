/**
 * Unit tests for ButtonNative - WS5A (ARIA accessibility).
 *
 * Tests focus on LOGIC: aria-disabled and aria-busy attribute values.
 * Visual rendering is tested by Playwright E2E.
 */
import React from 'react';

import { Text } from 'react-native';

import { render } from '@testing-library/react-native';

import { ButtonNative } from './index';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Minimal shape of a node returned by toJSON().
 */
interface TreeNode {
  type: string;
  props?: Record<string, unknown>;
  children?: Array<TreeNode | string>;
}

/**
 * Find the <button> node in the RNTL JSON tree.
 */
function findButtonNode(root: unknown): TreeNode | null {
  const tree = root as TreeNode | null;
  if (tree === null) return null;
  if (tree.type === 'button') return tree;
  if (Array.isArray(tree.children))
    for (const child of tree.children) {
      if (typeof child === 'string') continue;
      const found = findButtonNode(child);
      if (found !== null) return found;
    }

  return null;
}

// =============================================================================
// Test Suite
// =============================================================================

describe('ButtonNative', () => {
  // ---------------------------------------------------------------------------
  // WS5A: ARIA attributes
  // ---------------------------------------------------------------------------

  describe('ARIA attributes (WS5A)', () => {
    it('sets aria-disabled to false when not disabled and not loading', () => {
      const { toJSON } = render(
        <ButtonNative testID="btn"><Text>Click</Text></ButtonNative>,
      );
      const button = findButtonNode(toJSON());
      expect(button?.props?.['aria-disabled']).toBe(false);
    });

    it('sets aria-disabled to true when disabled', () => {
      const { toJSON } = render(
        <ButtonNative disabled testID="btn"><Text>Click</Text></ButtonNative>,
      );
      const button = findButtonNode(toJSON());
      expect(button?.props?.['aria-disabled']).toBe(true);
    });

    it('sets aria-disabled to true when loading', () => {
      const { toJSON } = render(
        <ButtonNative loading testID="btn"><Text>Click</Text></ButtonNative>,
      );
      const button = findButtonNode(toJSON());
      expect(button?.props?.['aria-disabled']).toBe(true);
    });

    it('sets aria-busy to false when not loading', () => {
      const { toJSON } = render(
        <ButtonNative testID="btn"><Text>Click</Text></ButtonNative>,
      );
      const button = findButtonNode(toJSON());
      expect(button?.props?.['aria-busy']).toBe(false);
    });

    it('sets aria-busy to true when loading', () => {
      const { toJSON } = render(
        <ButtonNative loading testID="btn"><Text>Click</Text></ButtonNative>,
      );
      const button = findButtonNode(toJSON());
      expect(button?.props?.['aria-busy']).toBe(true);
    });

    it('sets both aria-disabled and aria-busy when loading', () => {
      const { toJSON } = render(
        <ButtonNative loading testID="btn"><Text>Click</Text></ButtonNative>,
      );
      const button = findButtonNode(toJSON());
      expect(button?.props?.['aria-disabled']).toBe(true);
      expect(button?.props?.['aria-busy']).toBe(true);
    });
  });
});
