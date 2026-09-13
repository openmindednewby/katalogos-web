/**
 * FM-backed copy for the shared `<RegisterForm>` from `@dloizides/auth-web`.
 *
 * The package ships English defaults only; the app passes its own translated
 * strings (`register.*` in `en.json`) and maps each `RegisterErrorCode` the form
 * reports to a localised message.
 */
import { useMemo } from 'react';

import { keycloakRealm } from './keycloakConfig';
import { FM } from '../localization/helpers';

import type { RegisterErrorCode, RegisterFormLabels } from '@dloizides/auth-web';

const REALM_QUESTIONER = 'questioner';

function resolveTenantNameLabel(): string {
  if (keycloakRealm === REALM_QUESTIONER) return FM('register.tenantName.questioner');
  return FM('register.tenantName.onlinemenu');
}

/** Localised field copy for every visible register input. */
function buildFieldLabels(): RegisterFormLabels['fields'] {
  return {
    firstName: { label: FM('register.firstName'), placeholder: FM('register.firstNamePlaceholder'), hint: FM('register.firstNameHint'), inputLabel: FM('register.firstNameInputLabel') },
    lastName: { label: FM('register.lastName'), placeholder: FM('register.lastNamePlaceholder'), hint: FM('register.lastNameHint'), inputLabel: FM('register.lastNameInputLabel') },
    username: { label: FM('register.username'), placeholder: FM('register.usernamePlaceholder'), hint: FM('register.usernameHint'), inputLabel: FM('register.usernameInputLabel') },
    email: { label: FM('register.email'), placeholder: FM('register.emailPlaceholder'), hint: FM('register.emailHint'), inputLabel: FM('register.emailInputLabel') },
    password: { label: FM('register.password'), placeholder: FM('register.passwordPlaceholder'), hint: FM('register.passwordHint'), inputLabel: FM('register.passwordInputLabel') },
    confirmPassword: { label: FM('register.confirmPassword'), placeholder: FM('register.confirmPasswordPlaceholder'), hint: FM('register.confirmPasswordHint'), inputLabel: FM('register.confirmPasswordInputLabel') },
    tenantName: { label: resolveTenantNameLabel(), placeholder: FM('register.tenantNamePlaceholder'), hint: FM('register.tenantNameHint'), inputLabel: FM('register.tenantNameInputLabel') },
  };
}

/** Memoised label bag for `<RegisterForm labels>`. */
export function useRegisterLabels(): RegisterFormLabels {
  return useMemo(
    () => ({
      title: FM('register.title'),
      subtitle: FM('register.subtitle'),
      submit: FM('register.submit'),
      submitHint: FM('register.submitHint'),
      submitting: FM('register.submitting'),
      fields: buildFieldLabels(),
    }),
    []
  );
}

/** Localised message for a register failure code; unknown codes get the generic failure. */
export function registerErrorMessage(code: RegisterErrorCode): string {
  const messages: Record<string, string | undefined> = {
    missingFields: FM('register.missingFields'),
    invalidEmail: FM('register.invalidEmail'),
    weakPassword: FM('register.weakPassword'),
    passwordMismatch: FM('register.passwordMismatch'),
    usernameTaken: FM('register.usernameTaken'),
    emailTaken: FM('register.emailTaken'),
    realmInvalid: FM('register.realmInvalid'),
    validationFailed: FM('register.validationFailed'),
  };
  return messages[code] ?? FM('register.failed');
}
