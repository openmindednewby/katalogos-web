/**
 * Unit tests for FormNativeInput - WS4 (validation UX) + WS5A (ARIA accessibility).
 *
 * These tests focus on LOGIC: showError condition behavior and ARIA attribute values.
 * Visual rendering is tested by Playwright E2E.
 *
 * Note: FormNativeInput renders native HTML elements (<input>, <span>) within
 * a React Native test renderer. We use toJSON() tree inspection to verify
 * attributes and structure.
 */
import React, { useEffect } from 'react';

import { View, Text, Pressable } from 'react-native';

import { render, act } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';

import { FormNativeInput } from './FormNativeInput';

import type { UseFormReturn } from 'react-hook-form';

// =============================================================================
// Mocks
// =============================================================================

jest.mock('../../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: { text: '#001219', textSecondary: '#555555', background: '#ffffff', surface: '#f7f7f7', surfaceElevated: '#ffffff', border: '#e6e6e6', divider: '#eeeeee' },
      palette: { primary: { '500': '#005f73', '700': '#004d5a' }, secondary: { '500': '#94d2bd' }, accent: { '500': '#ee9b00' } },
      semantic: { success: { '500': '#2d6a4f' }, warning: { '500': '#ee9b00' }, error: { '500': '#ae2012' }, info: { '500': '#005f73' } },
    },
    mode: 'light',
  }),
}));

// =============================================================================
// Test Data
// =============================================================================

interface TestForm {
  email: string;
}

/**
 * Minimal shape of a node returned by toJSON().
 */
interface TreeNode {
  type: string;
  props?: Record<string, unknown>;
  children?: Array<TreeNode | string>;
}

const REQUIRED_MESSAGE = 'Email is required';
const TEST_FIELD_NAME = 'email';
const ERROR_ID = `${TEST_FIELD_NAME}-error`;
const INPUT_TEST_ID = 'email-input';

// =============================================================================
// Test Helpers
// =============================================================================

let formRef: UseFormReturn<TestForm>;

interface WrapperProps {
  onSubmit?: (data: TestForm) => void;
  defaultValues?: Partial<TestForm>;
  setErrorOnMount?: boolean;
}

const TestWrapper = ({
  onSubmit = jest.fn(),
  defaultValues = { email: '' },
  setErrorOnMount = false,
}: WrapperProps): React.ReactElement => {
  const form = useForm<TestForm>({ defaultValues });
  formRef = form;

  useEffect(() => {
    if (setErrorOnMount)
      form.setError(TEST_FIELD_NAME, { type: 'required', message: REQUIRED_MESSAGE });
  }, [setErrorOnMount, form]);

  return (
    <View>
      <FormNativeInput
        control={form.control}
        label="Email"
        name={TEST_FIELD_NAME}
        testID={INPUT_TEST_ID}
        type="email"
      />
      <Pressable
        accessibilityRole="button"
        testID="submit-button"
        onPress={async () => {
          await form.handleSubmit(onSubmit)();
        }}
      >
        <Text>Submit</Text>
      </Pressable>
    </View>
  );
};

/**
 * Recursively find a node in the RNTL JSON tree matching a predicate.
 */
function findNode(
  root: unknown,
  predicate: (node: TreeNode) => boolean,
): TreeNode | null {
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

function findInputNode(root: unknown): TreeNode | null {
  return findNode(root, (n) => n.type === 'input' && n.props?.['data-testid'] === INPUT_TEST_ID);
}

function findAlertNode(root: unknown): TreeNode | null {
  return findNode(root, (n) => n.props?.role === 'alert');
}

// =============================================================================
// Test Suite
// =============================================================================

describe('FormNativeInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // WS4: showError condition logic
  // ---------------------------------------------------------------------------

  describe('showError logic (WS4)', () => {
    it('does not show error when field has error but is not touched and not submitted', () => {
      const { toJSON } = render(<TestWrapper setErrorOnMount />);
      expect(findAlertNode(toJSON())).toBeNull();
    });

    it('shows error after form submission even if field was never touched', async () => {
      const { toJSON } = render(<TestWrapper />);

      // handleSubmit sets formState.isSubmitted = true
      await act(async () => {
        await formRef.handleSubmit(jest.fn())();
      });

      // Set error after submit (simulates server-side validation)
      await act(async () => {
        formRef.setError(TEST_FIELD_NAME, { type: 'required', message: REQUIRED_MESSAGE });
      });

      const alert = findAlertNode(toJSON());
      expect(alert).not.toBeNull();
      expect(alert?.children).toContain(REQUIRED_MESSAGE);
    });

    it('shows error when field is touched and has error (before submit)', async () => {
      const { toJSON } = render(<TestWrapper />);

      // Set error
      await act(async () => {
        formRef.setError(TEST_FIELD_NAME, { type: 'required', message: REQUIRED_MESSAGE });
      });

      // Trigger touch by calling field.onBlur via the input node
      const inputBefore = findInputNode(toJSON());
      expect(inputBefore).not.toBeNull();

      await act(async () => {
        const onBlur = inputBefore?.props?.onBlur;
        if (typeof onBlur === 'function') onBlur();
      });

      expect(findAlertNode(toJSON())).not.toBeNull();
    });

    it('does not show error when no validation error exists after submit', async () => {
      const { toJSON } = render(
        <TestWrapper defaultValues={{ email: 'test@example.com' }} />,
      );

      await act(async () => {
        await formRef.handleSubmit(jest.fn())();
      });

      expect(findAlertNode(toJSON())).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // WS5A: ARIA attributes
  // ---------------------------------------------------------------------------

  describe('ARIA attributes (WS5A)', () => {
    it('sets aria-invalid to false when no error exists', () => {
      const { toJSON } = render(
        <TestWrapper defaultValues={{ email: 'valid@email.com' }} />,
      );
      const input = findInputNode(toJSON());
      expect(input?.props?.['aria-invalid']).toBe(false);
    });

    it('sets aria-invalid to true when error is shown', async () => {
      const { toJSON } = render(<TestWrapper />);

      await act(async () => {
        await formRef.handleSubmit(jest.fn())();
      });

      await act(async () => {
        formRef.setError(TEST_FIELD_NAME, { type: 'required', message: REQUIRED_MESSAGE });
      });

      const input = findInputNode(toJSON());
      expect(input?.props?.['aria-invalid']).toBe(true);
    });

    it('does not set aria-describedby when no error exists', () => {
      const { toJSON } = render(
        <TestWrapper defaultValues={{ email: 'valid@email.com' }} />,
      );
      const input = findInputNode(toJSON());
      expect(input?.props?.['aria-describedby']).toBeUndefined();
    });

    it('sets aria-describedby linking input to error when error is shown', async () => {
      const { toJSON } = render(<TestWrapper />);

      await act(async () => {
        await formRef.handleSubmit(jest.fn())();
      });

      await act(async () => {
        formRef.setError(TEST_FIELD_NAME, { type: 'required', message: REQUIRED_MESSAGE });
      });

      const input = findInputNode(toJSON());
      expect(input?.props?.['aria-describedby']).toBe(ERROR_ID);
    });

    it('error element has role="alert" and id matching the aria-describedby value', async () => {
      const { toJSON } = render(<TestWrapper />);

      await act(async () => {
        await formRef.handleSubmit(jest.fn())();
      });

      await act(async () => {
        formRef.setError(TEST_FIELD_NAME, { type: 'required', message: REQUIRED_MESSAGE });
      });

      const alert = findAlertNode(toJSON());
      expect(alert).not.toBeNull();
      expect(alert?.props?.id).toBe(ERROR_ID);
      expect(alert?.props?.role).toBe('alert');
    });
  });
});
