/**
 * Forms infrastructure for React Hook Form + Zod integration.
 *
 * This module provides:
 * - useFormWithSchema: Enhanced useForm hook with Zod validation
 * - Common schemas: Reusable validation schemas (email, phone, password, etc.)
 * - Type definitions: Form-related TypeScript types
 *
 * @example
 * import { useFormWithSchema } from '@/lib/forms';
 * import { emailSchema, requiredString } from '@/lib/forms/schemas';
 * import { z } from 'zod';
 *
 * const schema = z.object({
 *   email: emailSchema,
 *   name: requiredString(),
 * });
 *
 * function MyForm() {
 *   const { control, handleSubmit } = useFormWithSchema({
 *     schema,
 *     defaultValues: { email: '', name: '' },
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <FormNativeInput name="email" control={control} label="Email" />
 *       <FormNativeInput name="name" control={control} label="Name" />
 *     </form>
 *   );
 * }
 */
export { useFormWithSchema } from './useFormWithSchema';
export type {
  UseFormWithSchemaProps,
  UseFormWithSchemaReturn,
  BaseFormFieldProps,
} from './types';
