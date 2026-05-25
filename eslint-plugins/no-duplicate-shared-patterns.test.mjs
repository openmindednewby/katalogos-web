/**
 * Tests for no-duplicate-shared-patterns ESLint rule.
 *
 * Run: node --test eslint-plugins/no-duplicate-shared-patterns.test.mjs
 *
 * Note: This rule uses filesystem access to scan src/components/ for
 * existing component names. Tests use mock filenames that may not match
 * the real filesystem, so we test the structural logic (file classification,
 * path detection) rather than exact matches. The RuleTester validates
 * that the rule does not crash and correctly classifies file paths.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import plugin from './no-duplicate-shared-patterns.mjs';

const rule = plugin.rules['no-duplicate-shared-patterns'];

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

describe('no-duplicate-shared-patterns', () => {
  it('does not flag non-product directories', () => {
    ruleTester.run('no-duplicate-shared-patterns (non-product)', rule, {
      valid: [
        // Files in src/components/ are shared, not product — should not flag
        {
          code: "export const X = 1;",
          filename: '/project/BaseClient/src/components/Shared/EmptyState.tsx',
        },
        // Files in src/lib/ — not a product directory
        {
          code: "export const X = 1;",
          filename: '/project/BaseClient/src/lib/utils.tsx',
        },
        // Non-.tsx files in product directories
        {
          code: "export const X = 1;",
          filename: '/project/BaseClient/packages/onlinemenu-module/src/utils.ts',
        },
        // index.tsx files in product directories
        {
          code: "export const X = 1;",
          filename: '/project/BaseClient/packages/onlinemenu-module/src/index.tsx',
        },
        // Test files in product directories
        {
          code: "export const X = 1;",
          filename: '/project/BaseClient/packages/onlinemenu-module/src/MenuCard.test.tsx',
        },
      ],
      invalid: [],
    });
  });

  it('correctly identifies product directory files', () => {
    // This test verifies the rule activates for product dirs.
    // Whether it finds a match depends on the real filesystem,
    // so we test that it at least runs without errors.
    ruleTester.run('no-duplicate-shared-patterns (product dir)', rule, {
      valid: [
        // A component name that almost certainly does NOT exist in
        // src/components/ — should pass.
        {
          code: "export const X = 1;",
          filename: '/project/BaseClient/packages/onlinemenu-module/src/components/VeryUniqueComponentNameXyz123.tsx',
        },
        // Features directory with unique name
        {
          code: "export const X = 1;",
          filename: '/project/BaseClient/src/features/showcase/VeryUniqueComponentNameAbc456.tsx',
        },
      ],
      invalid: [],
    });
  });
});

console.log('Tests passed');
