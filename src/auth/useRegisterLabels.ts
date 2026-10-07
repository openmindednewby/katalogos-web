import { RegisterErrorCode, type RegisterFormLabels } from '@dloizides/auth-web';

import { keycloakRealm } from './keycloakConfig';
import { FM } from '../localization/helpers';

const REALM_QUESTIONER = 'questioner';

function resolveTenantNameLabel(): string {
  if (keycloakRealm === REALM_QUESTIONER) return FM('register.tenantName.questioner');
  return FM('register.tenantName.onlinemenu');
}

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

/** Label bag for `<RegisterForm labels>`. Rebuilt on every render, not memoised: */
export function useRegisterLabels(): RegisterFormLabels {
  return {
    title: FM('register.title'),
    subtitle: FM('register.subtitle'),
    submit: FM('register.submit'),
    submitHint: FM('register.submitHint'),
    submitting: FM('register.submitting'),
    fields: buildFieldLabels(),
  };
}

/** Localised message for a register failure code. Exhaustive over */
export function registerErrorMessage(code: RegisterErrorCode): string {
  const messages: Record<RegisterErrorCode, string> = {
    [RegisterErrorCode.MissingFields]: FM('register.missingFields'),
    [RegisterErrorCode.InvalidEmail]: FM('register.invalidEmail'),
    [RegisterErrorCode.WeakPassword]: FM('register.weakPassword'),
    [RegisterErrorCode.PasswordMismatch]: FM('register.passwordMismatch'),
    [RegisterErrorCode.UsernameTaken]: FM('register.usernameTaken'),
    [RegisterErrorCode.EmailTaken]: FM('register.emailTaken'),
    [RegisterErrorCode.RealmInvalid]: FM('register.realmInvalid'),
    [RegisterErrorCode.ValidationFailed]: FM('register.validationFailed'),
    [RegisterErrorCode.Failed]: FM('register.failed'),
    [RegisterErrorCode.InFlight]: FM('register.failed'),
  };
  return messages[code];
}
