/**
 * Unit tests for `useAuthLabels` — the FM-backed label bags for the shared
 * `@dloizides/auth-web` device-PIN + passkey components (unified-login
 * Increment 3 Batch 3).
 *
 * Focus: the placeholder-token bridging logic. katalogos stores the FM-standard
 * double-brace `{{p1}}` in its JSON, but the shared package interpolates a
 * SINGLE-brace `{count}` / `{name}` token. These tests assert the hooks rewrite
 * the FM placeholder to the package token for exactly the placeholder-bearing
 * keys, and leave plain strings untouched.
 */
import { renderHook } from '@testing-library/react-native';

import {
  useDevicePinUnlockLabels,
  useDevicePinEnrollLabels,
  useDevicePinSettingsLabels,
  usePasskeyLoginLabels,
  usePasskeySettingsLabels,
} from './useAuthLabels';

// FM echoes the key so each label's value is its own translation key — except
// the placeholder-bearing keys, which return a template carrying `{{p1}}` so we
// can assert the conversion to the package's single-brace token.
const PLACEHOLDER_TEMPLATES: Record<string, string> = {
  'auth.devicePin.unlock.title': 'Welcome back, {{p1}}',
  'auth.devicePin.unlock.description': 'Enter your {{p1}}-digit PIN.',
  'auth.devicePin.unlock.errorIncomplete': 'Enter all {{p1}} digits.',
  'auth.devicePin.unlock.errorLockedOutRetry': 'Try again in {{p1}} seconds.',
  'auth.devicePin.unlock.errorRateLimitedRetry': 'Try again in {{p1}} seconds.',
  'auth.devicePin.enroll.formDescription': 'Pick a {{p1}}-digit PIN.',
  'auth.devicePin.enroll.lengthOptionHint': 'Use a {{p1}}-digit PIN',
  'auth.devicePin.enroll.errorMismatch': 'Must be exactly {{p1}} digits.',
};

jest.mock('../localization/helpers', () => ({
  FM: (key: string): string => PLACEHOLDER_TEMPLATES[key] ?? key,
}));

describe('useDevicePinUnlockLabels', () => {
  it('rewrites the title `{{p1}}` to the package `{name}` token', () => {
    const { result } = renderHook(() => useDevicePinUnlockLabels());
    expect(result.current.title).toBe('Welcome back, {name}');
  });

  it('rewrites count-bearing keys to the package `{count}` token', () => {
    const { result } = renderHook(() => useDevicePinUnlockLabels());
    expect(result.current.description).toBe('Enter your {count}-digit PIN.');
    expect(result.current.errorIncomplete).toBe('Enter all {count} digits.');
    expect(result.current.errorLockedOutRetry).toBe('Try again in {count} seconds.');
    expect(result.current.errorRateLimitedRetry).toBe('Try again in {count} seconds.');
  });

  it('leaves non-placeholder keys as the plain FM value', () => {
    const { result } = renderHook(() => useDevicePinUnlockLabels());
    expect(result.current.titleNoName).toBe('auth.devicePin.unlock.titleNoName');
    expect(result.current.submit).toBe('auth.devicePin.unlock.submit');
  });
});

describe('useDevicePinEnrollLabels', () => {
  it('rewrites every count-bearing enrol key to the `{count}` token', () => {
    const { result } = renderHook(() => useDevicePinEnrollLabels());
    expect(result.current.formDescription).toBe('Pick a {count}-digit PIN.');
    expect(result.current.lengthOptionHint).toBe('Use a {count}-digit PIN');
    expect(result.current.errorMismatch).toBe('Must be exactly {count} digits.');
  });

  it('leaves the plain enrol keys untouched', () => {
    const { result } = renderHook(() => useDevicePinEnrollLabels());
    expect(result.current.offerAccept).toBe('auth.devicePin.enroll.offerAccept');
  });
});

describe('settings + passkey label bags', () => {
  it('returns the FM key for every device-PIN settings label (no placeholders)', () => {
    const { result } = renderHook(() => useDevicePinSettingsLabels());
    expect(result.current.title).toBe('auth.devicePin.settings.title');
    expect(result.current.disableFailed).toBe('auth.devicePin.settings.disableFailed');
  });

  it('returns the FM key for every passkey login + settings label', () => {
    const login = renderHook(() => usePasskeyLoginLabels());
    const settings = renderHook(() => usePasskeySettingsLabels());
    expect(login.result.current.signInButton).toBe('auth.passkey.login.signInButton');
    expect(settings.result.current.addButton).toBe('auth.passkey.settings.addButton');
  });
});
