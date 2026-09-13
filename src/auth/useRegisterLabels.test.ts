import { registerErrorMessage } from './useRegisterLabels';
import { FM } from '../localization/helpers';

import type { RegisterErrorCode } from '@dloizides/auth-web';

describe('registerErrorMessage', () => {
  it.each([
    ['missingFields', 'register.missingFields'],
    ['invalidEmail', 'register.invalidEmail'],
    ['weakPassword', 'register.weakPassword'],
    ['passwordMismatch', 'register.passwordMismatch'],
    ['usernameTaken', 'register.usernameTaken'],
    ['emailTaken', 'register.emailTaken'],
    ['realmInvalid', 'register.realmInvalid'],
    ['validationFailed', 'register.validationFailed'],
  ])('maps %s to its own register key', (code, key) => {
    expect(registerErrorMessage(code as RegisterErrorCode)).toBe(FM(key));
  });

  it('falls back to the generic failure message for the failed code', () => {
    expect(registerErrorMessage('failed' as RegisterErrorCode)).toBe(FM('register.failed'));
  });
});
