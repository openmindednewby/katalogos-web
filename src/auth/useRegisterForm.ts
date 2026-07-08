import { useCallback, useMemo, useState } from 'react';

import { type BffRegisterRequest, type BffUser } from '@dloizides/auth-client';

import { useAuth } from './AuthProvider';
import { buildVerifyUrlTemplate } from './verifyEmailRequest';
import { FM } from '../localization/helpers';

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_LETTER_REGEX = /[a-zA-Z]/;
const PASSWORD_DIGIT_REGEX = /\d/;
const PASSWORD_SPECIAL_REGEX = /[^a-zA-Z0-9]/;

/**
 * Server `errorCode` substrings the BFF / TenantService surface that map to a
 * localized field-level message. The BFF proxies `/bff/register` to
 * TenantService and returns the failure as a plain error; we match on the
 * message text rather than a typed `RegisterError` class.
 */
const ERROR_CODE_USERNAME_TAKEN = 'USERNAME_TAKEN';
const ERROR_CODE_EMAIL_TAKEN = 'EMAIL_TAKEN';
const ERROR_CODE_REALM_REQUIRED = 'REALM_REQUIRED';
const ERROR_CODE_REALM_INVALID = 'REALM_INVALID';

export interface RegisterFormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  tenantName: string;
  /**
   * Honeypot (P1-08 bot protection, no external captcha). Rendered as a
   * visually-hidden, aria-hidden, non-tab-focusable input that a human never
   * sees or fills, but naive form-filling bots populate. Any non-empty value =
   * a bot: the client silently refuses and the shared BFF also rejects it
   * server-side (for bots that POST directly, bypassing the form). MUST stay out
   * of the required-field checks so a legit empty submit passes.
   */
  website: string;
}

/**
 * Outcome of a registration submit. On success `user` carries the created
 * account so the screen can route by role; on failure `errorMessage` holds the
 * localized message to surface.
 */
interface RegisterSubmitResult {
  ok: boolean;
  errorMessage?: string;
  user?: BffUser;
}

interface RegisterFormApi {
  state: RegisterFormState;
  isSubmitting: boolean;
  setField: (field: keyof RegisterFormState, value: string) => void;
  submit: () => Promise<RegisterSubmitResult>;
}

const INITIAL_STATE: RegisterFormState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  tenantName: '',
  website: '',
};

function isPasswordStrong(password: string): boolean {
  if (password.length < MIN_PASSWORD_LENGTH) return false;
  if (!PASSWORD_LETTER_REGEX.test(password)) return false;
  if (!PASSWORD_DIGIT_REGEX.test(password)) return false;
  if (!PASSWORD_SPECIAL_REGEX.test(password)) return false;
  return true;
}

function trimState(state: RegisterFormState): RegisterFormState {
  return {
    firstName: state.firstName.trim(),
    lastName: state.lastName.trim(),
    username: state.username.trim(),
    email: state.email.trim(),
    password: state.password,
    confirmPassword: state.confirmPassword,
    tenantName: state.tenantName.trim(),
    website: state.website.trim(),
  };
}

function hasMissingRequiredField(trimmed: RegisterFormState): boolean {
  if (trimmed.firstName === '') return true;
  if (trimmed.lastName === '') return true;
  if (trimmed.username === '') return true;
  if (trimmed.email === '') return true;
  if (trimmed.password === '') return true;
  if (trimmed.tenantName === '') return true;
  return false;
}

function validateClientSide(trimmed: RegisterFormState): string | null {
  if (hasMissingRequiredField(trimmed)) return FM('register.missingFields');
  if (!EMAIL_REGEX.test(trimmed.email)) return FM('register.invalidEmail');
  if (!isPasswordStrong(trimmed.password)) return FM('register.weakPassword');
  if (trimmed.password !== trimmed.confirmPassword) return FM('register.passwordMismatch');
  return null;
}

/**
 * Decode a TenantService registration failure (surfaced by the BFF as a plain
 * error) into a localized message by matching known error-code substrings.
 */
function mapRegisterErrorToMessage(message: string): string {
  if (message.includes(ERROR_CODE_USERNAME_TAKEN)) return FM('register.usernameTaken');
  if (message.includes(ERROR_CODE_EMAIL_TAKEN)) return FM('register.emailTaken');
  if (message.includes(ERROR_CODE_REALM_REQUIRED)) return FM('register.realmInvalid');
  if (message.includes(ERROR_CODE_REALM_INVALID)) return FM('register.realmInvalid');
  return FM('register.validationFailed');
}

/**
 * Build the BFF register payload. `verifyUrlTemplate` is required by the
 * TenantService validator post-Bff.AspNetCore 1.2.5; the BFF substitutes the
 * generated verification token into the `{token}` placeholder when sending the
 * outbound email. {@link BffRegisterRequest} has an open index signature so the
 * extra field flows through without a typed-client bump.
 */
function buildRequest(trimmed: RegisterFormState): BffRegisterRequest {
  return {
    firstName: trimmed.firstName,
    lastName: trimmed.lastName,
    username: trimmed.username,
    email: trimmed.email,
    password: trimmed.password,
    tenantName: trimmed.tenantName,
    verifyUrlTemplate: buildVerifyUrlTemplate(),
    // Honeypot — always sent (empty for real users). The shared BFF rejects a
    // non-empty value. BffRegisterRequest's open index signature carries it.
    website: trimmed.website,
  };
}

/**
 * useRegisterForm — Encapsulates registration state, client-side validation,
 * and submission flow. Returned `submit()` resolves with `{ ok, errorMessage }`
 * so the screen can decide whether to navigate or show an alert.
 *
 * Registration goes through the BFF: `register` posts to `/bff/register`,
 * which the BFF proxies to TenantService and, on success, establishes a
 * session cookie. Server failures arrive as a plain error whose message is
 * decoded to a localized string.
 */
export function useRegisterForm(): RegisterFormApi {
  const { register } = useAuth();
  const [state, setState] = useState<RegisterFormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback((field: keyof RegisterFormState, value: string) => {
    setState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const submit = useCallback(async (): Promise<RegisterSubmitResult> => {
    const trimmed = trimState(state);

    // Honeypot: a filled hidden field means a bot. Refuse silently with the
    // generic failure message (never reveal it was the trap) and don't spend a
    // network call. The shared BFF is the backstop for direct-POST bots.
    if (trimmed.website !== '') return { ok: false, errorMessage: FM('register.failed') };

    const validationError = validateClientSide(trimmed);
    if (typeof validationError === 'string') return { ok: false, errorMessage: validationError };

    setIsSubmitting(true);
    try {
      const user = await register(buildRequest(trimmed));
      return { ok: true, user };
    } catch (error) {
      const message = error instanceof Error && error.message !== '' ? error.message : '';
      if (message === '') return { ok: false, errorMessage: FM('register.failed') };
      return { ok: false, errorMessage: mapRegisterErrorToMessage(message) };
    } finally {
      setIsSubmitting(false);
    }
  }, [register, state]);

  return useMemo<RegisterFormApi>(
    () => ({ state, isSubmitting, setField, submit }),
    [state, isSubmitting, setField, submit]
  );
}
