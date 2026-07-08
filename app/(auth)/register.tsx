import React from 'react';

import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';

import { useRouter } from 'expo-router';

import { keycloakRealm } from '../../src/auth/keycloakConfig';
import { resolvePostLoginDestination } from '../../src/auth/postLoginRoutes';
import { useRegisterForm, type RegisterFormState } from '../../src/auth/useRegisterForm';
import { AuthFooterMode } from '../../src/components/Auth/AuthFooterMode';
import LoginFooterLinks from '../../src/components/Auth/LoginFooterLinks';
import SaveButton from '../../src/components/Buttons/SaveButton';
import { useAnalytics } from '../../src/lib/analytics';
import { FM } from '../../src/localization/helpers';
import AnalyticsEventName from '../../src/shared/enums/AnalyticsEventName';
import { TestIds } from '../../src/shared/testIds';
import { useTheme } from '../../src/theme/hooks/useTheme';
import { showAlert } from '../../src/utils/showAlert';

const BOX_SHADOW = '0px 2px 8px rgba(0, 0, 0, 0.1)';
const REALM_QUESTIONER = 'questioner';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  formContainer: { width: '100%', maxWidth: 400, borderRadius: 12, padding: 24, boxShadow: BOX_SHADOW, elevation: 5 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 32, textAlign: 'center' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  buttonContainer: { marginTop: 8, marginBottom: 16 },
  // Honeypot (P1-08): present in the DOM so naive bots fill it, but pushed
  // off-screen + zero-size + transparent so a human never sees or tabs to it.
  honeypot: { position: 'absolute', left: -9999, top: -9999, width: 1, height: 1, opacity: 0 },
});

interface FieldDef {
  key: keyof RegisterFormState;
  label: string;
  placeholder: string;
  hint: string;
  inputLabel: string;
  testID: string;
  secureTextEntry?: boolean;
  autoComplete?: 'email' | 'username' | 'name';
  keyboardType?: 'email-address' | 'default';
}

function buildFieldDefs(tenantNameLabel: string): FieldDef[] {
  return [
    { key: 'firstName', label: FM('register.firstName'), placeholder: FM('register.firstNamePlaceholder'), hint: FM('register.firstNameHint'), inputLabel: FM('register.firstNameInputLabel'), testID: TestIds.REGISTER_FIRST_NAME_INPUT, autoComplete: 'name' },
    { key: 'lastName', label: FM('register.lastName'), placeholder: FM('register.lastNamePlaceholder'), hint: FM('register.lastNameHint'), inputLabel: FM('register.lastNameInputLabel'), testID: TestIds.REGISTER_LAST_NAME_INPUT, autoComplete: 'name' },
    { key: 'username', label: FM('register.username'), placeholder: FM('register.usernamePlaceholder'), hint: FM('register.usernameHint'), inputLabel: FM('register.usernameInputLabel'), testID: TestIds.REGISTER_USERNAME_INPUT, autoComplete: 'username' },
    { key: 'email', label: FM('register.email'), placeholder: FM('register.emailPlaceholder'), hint: FM('register.emailHint'), inputLabel: FM('register.emailInputLabel'), testID: TestIds.REGISTER_EMAIL_INPUT, autoComplete: 'email', keyboardType: 'email-address' },
    { key: 'password', label: FM('register.password'), placeholder: FM('register.passwordPlaceholder'), hint: FM('register.passwordHint'), inputLabel: FM('register.passwordInputLabel'), testID: TestIds.REGISTER_PASSWORD_INPUT, secureTextEntry: true },
    { key: 'confirmPassword', label: FM('register.confirmPassword'), placeholder: FM('register.confirmPasswordPlaceholder'), hint: FM('register.confirmPasswordHint'), inputLabel: FM('register.confirmPasswordInputLabel'), testID: TestIds.REGISTER_CONFIRM_PASSWORD_INPUT, secureTextEntry: true },
    { key: 'tenantName', label: tenantNameLabel, placeholder: FM('register.tenantNamePlaceholder'), hint: FM('register.tenantNameHint'), inputLabel: FM('register.tenantNameInputLabel'), testID: TestIds.REGISTER_TENANT_NAME_INPUT },
  ];
}

function resolveTenantNameLabel(): string {
  if (keycloakRealm === REALM_QUESTIONER) return FM('register.tenantName.questioner');
  return FM('register.tenantName.onlinemenu');
}

interface ColorScheme {
  text: string;
  border: string;
  background: string;
}

interface FieldProps {
  def: FieldDef;
  value: string;
  disabled: boolean;
  colors: ColorScheme;
  onChangeText: (text: string) => void;
}

const Field = ({ def, value, disabled, colors, onChangeText }: FieldProps): React.ReactElement => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: colors.text }]}>{def.label}</Text>
    <TextInput
      accessibilityHint={def.hint}
      accessibilityLabel={def.inputLabel}
      autoCapitalize="none"
      autoComplete={def.autoComplete}
      autoCorrect={false}
      editable={!disabled}
      keyboardType={def.keyboardType ?? 'default'}
      placeholder={def.placeholder}
      secureTextEntry={def.secureTextEntry === true}
      style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background }]}
      testID={def.testID}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const RegisterScreen = (): React.ReactElement => {
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme;
  const primaryColor = theme.palette.primary['500'];

  const { track } = useAnalytics();
  const { state, isSubmitting, setField, submit } = useRegisterForm();
  const tenantNameLabel = resolveTenantNameLabel();
  const fieldDefs = buildFieldDefs(tenantNameLabel);

  const handleSubmit = async (): Promise<void> => {
    track(AnalyticsEventName.SignupStarted, { product: 'katalogos' });
    const result = await submit();
    if (result.ok) {
      track(AnalyticsEventName.SignupCompleted, { product: 'katalogos' });
      router.replace(resolvePostLoginDestination(result.user));
      return;
    }
    showAlert(result.errorMessage ?? FM('register.failed'), FM('register.error'));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.formContainer, { backgroundColor: colors.surface }]} testID={TestIds.REGISTER_FORM}>
        <Text style={[styles.title, { color: colors.text }]}>{FM('register.title')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{FM('register.subtitle')}</Text>

        {fieldDefs.map((def) => (
          <Field
            key={def.key}
            colors={{ text: colors.text, border: colors.border, background: colors.background }}
            def={def}
            disabled={isSubmitting}
            value={state[def.key]}
            onChangeText={(text) => setField(def.key, text)}
          />
        ))}

        {/* Honeypot — hidden from humans; a filled value marks a bot (P1-08). */}
        <TextInput
          accessibilityElementsHidden
          accessibilityRole="none"
          autoComplete="off"
          focusable={false}
          importantForAccessibility="no-hide-descendants"
          placeholder="Website"
          style={styles.honeypot}
          testID="register-website"
          value={state.website}
          onChangeText={(text) => setField('website', text)}
        />

        <View style={styles.buttonContainer}>
          {isSubmitting ? (
            <ActivityIndicator color={primaryColor} size="large" />
          ) : (
            <SaveButton
              testID={TestIds.REGISTER_SUBMIT_BUTTON}
              title={FM('register.submit')}
              onPress={handleSubmit}
            />
          )}
        </View>

        <LoginFooterLinks mode={AuthFooterMode.Register} />
      </View>
    </View>
  );
};

export default RegisterScreen;
