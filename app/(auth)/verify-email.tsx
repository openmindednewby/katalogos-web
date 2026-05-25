/**
 * Verify-email landing page (`/verify-email?token=…`).
 *
 * Reachable while either logged in or logged out — the route lives under the
 * `(auth)` group which does not gate on session state. We deliberately do NOT
 * clear stale auth storage on mount (unlike `/login`) because users typically
 * land here directly after auto-login post-register, and clearing the session
 * mid-verify would log them out at the worst possible moment.
 *
 * Wire: read the `token` query param → POST `/bff/verify-email` with `{ token }`
 * (CSRF header required by `Bff.AspNetCore`'s same-origin guard). Render one
 * of three states: Loading → Success → Failure (keyed off `errorCode` from
 * the BFF response — `TOKEN_INVALID | TOKEN_EXPIRED | TOKEN_USED |
 * KEYCLOAK_UPDATE_FAILED`). On Success the user clicks Continue → `/` and the
 * AuthProvider's session bootstrap routes them by role.
 *
 * Direct `fetch` (no new `@dloizides/auth-client` method) is deliberate — the
 * verify-email surface is a one-shot, app-owned flow with no shared-component
 * value and adding it to the typed client would inflate the SDK surface for a
 * single same-origin POST.
 */
import React, { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';

import { StyleSheet, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { verifyEmailToken } from '../../src/auth/verifyEmailApi';
import { VerifyEmailErrorCode } from '../../src/auth/verifyEmailErrorCode';
import { VerifyEmailFailure, VerifyEmailLoading, VerifyEmailSuccess } from '../../src/components/Auth/VerifyEmailStates';
import { TestIds } from '../../src/shared/testIds';
import { useTheme } from '../../src/theme/hooks/useTheme';

const enum VerifyPhase {
  Loading = 'loading',
  Success = 'success',
  Failure = 'failure',
}

interface VerifyPhaseState {
  phase: VerifyPhase;
  errorCode: VerifyEmailErrorCode;
}

const INITIAL_STATE: VerifyPhaseState = {
  phase: VerifyPhase.Loading,
  errorCode: VerifyEmailErrorCode.Generic,
};

const styles = StyleSheet.create({
  root: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
});

function readQueryToken(raw: string | string[] | undefined): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  return '';
}

/**
 * Drive the verification POST. On mount: if no token, jump straight to the
 * failure state with the `MissingToken` code so the user sees the resend form
 * without us hitting the BFF. Otherwise post and route to Success / Failure.
 */
function useVerifyEmail(token: string): VerifyPhaseState {
  const [state, setState] = useState<VerifyPhaseState>(INITIAL_STATE);

  useEffect(() => {
    if (token === '') {
      setState({ phase: VerifyPhase.Failure, errorCode: VerifyEmailErrorCode.MissingToken });
      return;
    }
    let active = true;
    verifyEmailToken(token).then((result) => {
      if (!active) return;
      if (result.success) {
        setState({ phase: VerifyPhase.Success, errorCode: VerifyEmailErrorCode.Generic });
        return;
      }
      setState({ phase: VerifyPhase.Failure, errorCode: result.errorCode });
    }).catch(() => {
      // verifyEmailToken never throws (it returns Generic on failure), but the
      // type system still treats it as fallible — keep this no-op so the lint
      // rule for unhandled promise rejections stays happy.
    });
    return (): void => {
      active = false;
    };
  }, [token]);

  return state;
}

const VerifyEmailScreen = (): ReactElement => {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = useMemo(() => readQueryToken(params.token), [params.token]);
  const { phase, errorCode } = useVerifyEmail(token);

  const handleContinue = useCallback((): void => {
    router.replace('/');
  }, [router]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]} testID={TestIds.VERIFY_EMAIL_PAGE}>
      {phase === VerifyPhase.Loading ? <VerifyEmailLoading /> : null}
      {phase === VerifyPhase.Success ? <VerifyEmailSuccess onContinue={handleContinue} /> : null}
      {phase === VerifyPhase.Failure ? <VerifyEmailFailure errorCode={errorCode} /> : null}
    </View>
  );
};

export default VerifyEmailScreen;
