import { RegisterErrorCode } from '@dloizides/auth-web';

import { registerErrorMessage } from './useRegisterLabels';
import { FM } from '../localization/helpers';

describe('registerErrorMessage', () => {
  it.each([
    [RegisterErrorCode.MissingFields, 'register.missingFields'],
    [RegisterErrorCode.InvalidEmail, 'register.invalidEmail'],
    [RegisterErrorCode.WeakPassword, 'register.weakPassword'],
    [RegisterErrorCode.PasswordMismatch, 'register.passwordMismatch'],
    [RegisterErrorCode.UsernameTaken, 'register.usernameTaken'],
    [RegisterErrorCode.EmailTaken, 'register.emailTaken'],
    [RegisterErrorCode.RealmInvalid, 'register.realmInvalid'],
    [RegisterErrorCode.ValidationFailed, 'register.validationFailed'],
    [RegisterErrorCode.Failed, 'register.failed'],
    [RegisterErrorCode.InFlight, 'register.failed'],
  ])('maps %s to %s', (code, key) => {
    expect(registerErrorMessage(code)).toBe(FM(key));
  });
});
