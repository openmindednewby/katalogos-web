/**
 * Common Zod schema validators for reuse across the application.
 * All validation messages use i18n keys for internationalization.
 */
import { z } from 'zod';

import { isValueDefined } from '../../../utils/is';

/** Minimum password length requirement */
const PASSWORD_MIN_LENGTH = 8;

/**
 * Phone number validation schema.
 * Accepts international format with optional + prefix.
 * Uses i18n key: 'validation.phone.invalid'
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Creates a required string validator with custom i18n message key.
 *
 * @param messageKey - i18n key for the error message (default: 'validation.required')
 * @returns Zod string schema with min(1) validation
 *
 * @example
 * const schema = z.object({
 *   firstName: requiredString('validation.firstName.required'),
 * });
 */
export function requiredString(messageKey = 'validation.required'): z.ZodString {
  return z.string().min(1, { message: messageKey });
}

/**
 * Email validation schema.
 * Uses i18n key: 'validation.email.invalid'
 */
export const emailSchema = z.string().email({ message: 'validation.email.invalid' });
export const phoneSchema = z.string().regex(PHONE_REGEX, { message: 'validation.phone.invalid' });

/**
 * Password validation schema with complexity requirements.
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, { message: 'validation.password.minLength' })
  .regex(/[A-Z]/, { message: 'validation.password.uppercase' })
  .regex(/[a-z]/, { message: 'validation.password.lowercase' })
  .regex(/[0-9]/, { message: 'validation.password.number' });

/**
 * Date in the past validation schema.
 * Uses i18n key: 'validation.date.mustBePast'
 */
export const pastDateSchema = z.date().max(new Date(), {
  message: 'validation.date.mustBePast',
});

/**
 * Date in the future validation schema.
 * Uses i18n key: 'validation.date.mustBeFuture'
 */
export const futureDateSchema = z.date().min(new Date(), {
  message: 'validation.date.mustBeFuture',
});

/**
 * URL validation schema.
 * Uses i18n key: 'validation.url.invalid'
 */
export const urlSchema = z.string().url({ message: 'validation.url.invalid' });

/**
 * Creates a string length validation schema.
 *
 * @param min - Minimum length (optional)
 * @param max - Maximum length (optional)
 * @returns Zod string schema with length validation
 *
 * @example
 * const usernameSchema = stringLength(3, 20);
 */
export function stringLength(min?: number, max?: number): z.ZodString {
  let schema = z.string();

  if (isValueDefined(min))
    schema = schema.min(min, { message: 'validation.string.minLength' });

  if (isValueDefined(max))
    schema = schema.max(max, { message: 'validation.string.maxLength' });

  return schema;
}
