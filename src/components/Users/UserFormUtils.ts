/**
 * Utility functions for UserForm.
 */

export interface UserFormPayload {
  username: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  enabled: boolean;
  tenantId?: string;
  roles: string[];
}

export interface TrimmedFormValues {
  username: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  tenantId: string;
}

interface FormValuesInput {
  username: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  selectedTenantId: string;
}

/**
 * Trims all string values from the form.
 */
export function trimFormValues(values: FormValuesInput): TrimmedFormValues {
  return {
    username: values.username.trim(),
    email: values.email.trim(),
    phoneNumber: values.phoneNumber.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    password: values.password.trim(),
    tenantId: values.selectedTenantId.trim(),
  };
}

/**
 * Converts a trimmed string to undefined if empty.
 */
export function toOptional(value: string): string | undefined {
  return value.length > 0 ? value : undefined;
}

/**
 * Parses roles from an unknown value.
 */
export function parseRoles(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((entry): entry is string => typeof entry === 'string');
}

interface BuildPayloadParams {
  trimmed: TrimmedFormValues;
  enabled: boolean;
  selectedRoles: string[];
}

/**
 * Builds the save payload from trimmed values.
 */
export function buildSavePayload({ trimmed, enabled, selectedRoles }: BuildPayloadParams): UserFormPayload {
  return {
    username: trimmed.username,
    email: toOptional(trimmed.email),
    phoneNumber: toOptional(trimmed.phoneNumber),
    firstName: toOptional(trimmed.firstName),
    lastName: toOptional(trimmed.lastName),
    password: toOptional(trimmed.password),
    enabled,
    tenantId: toOptional(trimmed.tenantId),
    roles: selectedRoles,
  };
}
