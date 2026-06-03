import React from 'react';

import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { keycloakRealm } from '@/auth/keycloakConfig';
import { ImagePicker } from '@/components/Content/components/ImagePicker';
import { DISABLED_OPACITY, FULL_OPACITY, INPUT_MARGIN_TOP, wizardContentStyles } from '@/components/Dashboard/components/wizardContentStyles';
import type { WelcomeWizardState } from '@/features/dashboard/hooks/useWelcomeWizard';
import TemplateGallery from '@/features/onlinemenus/components/TemplateGallery/TemplateGallery';
import { useMenuTemplates } from '@/features/onlinemenus/hooks/useMenuTemplates';
import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import type { ThemeModeColors } from '@/theme/types/themeModeColors';

const REALM_QUESTIONER = 'questioner';

/**
 * Resolve the realm-keyed translation suffix for the current Keycloak realm.
 * Erevna runs against the `questioner` realm; Katalogos runs against
 * `onlinemenu`. The default falls through to `onlinemenu` to preserve the
 * existing copy for any environment where the realm isn't wired up yet.
 *
 * Exported for unit testing.
 */
// ts-prune-ignore-next -- exported only for unit tests (loaded via dynamic require)
export function resolveWizardRealmKey(): 'questioner' | 'onlinemenu' {
  if (keycloakRealm === REALM_QUESTIONER) return 'questioner';
  return 'onlinemenu';
}

type WizardState = WelcomeWizardState;

interface ContinueButtonProps {
  label: string;
  hint: string;
  onPress: () => void;
  loading: boolean;
  colors: ThemeModeColors;
  primary: string;
  disabled?: boolean;
}

const ContinueButton = (props: ContinueButtonProps): React.ReactElement => {
  const { label, hint, onPress, loading, colors, primary, disabled = false } = props;
  return (
    <TouchableOpacity
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={loading || disabled}
      style={[wizardContentStyles.ctaButton, { backgroundColor: primary, opacity: disabled ? DISABLED_OPACITY : FULL_OPACITY }]}
      testID={TestIds.WELCOME_WIZARD_CONTINUE_BUTTON}
      onPress={onPress}
    >
      {loading ? <ActivityIndicator color={colors.background} size="small" /> : null}
      {!loading && <Text style={[wizardContentStyles.ctaText, { color: colors.background }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

interface SkipButtonProps {
  onPress: () => void;
  colors: ThemeModeColors;
}

const SkipButton = ({ onPress, colors }: SkipButtonProps): React.ReactElement => {
  return (
    <TouchableOpacity
      accessibilityHint={FM('dashboard.wizard.skipStepHint')}
      accessibilityLabel={FM('dashboard.wizard.skipStep')}
      accessibilityRole="button"
      style={wizardContentStyles.skipButton}
      testID={TestIds.WELCOME_WIZARD_SKIP_BUTTON}
      onPress={onPress}
    >
      <Text style={[wizardContentStyles.skipText, { color: colors.textSecondary }]}>
        {FM('dashboard.wizard.skipStep')}
      </Text>
    </TouchableOpacity>
  );
}

interface StepContentProps {
  wizard: WizardState;
  colors: ThemeModeColors;
  primary: string;
}

export const Step1Content = ({ wizard, colors, primary }: StepContentProps): React.ReactElement => {
  const realmKey = resolveWizardRealmKey();
  const title = FM(`dashboard.wizard.step1Title.${realmKey}`);
  const subtitle = FM(`dashboard.wizard.step1Subtitle.${realmKey}`);
  const placeholder = FM(`dashboard.wizard.step1Placeholder.${realmKey}`);
  return (
    <>
      <Text style={[wizardContentStyles.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[wizardContentStyles.subtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>
      <TextInput
        accessibilityHint={FM('dashboard.wizard.step1InputHint')}
        accessibilityLabel={title}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[wizardContentStyles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        testID={TestIds.WELCOME_WIZARD_BUSINESS_NAME_INPUT}
        value={wizard.businessName}
        onChangeText={wizard.setBusinessName}
      />
      <ContinueButton colors={colors} hint={FM('dashboard.wizard.step1ContinueHint')} label={FM('dashboard.wizard.step1Continue')} loading={wizard.isSubmitting} primary={primary} onPress={wizard.handleContinue} />
      <SkipButton colors={colors} onPress={wizard.handleSkip} />
    </>
  );
}

export const Step2Content = ({ wizard, colors, primary }: StepContentProps): React.ReactElement => {
  return (
    <>
      <Text style={[wizardContentStyles.title, { color: colors.text }]}>
        {FM('dashboard.wizard.step2Title')}
      </Text>
      <Text style={[wizardContentStyles.subtitle, { color: colors.textSecondary }]}>
        {FM('dashboard.wizard.step2Subtitle')}
      </Text>
      <View style={wizardContentStyles.logoSection} testID={TestIds.WELCOME_WIZARD_LOGO_UPLOAD}>
        <ImagePicker
          isPublic
          label={FM('dashboard.wizard.logoLabel')}
          value={wizard.logoContentId ?? undefined}
          onChange={wizard.setLogoContentId}
        />
      </View>
      <ContinueButton colors={colors} hint={FM('dashboard.wizard.step2ContinueHint')} label={FM('dashboard.wizard.step2Continue')} loading={wizard.isSubmitting} primary={primary} onPress={wizard.handleContinue} />
      <SkipButton colors={colors} onPress={wizard.handleSkip} />
    </>
  );
}

export const Step3Content = ({ wizard, colors, primary }: StepContentProps): React.ReactElement => {
  const { templates, isLoading: templatesLoading } = useMenuTemplates();
  const inputStyle = [wizardContentStyles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }];
  return (
    <>
      <Text style={[wizardContentStyles.title, { color: colors.text }]}>{FM('dashboard.wizard.step3Title')}</Text>
      <Text style={[wizardContentStyles.subtitle, { color: colors.textSecondary }]}>{FM('dashboard.wizard.step3Subtitle')}</Text>
      <TemplateGallery
        isLoading={templatesLoading}
        selectedSlug={wizard.selectedTemplateSlug}
        templates={templates}
        onSelect={wizard.setSelectedTemplateSlug}
      />
      <TextInput
        accessibilityHint={FM('dashboard.wizard.step3MenuNameInputHint')}
        accessibilityLabel={FM('dashboard.wizard.step3Title')}
        placeholder={FM('dashboard.wizard.step3Placeholder')}
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
        testID={TestIds.WELCOME_WIZARD_MENU_NAME_INPUT}
        value={wizard.menuName}
        onChangeText={wizard.setMenuName}
      />
      <TextInput
        accessibilityHint={FM('dashboard.wizard.step3DescriptionInputHint')}
        accessibilityLabel={FM('dashboard.wizard.step3DescriptionPlaceholder')}
        placeholder={FM('dashboard.wizard.step3DescriptionPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
        testID={TestIds.WELCOME_WIZARD_MENU_DESCRIPTION_INPUT}
        value={wizard.menuDescription}
        onChangeText={wizard.setMenuDescription}
      />
      <ContinueButton colors={colors} disabled={wizard.menuName.trim() === ''} hint={FM('dashboard.wizard.step3ContinueHint')} label={FM('dashboard.wizard.step3Continue')} loading={wizard.isSubmitting} primary={primary} onPress={wizard.handleContinue} />
      <SkipButton colors={colors} onPress={wizard.handleSkip} />
    </>
  );
}

export const CompletedContent = ({ wizard, colors, primary }: StepContentProps): React.ReactElement => {
  return (
    <>
      <Text style={[wizardContentStyles.title, { color: colors.text }]}>
        {FM('dashboard.wizard.completedTitle')}
      </Text>
      <Text style={[wizardContentStyles.subtitle, { color: colors.textSecondary }]}>
        {FM('dashboard.wizard.completedSubtitle')}
      </Text>
      <TouchableOpacity
        accessibilityHint={FM('dashboard.wizard.completedCtaHint')}
        accessibilityLabel={FM('dashboard.wizard.completedCta')}
        accessibilityRole="button"
        style={[wizardContentStyles.ctaButton, { backgroundColor: primary, marginTop: INPUT_MARGIN_TOP }]}
        testID={TestIds.WELCOME_WIZARD_COMPLETE_BUTTON}
        onPress={wizard.handleComplete}
      >
        <Text style={[wizardContentStyles.ctaText, { color: colors.background }]}>
          {FM('dashboard.wizard.completedCta')}
        </Text>
      </TouchableOpacity>
    </>
  );
}
