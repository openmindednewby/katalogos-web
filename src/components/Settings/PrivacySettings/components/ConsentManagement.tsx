/**
 * Consent Management section.
 * Displays toggle switches for analytics/marketing consent.
 * Essential consent is always on and disabled.
 */
import React, { useCallback, useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import {
  useGetConsent,
  useUpdateConsent,
  ConsentType,
} from '../../../../lib/hooks/privacy';
import { notifyError, notifySuccess } from '../../../../lib/notifications';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { FormSwitch } from '../../../Forms';
import Section from '../../../Shared/Section';
import {
  TITLE_FONT_SIZE,
  TITLE_GAP,
  DESCRIPTION_FONT_SIZE,
  MEDIUM_SPACING,
} from '../constants';

import type { ConsentRecord } from '../../../../lib/hooks/privacy';

const TITLE_FONT_WEIGHT = '600' as const;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: TITLE_FONT_WEIGHT,
    marginBottom: TITLE_GAP,
  },
  sectionDescription: {
    fontSize: DESCRIPTION_FONT_SIZE,
    marginBottom: MEDIUM_SPACING,
  },
});

function isConsentGranted(consents: ConsentRecord[], consentType: ConsentType): boolean {
  const record = consents.find((c) => c.consentType === consentType);
  return record?.isGranted ?? false;
}

const ConsentManagement = (): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  const { consents } = useGetConsent();

  const handleConsentSuccess = useCallback(() => {
    notifySuccess(FM('settings.privacy.consent.messages.updateSuccess'));
  }, []);

  const handleConsentError = useCallback(
    (_error: Error) => {
      notifyError(FM('settings.privacy.consent.messages.updateError'));
    },
    [],
  );

  const updateCallbacks = useMemo(
    () => ({ onSuccess: handleConsentSuccess, onError: handleConsentError }),
    [handleConsentSuccess, handleConsentError],
  );

  const { updateConsentType, isPending } = useUpdateConsent(updateCallbacks);

  const handleAnalyticsChange = useCallback(
    (value: boolean) => updateConsentType(ConsentType.Analytics, value),
    [updateConsentType],
  );

  const handleMarketingChange = useCallback(
    (value: boolean) => updateConsentType(ConsentType.Marketing, value),
    [updateConsentType],
  );

  const analyticsEnabled = isConsentGranted(consents, ConsentType.Analytics);
  const marketingEnabled = isConsentGranted(consents, ConsentType.Marketing);

  return (
    <Section>
      <View testID={TestIds.CONSENT_SECTION}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {FM('settings.privacy.consent.title')}
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          {FM('settings.privacy.consent.description')}
        </Text>

        <FormSwitch
          disabled
          value
          accessibilityHint={FM('settings.privacy.consent.essentialHint')}
          description={FM('settings.privacy.consent.essentialDescription')}
          label={FM('settings.privacy.consent.essential')}
          testID={TestIds.CONSENT_ESSENTIAL_SWITCH}
          onValueChange={() => {}}
        />

        <FormSwitch
          accessibilityHint={FM('settings.privacy.consent.analyticsHint')}
          description={FM('settings.privacy.consent.analyticsDescription')}
          disabled={isPending}
          label={FM('settings.privacy.consent.analytics')}
          testID={TestIds.CONSENT_ANALYTICS_SWITCH}
          value={analyticsEnabled}
          onValueChange={handleAnalyticsChange}
        />

        <FormSwitch
          accessibilityHint={FM('settings.privacy.consent.marketingHint')}
          description={FM('settings.privacy.consent.marketingDescription')}
          disabled={isPending}
          label={FM('settings.privacy.consent.marketing')}
          testID={TestIds.CONSENT_MARKETING_SWITCH}
          value={marketingEnabled}
          onValueChange={handleMarketingChange}
        />
      </View>
    </Section>
  );
};

export default ConsentManagement;
