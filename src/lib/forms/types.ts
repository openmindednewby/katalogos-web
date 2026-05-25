/**
 * Form type definitions for React Hook Form integration.
 */
import type { UseFormReturn, DefaultValues, FieldValues } from 'react-hook-form';
import type { ZodSchema, z } from 'zod';

/**
 * Props for useFormWithSchema hook.
 */
export interface UseFormWithSchemaProps<TSchema extends ZodSchema<FieldValues>> {
  /** Zod schema for validation and type inference */
  schema: TSchema;
  /** Default form values */
  defaultValues?: DefaultValues<z.infer<TSchema>>;
  /** Validation mode - when to trigger validation */
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  /** Re-validation mode - when to re-validate after first validation */
  reValidateMode?: 'onBlur' | 'onChange' | 'onSubmit';
}

/**
 * Return type for useFormWithSchema hook.
 */
export type UseFormWithSchemaReturn<TSchema extends ZodSchema<FieldValues>> = UseFormReturn<z.infer<TSchema>>;

/**
 * Common form field props shared across all form field components.
 */
export interface BaseFormFieldProps {
  /** Label text */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Test ID for E2E testing */
  testID?: string;
}
