/**
 * Footer links shown on the login and register pages.
 *
 * - On the login page (mode = 'login'): "Don't have an account? Sign up" → register, then privacy/terms links.
 * - On the register page (mode = 'register'): "Already have an account? Sign in" → login, then privacy/terms links.
 *
 * Privacy + Terms open in modals (no navigation). The auth-mode link uses
 * expo-router to switch between /login and /register.
 */
import React, { useState, useCallback } from 'react';

import { StyleSheet, View, Text } from 'react-native';

import { useRouter } from 'expo-router';

import { FM } from '@/localization/helpers';

import { AuthFooterMode } from './AuthFooterMode';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { PrivacyPolicyModal } from '../Legal/PrivacyPolicyModal';
import { TermsOfServiceModal } from '../Legal/TermsOfServiceModal';

const FONT_SIZE = 12;
const LEGAL_GAP = 16;
const SECTION_MARGIN_TOP = 16;
const AUTH_LINK_MARGIN_TOP = 16;

const LOGIN_PATH = '/(auth)/login';
const REGISTER_PATH = '/(auth)/register';

const styles = StyleSheet.create({
  authLinkContainer: {
    marginTop: AUTH_LINK_MARGIN_TOP,
    alignItems: 'center',
  },
  authLink: {
    fontSize: FONT_SIZE,
    textDecorationLine: 'underline',
  },
  legalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: LEGAL_GAP,
    marginTop: SECTION_MARGIN_TOP,
  },
  legalLink: {
    fontSize: FONT_SIZE,
    textDecorationLine: 'underline',
  },
});

interface Props {
  /**
   * Page mode: Login shows a "Sign up" link, Register shows a "Sign in" link.
   * Defaults to AuthFooterMode.Login for backwards compatibility.
   */
  mode?: AuthFooterMode;
}

const LoginFooterLinks = ({ mode = AuthFooterMode.Login }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const router = useRouter();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleOpenPrivacy = useCallback(() => setShowPrivacy(true), []);
  const handleClosePrivacy = useCallback(() => setShowPrivacy(false), []);
  const handleOpenTerms = useCallback(() => setShowTerms(true), []);
  const handleCloseTerms = useCallback(() => setShowTerms(false), []);

  const handleNavigateToRegister = useCallback(() => {
    router.push(REGISTER_PATH);
  }, [router]);

  const handleNavigateToLogin = useCallback(() => {
    router.push(LOGIN_PATH);
  }, [router]);

  const isLoginMode = mode === AuthFooterMode.Login;
  const authLinkText = isLoginMode ? FM('login.noAccount') : FM('register.haveAccount');
  const authLinkHint = isLoginMode ? FM('login.signUpLinkHint') : FM('register.signInLinkHint');
  const authLinkTestId = isLoginMode ? TestIds.LOGIN_SIGN_UP_LINK : TestIds.REGISTER_SIGN_IN_LINK;
  const authLinkHandler = isLoginMode ? handleNavigateToRegister : handleNavigateToLogin;

  return (
    <View>
      <View style={styles.authLinkContainer}>
        <Text
          accessibilityHint={authLinkHint}
          accessibilityLabel={authLinkText}
          accessibilityRole="link"
          style={[styles.authLink, { color: theme.colors.textSecondary }]}
          testID={authLinkTestId}
          onPress={authLinkHandler}
        >
          {authLinkText}
        </Text>
      </View>

      <View style={styles.legalContainer}>
        <Text
          accessibilityHint={FM('legal.privacyLinkHint')}
          accessibilityLabel={FM('legal.privacyLinkLabel')}
          accessibilityRole="link"
          style={[styles.legalLink, { color: theme.colors.textSecondary }]}
          testID={TestIds.LOGIN_PRIVACY_LINK}
          onPress={handleOpenPrivacy}
        >
          {FM('legal.privacyLinkLabel')}
        </Text>
        <Text
          accessibilityHint={FM('legal.termsLinkHint')}
          accessibilityLabel={FM('legal.termsLinkLabel')}
          accessibilityRole="link"
          style={[styles.legalLink, { color: theme.colors.textSecondary }]}
          testID={TestIds.LOGIN_TERMS_LINK}
          onPress={handleOpenTerms}
        >
          {FM('legal.termsLinkLabel')}
        </Text>

        <PrivacyPolicyModal visible={showPrivacy} onClose={handleClosePrivacy} />
        <TermsOfServiceModal visible={showTerms} onClose={handleCloseTerms} />
      </View>
    </View>
  );
};

export default LoginFooterLinks;
