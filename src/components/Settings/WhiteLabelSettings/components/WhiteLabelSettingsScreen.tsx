/**
 * WhiteLabelSettingsScreen - main screen for managing white-label configuration.
 * Feature-gated to Enterprise tier via useSubscription.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import AppearanceSection from './AppearanceSection';
import AttributionSection from './AttributionSection';
import BrandIdentitySection from './BrandIdentitySection';
import SupportSection from './SupportSection';
import { useWhiteLabelConfig } from '../../../../hooks/whiteLabel/hooks/useWhiteLabelConfig';
import { useWhiteLabelMutation } from '../../../../hooks/whiteLabel/hooks/useWhiteLabelMutation';
import { notifyError, notifySuccess } from '../../../../lib/notifications';
import { useSubscription } from '../../../../lib/subscription/hooks/useSubscription';
import SubscriptionTier from '../../../../lib/subscription/utils/SubscriptionTier';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../../utils/is';
import { Button } from '../../../core/Button';
import ButtonVariant from '../../../core/Button/utils/ButtonVariant';
import Breadcrumb from '../../../Shared/Breadcrumb';
import Heading from '../../../Shared/Heading';
import Section from '../../../Shared/Section';
import UpgradePrompt from '../../../Shared/UpgradePrompt';
import { whiteLabelStyles } from '../styles';

import type { WhiteLabelFormState } from '../../../../hooks/whiteLabel/types';

function buildInitialForm(): WhiteLabelFormState {
  return {
    customLogoUrl: '',
    customFaviconUrl: '',
    customCss: '',
    headerHtml: '',
    footerHtml: '',
    showPoweredBy: true,
    companyName: '',
    supportEmail: '',
  };
}

const WhiteLabelSettingsScreen = (): React.ReactElement => {
  const { config, isLoading, isError } = useWhiteLabelConfig();
  const { theme } = useTheme();
  const { limits, tier } = useSubscription();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];

  const [form, setForm] = useState<WhiteLabelFormState>(buildInitialForm);

  useEffect(() => {
    if (!isValueDefined(config)) return;
    setForm({
      customLogoUrl: config.customLogoUrl ?? '',
      customFaviconUrl: config.customFaviconUrl ?? '',
      customCss: config.customCss ?? '',
      headerHtml: config.headerHtml ?? '',
      footerHtml: config.footerHtml ?? '',
      showPoweredBy: config.showPoweredBy,
      companyName: config.companyName ?? '',
      supportEmail: config.supportEmail ?? '',
    });
  }, [config]);

  const mutationCallbacks = useMemo(() => ({
    onSuccess: () => notifySuccess(FM('settings.whiteLabel.messages.saveSuccess')),
    onError: () => notifyError(FM('settings.whiteLabel.messages.saveError')),
  }), []);

  const { saveWhiteLabel, isPending } = useWhiteLabelMutation(mutationCallbacks);

  const handleSave = useCallback(() => {
    saveWhiteLabel(form);
  }, [form, saveWhiteLabel]);

  const updateField = useCallback(
    (field: keyof WhiteLabelFormState) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleTogglePoweredBy = useCallback((value: boolean) => {
    setForm((prev) => ({ ...prev, showPoweredBy: value }));
  }, []);

  if (isLoading)
    return (
      <View style={whiteLabelStyles.loadingContainer} testID={TestIds.WHITE_LABEL_LOADING}>
        <ActivityIndicator color={primary} size="large" />
        <Text style={[whiteLabelStyles.errorText, { color: colors.textSecondary }]}>{FM('loading')}</Text>
      </View>
    );

  if (isError)
    return (
      <View style={whiteLabelStyles.loadingContainer} testID={TestIds.WHITE_LABEL_ERROR}>
        <Text style={[whiteLabelStyles.errorText, { color: errorColor }]}>
          {FM('settings.whiteLabel.messages.loadError')}
        </Text>
      </View>
    );

  if (!limits.hasWhiteLabel)
    return (
      <View style={[whiteLabelStyles.container, { backgroundColor: colors.background }]} testID={TestIds.WHITE_LABEL_SCREEN}>
        <ScrollView contentContainerStyle={whiteLabelStyles.scrollContent}>
          <Breadcrumb />
          <Heading>{FM('settings.whiteLabel.title')}</Heading>
          <Text style={[whiteLabelStyles.description, { color: colors.textSecondary }]}>
            {FM('settings.whiteLabel.description')}
          </Text>
          <Section>
            <UpgradePrompt currentTier={tier} requiredTier={SubscriptionTier.Enterprise} />
          </Section>
        </ScrollView>
      </View>
    );

  const saveLabel = isPending ? FM('common.saving') : FM('settings.whiteLabel.save');

  return (
    <View style={[whiteLabelStyles.container, { backgroundColor: colors.background }]} testID={TestIds.WHITE_LABEL_SCREEN}>
      <ScrollView contentContainerStyle={whiteLabelStyles.scrollContent}>
        <Breadcrumb />
        <Heading>{FM('settings.whiteLabel.title')}</Heading>
        <Text style={[whiteLabelStyles.description, { color: colors.textSecondary }]}>
          {FM('settings.whiteLabel.description')}
        </Text>

        <BrandIdentitySection form={form} updateField={updateField} />
        <View style={whiteLabelStyles.sectionGap} />
        <AppearanceSection form={form} updateField={updateField} />
        <View style={whiteLabelStyles.sectionGap} />

        <AttributionSection colors={colors} showPoweredBy={form.showPoweredBy} onToggle={handleTogglePoweredBy} />

        <View style={whiteLabelStyles.sectionGap} />

        <SupportSection colors={colors} supportEmail={form.supportEmail} surfaceColor={colors.surface} onChangeEmail={updateField('supportEmail')} />

        <View style={whiteLabelStyles.sectionGap} />

        <Button
          accessibilityHint={FM('settings.whiteLabel.saveHint')}
          accessibilityLabel={FM('settings.whiteLabel.save')}
          disabled={isPending}
          label={saveLabel}
          loading={isPending}
          testID={TestIds.WHITE_LABEL_SAVE_BUTTON}
          variant={ButtonVariant.Primary}
          onPress={handleSave}
        />
      </ScrollView>
    </View>
  );
};

export default WhiteLabelSettingsScreen;
