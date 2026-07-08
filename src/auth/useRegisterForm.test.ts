/**
 * Tests for useRegisterForm — focused on the P1-08 honeypot bot-protection and
 * that a clean submit reaches the register call. (Field validation has its own
 * coverage via the pure validators; this asserts the submit control flow.)
 */
import { renderHook, act } from '@testing-library/react-native';

import { useRegisterForm } from './useRegisterForm';

const mockRegister = jest.fn();

jest.mock('./AuthProvider', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

jest.mock('./verifyEmailRequest', () => ({
  buildVerifyUrlTemplate: () => 'https://katalogos.dloizides.com/verify-email?token={token}',
}));

// FM echoes the key so assertions can match on message identity.
jest.mock('../localization/helpers', () => ({
  FM: (key: string): string => key,
}));

/** Fill every real field with valid values so only the honeypot varies. */
function fillValid(result: { current: ReturnType<typeof useRegisterForm> }): void {
  act(() => {
    result.current.setField('firstName', 'Ada');
    result.current.setField('lastName', 'Lovelace');
    result.current.setField('username', 'ada');
    result.current.setField('email', 'ada@example.com');
    result.current.setField('password', 'Str0ng!pass');
    result.current.setField('confirmPassword', 'Str0ng!pass');
    result.current.setField('tenantName', "Ada's Bistro");
  });
}

describe('useRegisterForm — honeypot', () => {
  beforeEach(() => mockRegister.mockReset());

  it('refuses silently and does NOT call register when the honeypot is filled', async () => {
    const { result } = renderHook(() => useRegisterForm());
    fillValid(result);
    act(() => result.current.setField('website', 'http://spam.example')); // bot fills the trap

    let outcome: Awaited<ReturnType<typeof result.current.submit>> | undefined;
    await act(async () => {
      outcome = await result.current.submit();
    });

    expect(mockRegister).not.toHaveBeenCalled();
    expect(outcome?.ok).toBe(false);
    // Generic failure message — never reveals the honeypot.
    expect(outcome?.errorMessage).toBe('register.failed');
  });

  it('calls register and reports success when the honeypot is empty', async () => {
    mockRegister.mockResolvedValueOnce({ id: 'u1', username: 'ada' });
    const { result } = renderHook(() => useRegisterForm());
    fillValid(result); // website stays '' (its initial value)

    let outcome: Awaited<ReturnType<typeof result.current.submit>> | undefined;
    await act(async () => {
      outcome = await result.current.submit();
    });

    expect(mockRegister).toHaveBeenCalledTimes(1);
    // The honeypot field is forwarded (empty) so the BFF can also enforce it.
    expect(mockRegister.mock.calls[0][0]).toMatchObject({ website: '', email: 'ada@example.com' });
    expect(outcome?.ok).toBe(true);
  });
});
