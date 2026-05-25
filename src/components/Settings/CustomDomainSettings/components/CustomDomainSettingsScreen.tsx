/**
 * CustomDomainSettingsScreen - main screen for managing a custom domain.
 * Shows either the add-domain form or the domain status with DNS instructions.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AddDomainForm from './AddDomainForm';
import DnsInstructions from './DnsInstructions';
import DomainStatusBadge from './DomainStatusBadge';
import { useCustomDomain } from '../../../../lib/hooks/customDomain';
import CustomDomainStatus from '../../../../lib/hooks/customDomain/enums/CustomDomainStatus';
import { notifyError, notifySuccess } from '../../../../lib/notifications';
import { useSubscription } from '../../../../lib/subscription/hooks/useSubscription';
import SubscriptionTier from '../../../../lib/subscription/utils/SubscriptionTier';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../../utils/is';
import Breadcrumb from '../../../Shared/Breadcrumb';
import Heading from '../../../Shared/Heading';
import Section from '../../../Shared/Section';
import UpgradePrompt from '../../../Shared/UpgradePrompt';
import {
  BODY_FONT_SIZE,
  DESCRIPTION_FONT_SIZE,
  ERROR_TEXT_MARGIN_TOP,
  MEDIUM_SPACING,
  SECTION_SPACING,
} from '../../constants';
import { ACTION_BORDER_RADIUS, ACTION_PADDING_H, ACTION_PADDING_V, SECTION_GAP_HEIGHT } from '../constants';

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SECTION_SPACING },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: BODY_FONT_SIZE, textAlign: 'center', marginTop: ERROR_TEXT_MARGIN_TOP },
  description: { fontSize: DESCRIPTION_FONT_SIZE, marginBottom: MEDIUM_SPACING },
  domainName: { fontSize: BODY_FONT_SIZE, fontWeight: '600', marginBottom: MEDIUM_SPACING },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: MEDIUM_SPACING, marginBottom: MEDIUM_SPACING },
  actionsRow: { flexDirection: 'row', gap: MEDIUM_SPACING, flexWrap: 'wrap' },
  actionButton: { paddingVertical: ACTION_PADDING_V, paddingHorizontal: ACTION_PADDING_H, borderRadius: ACTION_BORDER_RADIUS, borderWidth: 1 },
  actionText: { fontSize: BODY_FONT_SIZE, fontWeight: '600' },
  sectionGap: { height: SECTION_GAP_HEIGHT },
});

const CustomDomainSettingsScreen = (): React.ReactElement => {
  const { domain, isLoading, error, addDomain, removeDomain, requestVerification } = useCustomDomain();
  const [isPending, setIsPending] = useState(false);
  const { theme } = useTheme();
  const { limits, tier } = useSubscription();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];

  const handleAddDomain = useCallback(async (domainName: string) => {
    setIsPending(true);
    try {
      await addDomain(domainName);
      notifySuccess(FM('settings.customDomain.addSuccess'));
    } catch {
      notifyError(FM('settings.customDomain.addFailed'));
    } finally {
      setIsPending(false);
    }
  }, [addDomain]);

  const executeRemove = useCallback(() => {
    setIsPending(true);
    removeDomain()
      .then(() => notifySuccess(FM('settings.customDomain.removeSuccess')))
      .catch(() => notifyError(FM('settings.customDomain.removeFailed')))
      .finally(() => setIsPending(false));
  }, [removeDomain]);

  const handleRemoveDomain = useCallback(() => {
    Alert.alert(
      FM('settings.customDomain.removeDomain'),
      FM('settings.customDomain.removeConfirm'),
      [
        { text: FM('common.cancel'), style: 'cancel' },
        { text: FM('common.confirm'), style: 'destructive', onPress: executeRemove },
      ],
    );
  }, [executeRemove]);

  const handleVerify = useCallback(async () => {
    setIsPending(true);
    try {
      await requestVerification();
      notifySuccess(FM('settings.customDomain.verifyRequested'));
    } catch {
      notifyError(FM('settings.customDomain.verifyFailed'));
    } finally {
      setIsPending(false);
    }
  }, [requestVerification]);

  const showVerifyButton = useMemo(() => {
    if (!isValueDefined(domain)) return false;
    return domain.status === CustomDomainStatus.PendingVerification
      || domain.status === CustomDomainStatus.Failed;
  }, [domain]);

  if (isLoading)
    return (
      <View style={styles.loadingContainer} testID={TestIds.CUSTOM_DOMAIN_LOADING}>
        <ActivityIndicator color={primary} size="large" />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{FM('loading')}</Text>
      </View>
    );

  if (isValueDefined(error))
    return (
      <View style={styles.loadingContainer} testID={TestIds.CUSTOM_DOMAIN_ERROR}>
        <Text style={[styles.errorText, { color: errorColor }]}>{FM('settings.customDomain.loadError')}</Text>
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID={TestIds.CUSTOM_DOMAIN_SCREEN}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Breadcrumb />
        <Heading>{FM('settings.customDomain.title')}</Heading>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {FM('settings.customDomain.description')}
        </Text>

        {isValueDefined(domain) ? (
          <>
            <Section>
              <View style={styles.statusRow}>
                <Text style={[styles.domainName, { color: colors.text }]}>{domain.domainName}</Text>
                <DomainStatusBadge status={domain.status} />
              </View>

              <DnsInstructions
                cnameTarget={domain.cnameTarget}
                domainName={domain.domainName}
                ownershipToken={domain.ownershipToken}
              />
            </Section>
            <View style={styles.sectionGap} />

            <Section>
              <View style={styles.actionsRow}>
                {showVerifyButton ? (
                  <TouchableOpacity
                    accessibilityHint={FM('settings.customDomain.verifyHint')}
                    accessibilityLabel={FM('settings.customDomain.verify')}
                    accessibilityRole="button"
                    disabled={isPending}
                    style={[styles.actionButton, { borderColor: primary }]}
                    testID={TestIds.CUSTOM_DOMAIN_VERIFY_BUTTON}
                    onPress={handleVerify}
                  >
                    <Text style={[styles.actionText, { color: primary }]}>
                      {FM('settings.customDomain.verify')}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  accessibilityHint={FM('settings.customDomain.removeDomainHint')}
                  accessibilityLabel={FM('settings.customDomain.removeDomain')}
                  accessibilityRole="button"
                  disabled={isPending}
                  style={[styles.actionButton, { borderColor: errorColor }]}
                  testID={TestIds.CUSTOM_DOMAIN_REMOVE_BUTTON}
                  onPress={handleRemoveDomain}
                >
                  <Text style={[styles.actionText, { color: errorColor }]}>
                    {FM('settings.customDomain.removeDomain')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Section>
          </>
        ) : null}

        {!isValueDefined(domain) && limits.hasCustomDomain ? (
          <Section>
            <AddDomainForm isPending={isPending} onSubmit={handleAddDomain} />
          </Section>
        ) : null}

        {!isValueDefined(domain) && !limits.hasCustomDomain ? (
          <Section>
            <UpgradePrompt currentTier={tier} requiredTier={SubscriptionTier.Pro} />
          </Section>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default CustomDomainSettingsScreen;
