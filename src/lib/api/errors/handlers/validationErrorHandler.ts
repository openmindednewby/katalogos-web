/**
 * Validation error handler.
 *
 * Extracts field-level validation errors from 400/422 response bodies.
 * Supports the common ASP.NET validation format:
 *   { errors: { fieldName: ['Error message 1', 'Error message 2'] } }
 */

import { isValueDefined } from '../../../../utils/is';

import type { ClassifiedError } from '../errorTypes';

/** A single field validation error */
interface FieldError {
  field: string;
  messages: string[];
}

/** Result of parsing validation errors from a response body */
interface ValidationResult {
  hasFieldErrors: boolean;
  fieldErrors: FieldError[];
  generalMessage: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return isValueDefined(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function extractFieldErrorsFromObject(errorsObj: Record<string, unknown>): FieldError[] {
  const fieldErrors: FieldError[] = [];

  for (const [field, messages] of Object.entries(errorsObj)) 
    if (isStringArray(messages))
      fieldErrors.push({ field, messages });
    else if (typeof messages === 'string')
      fieldErrors.push({ field, messages: [messages] });
  

  return fieldErrors;
}

/**
 * Extract field-level validation errors from a classified error's body.
 *
 * Supports multiple response formats:
 * - { errors: { fieldName: ['message'] } }
 * - { validationErrors: { fieldName: ['message'] } }
 * - { fieldName: ['message'] } (flat structure)
 */
function extractValidationErrors(error: ClassifiedError): ValidationResult {
  const body = error.body;
  const emptyResult: ValidationResult = {
    hasFieldErrors: false,
    fieldErrors: [],
    generalMessage: error.message,
  };

  if (!isRecord(body)) return emptyResult;

  const errorsSource = body.errors ?? body.validationErrors;
  if (isRecord(errorsSource)) {
    const fieldErrors = extractFieldErrorsFromObject(errorsSource);
    return buildValidationResult(fieldErrors, error.message);
  }

  const fieldErrors = extractFieldErrorsFromObject(body);
  if (fieldErrors.length > 0)
    return buildValidationResult(fieldErrors, error.message);

  return emptyResult;
}

function buildValidationResult(fieldErrors: FieldError[], fallbackMessage: string): ValidationResult {
  const hasFieldErrors = fieldErrors.length > 0;
  const generalMessage = hasFieldErrors
    ? fieldErrors.map((fe) => `${fe.field}: ${fe.messages.join(', ')}`).join('; ')
    : fallbackMessage;

  return { hasFieldErrors, fieldErrors, generalMessage };
}

export { extractValidationErrors };
export type { FieldError, ValidationResult };
