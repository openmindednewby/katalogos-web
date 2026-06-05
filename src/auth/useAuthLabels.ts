/**
 * FM-backed label bags for the shared `@dloizides/auth-web` device-PIN and
 * passkey components — unified-login Increment 3 Batch 3.
 *
 * `@dloizides/auth-web` ships no translation framework: each consuming app
 * passes already-localised strings through a typed `labels` prop. These hooks
 * build the bags from katalogos's own `FM()` keys (under `auth.devicePin.*` /
 * `auth.passkey.*` in `en.json`), so the package components render on-brand and
 * fully translated. The bags are memoised so the components don't see a fresh
 * reference on every render.
 */
import { useMemo } from 'react';

import { FM } from '../localization/helpers';

import type {
  DevicePinUnlockLabels,
  DevicePinEnrollLabels,
  DevicePinSettingsLabels,
  OtpFormLabels,
  PasskeyLoginLabels,
  PasskeySettingsLabels,
  PreferredMethodSettingsLabels,
  PreferredMethodHintLabels,
} from '@dloizides/auth-web';

/**
 * The shared `@dloizides/auth-web` components substitute their own placeholders
 * at render time via an internal `interpolate(template, { count | name })` that
 * matches a SINGLE-brace `{token}`. katalogos's translation files, however, must
 * use the FM-standard DOUBLE-brace `{{p1}}` (enforced by the repo's
 * `i18n-interpolation` lint rule). These converters bridge the two: they take
 * the FM-translated string (still carrying a literal `{{p1}}`, because no FM
 * param is passed) and rewrite it to the single-brace token the package expects,
 * so the package interpolates the live value (the PIN length / remembered name).
 */
const FM_PARAM_TOKEN = /\{\{p1\}\}/g;

/** Rewrite the FM `{{p1}}` placeholder to the package's `{count}` token. */
function toCountToken(translated: string): string {
  return translated.replace(FM_PARAM_TOKEN, '{count}');
}

/** Rewrite the FM `{{p1}}` placeholder to the package's `{name}` token. */
function toNameToken(translated: string): string {
  return translated.replace(FM_PARAM_TOKEN, '{name}');
}

/** Rewrite the FM `{{p1}}` placeholder to the `<OtpForm>` `{identifier}` token. */
function toIdentifierToken(translated: string): string {
  return translated.replace(FM_PARAM_TOKEN, '{identifier}');
}

/** Localised copy for `<OtpForm>` — the two-step email-OTP login form. */
export function useOtpLabels(): OtpFormLabels {
  return useMemo(
    () => ({
      requestTitle: FM('auth.otp.requestTitle'),
      requestDescription: FM('auth.otp.requestDescription'),
      emailLabel: FM('auth.otp.emailLabel'),
      emailPlaceholder: FM('auth.otp.emailPlaceholder'),
      requestSubmit: FM('auth.otp.requestSubmit'),
      requesting: FM('auth.otp.requesting'),
      invalidEmail: FM('auth.otp.invalidEmail'),
      verifyTitle: FM('auth.otp.verifyTitle'),
      verifyDescription: toIdentifierToken(FM('auth.otp.verifyDescription')),
      codeLabel: FM('auth.otp.codeLabel'),
      codePlaceholder: FM('auth.otp.codePlaceholder'),
      verifySubmit: FM('auth.otp.verifySubmit'),
      verifying: FM('auth.otp.verifying'),
      missingCode: FM('auth.otp.missingCode'),
      invalidCode: FM('auth.otp.invalidCode'),
      resend: FM('auth.otp.resend'),
      resending: FM('auth.otp.resending'),
      changeEmail: FM('auth.otp.changeEmail'),
    }),
    [],
  );
}

/** Localised copy for `<DevicePinUnlockScreen>`. */
export function useDevicePinUnlockLabels(): DevicePinUnlockLabels {
  return useMemo(
    () => ({
      title: toNameToken(FM('auth.devicePin.unlock.title')),
      titleNoName: FM('auth.devicePin.unlock.titleNoName'),
      description: toCountToken(FM('auth.devicePin.unlock.description')),
      pinLabel: FM('auth.devicePin.unlock.pinLabel'),
      pinPlaceholder: FM('auth.devicePin.unlock.pinPlaceholder'),
      submit: FM('auth.devicePin.unlock.submit'),
      submitting: FM('auth.devicePin.unlock.submitting'),
      usePasswordInstead: FM('auth.devicePin.unlock.usePasswordInstead'),
      usePasswordHint: FM('auth.devicePin.unlock.usePasswordHint'),
      errorIncomplete: toCountToken(FM('auth.devicePin.unlock.errorIncomplete')),
      errorInvalid: FM('auth.devicePin.unlock.errorInvalid'),
      errorLockedOut: FM('auth.devicePin.unlock.errorLockedOut'),
      errorLockedOutRetry: toCountToken(FM('auth.devicePin.unlock.errorLockedOutRetry')),
      errorRateLimited: FM('auth.devicePin.unlock.errorRateLimited'),
      errorRateLimitedRetry: toCountToken(FM('auth.devicePin.unlock.errorRateLimitedRetry')),
      errorGeneric: FM('auth.devicePin.unlock.errorGeneric'),
      digitFilledHint: FM('auth.devicePin.unlock.digitFilledHint'),
      digitEmptyHint: FM('auth.devicePin.unlock.digitEmptyHint'),
    }),
    [],
  );
}

/** Localised copy for `<DevicePinEnrollForm>` / `<DevicePinOffer>`. */
export function useDevicePinEnrollLabels(): DevicePinEnrollLabels {
  return useMemo(
    () => ({
      offerTitle: FM('auth.devicePin.enroll.offerTitle'),
      offerDescription: FM('auth.devicePin.enroll.offerDescription'),
      offerAccept: FM('auth.devicePin.enroll.offerAccept'),
      offerAcceptHint: FM('auth.devicePin.enroll.offerAcceptHint'),
      offerSkip: FM('auth.devicePin.enroll.offerSkip'),
      offerSkipHint: FM('auth.devicePin.enroll.offerSkipHint'),
      formTitle: FM('auth.devicePin.enroll.formTitle'),
      formDescription: toCountToken(FM('auth.devicePin.enroll.formDescription')),
      lengthLabel: FM('auth.devicePin.enroll.lengthLabel'),
      lengthOptionHint: toCountToken(FM('auth.devicePin.enroll.lengthOptionHint')),
      pinLabel: FM('auth.devicePin.enroll.pinLabel'),
      pinPlaceholder: FM('auth.devicePin.enroll.pinPlaceholder'),
      confirmLabel: FM('auth.devicePin.enroll.confirmLabel'),
      confirmPlaceholder: FM('auth.devicePin.enroll.confirmPlaceholder'),
      submit: FM('auth.devicePin.enroll.submit'),
      submitting: FM('auth.devicePin.enroll.submitting'),
      cancel: FM('auth.devicePin.enroll.cancel'),
      cancelHint: FM('auth.devicePin.enroll.cancelHint'),
      errorMismatch: toCountToken(FM('auth.devicePin.enroll.errorMismatch')),
      errorUnauthorized: FM('auth.devicePin.enroll.errorUnauthorized'),
      errorForbidden: FM('auth.devicePin.enroll.errorForbidden'),
      errorInvalidPin: FM('auth.devicePin.enroll.errorInvalidPin'),
      errorFailed: FM('auth.devicePin.enroll.errorFailed'),
    }),
    [],
  );
}

/** Localised copy for `<DevicePinSettingsCard>`. */
export function useDevicePinSettingsLabels(): DevicePinSettingsLabels {
  return useMemo(
    () => ({
      title: FM('auth.devicePin.settings.title'),
      description: FM('auth.devicePin.settings.description'),
      statusEnabled: FM('auth.devicePin.settings.statusEnabled'),
      statusDisabled: FM('auth.devicePin.settings.statusDisabled'),
      enable: FM('auth.devicePin.settings.enable'),
      enableHint: FM('auth.devicePin.settings.enableHint'),
      disable: FM('auth.devicePin.settings.disable'),
      disableHint: FM('auth.devicePin.settings.disableHint'),
      disabling: FM('auth.devicePin.settings.disabling'),
      disableFailed: FM('auth.devicePin.settings.disableFailed'),
    }),
    [],
  );
}

/** Localised copy for `<PasskeyLoginButton>`. */
export function usePasskeyLoginLabels(): PasskeyLoginLabels {
  return useMemo(
    () => ({
      signInButton: FM('auth.passkey.login.signInButton'),
      signInHint: FM('auth.passkey.login.signInHint'),
      errorCancelled: FM('auth.passkey.login.errorCancelled'),
      errorFailed: FM('auth.passkey.login.errorFailed'),
    }),
    [],
  );
}

/** Localised copy for `<PasskeySettingsCard>`. */
export function usePasskeySettingsLabels(): PasskeySettingsLabels {
  return useMemo(
    () => ({
      title: FM('auth.passkey.settings.title'),
      description: FM('auth.passkey.settings.description'),
      reauthHint: FM('auth.passkey.settings.reauthHint'),
      addButton: FM('auth.passkey.settings.addButton'),
      addHint: FM('auth.passkey.settings.addHint'),
      registeredSuccess: FM('auth.passkey.settings.registeredSuccess'),
    }),
    [],
  );
}

/** Localised copy for `<PreferredMethodSettingsCard>` (unified-login D5). */
export function usePreferredMethodSettingsLabels(): PreferredMethodSettingsLabels {
  return useMemo(
    () => ({
      title: FM('auth.preferredMethod.settings.title'),
      description: FM('auth.preferredMethod.settings.description'),
      noPreference: FM('auth.preferredMethod.settings.noPreference'),
      methodPassword: FM('auth.preferredMethod.settings.methodPassword'),
      methodPin: FM('auth.preferredMethod.settings.methodPin'),
      methodPasskey: FM('auth.preferredMethod.settings.methodPasskey'),
      saving: FM('auth.preferredMethod.settings.saving'),
      saveFailed: FM('auth.preferredMethod.settings.saveFailed'),
    }),
    [],
  );
}

/** Localised copy for `<PreferredMethodHint>` (unified-login D5). */
export function usePreferredMethodHintLabels(): PreferredMethodHintLabels {
  return useMemo(
    () => ({
      password: FM('auth.preferredMethod.hint.password'),
      pin: FM('auth.preferredMethod.hint.pin'),
      passkey: FM('auth.preferredMethod.hint.passkey'),
    }),
    [],
  );
}
