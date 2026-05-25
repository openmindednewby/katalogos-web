/**
 * Enhanced useForm hook with Zod schema integration.
 * Provides automatic type inference and consistent defaults.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { UseFormWithSchemaProps, UseFormWithSchemaReturn } from './types';
import type { FieldValues } from 'react-hook-form';
import type { ZodSchema } from 'zod';

/**
 * useFormWithSchema - Enhanced useForm hook with Zod schema integration.
 *
 * Combines React Hook Form with Zod validation for type-safe forms.
 * Provides automatic type inference from the schema.
 *
 * @param props - Configuration including Zod schema and form options
 * @returns React Hook Form methods with inferred types
 *
 * @example
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * const { control, handleSubmit, formState } = useFormWithSchema({
 *   schema,
 *   defaultValues: { email: '', password: '' },
 * });
 */
export function useFormWithSchema<TSchema extends ZodSchema<FieldValues>>({
  schema,
  defaultValues,
  mode = 'onBlur',
  reValidateMode = 'onChange',
}: UseFormWithSchemaProps<TSchema>): UseFormWithSchemaReturn<TSchema> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions -- Zod 4 types are not directly compatible with zodResolver v5 overloads
  const resolver = zodResolver(schema as any);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Return type must match the generic-inferred UseFormReturn
  return useForm({
    resolver,
    defaultValues,
    mode,
    reValidateMode,
  }) as UseFormWithSchemaReturn<TSchema>;
}
