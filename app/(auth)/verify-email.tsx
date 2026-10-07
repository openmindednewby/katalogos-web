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
