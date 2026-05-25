/**
 * Grouped navigation cards for the Account Settings Hub.
 * Organized into Account, Business, and Advanced sections.
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import SettingsNavCard from './SettingsNavCard';
import { FM } from '../../../../localization/helpers';
import { Routes } from '../../../../navigation/routes';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { SECTION_SPACING, TITLE_FONT_SIZE, TITLE_GAP } from '../../constants';

const SECTION_HEADING_FONT_WEIGHT = '700' as const;

const styles = StyleSheet.create({
  container: { marginTop: SECTION_SPACING },
  sectionHeading: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: SECTION_HEADING_FONT_WEIGHT,
    marginTop: SECTION_SPACING,
    marginBottom: TITLE_GAP,
  },
});

const SettingsNavCards = (): React.ReactElement => {
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme;

  const navigate = useCallback((route: Routes) => () => { router.push(route); }, [router]);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeading, { color: colors.text }]} testID={TestIds.ACCOUNT_HUB_ACCOUNT_SECTION}>
        {FM('settings.hub.accountSection')}
      </Text>
      <SettingsNavCard accessibilityHint={FM('settings.hub.profileCardHint')} accessibilityLabel={FM('settings.hub.profileCard')} description={FM('settings.hub.profileCardDescription')} testID={TestIds.ACCOUNT_HUB_PROFILE_CARD} title={FM('settings.hub.profileCard')} onPress={navigate(Routes.PROFILE_SETTINGS)} />
      <SettingsNavCard accessibilityHint={FM('settings.hub.securityCardHint')} accessibilityLabel={FM('settings.hub.securityCard')} description={FM('settings.hub.securityCardDescription')} testID={TestIds.ACCOUNT_HUB_SECURITY_CARD} title={FM('settings.hub.securityCard')} onPress={navigate(Routes.SECURITY_SETTINGS)} />
      <SettingsNavCard accessibilityHint={FM('settings.hub.preferencesCardHint')} accessibilityLabel={FM('settings.hub.preferencesCard')} description={FM('settings.hub.preferencesCardDescription')} testID={TestIds.ACCOUNT_HUB_PREFERENCES_CARD} title={FM('settings.hub.preferencesCard')} onPress={navigate(Routes.PREFERENCES_SETTINGS)} />
      <SettingsNavCard accessibilityHint={FM('settings.hub.privacyCardHint')} accessibilityLabel={FM('settings.hub.privacyCard')} description={FM('settings.hub.privacyCardDescription')} testID={TestIds.ACCOUNT_HUB_PRIVACY_CARD} title={FM('settings.hub.privacyCard')} onPress={navigate(Routes.PRIVACY_SETTINGS)} />

      <Text style={[styles.sectionHeading, { color: colors.text }]} testID={TestIds.ACCOUNT_HUB_BUSINESS_SECTION}>
        {FM('settings.hub.businessSection')}
      </Text>
      <SettingsNavCard accessibilityHint={FM('settings.hub.businessProfileCardHint')} accessibilityLabel={FM('settings.hub.businessProfileCard')} description={FM('settings.hub.businessProfileCardDescription')} testID={TestIds.ACCOUNT_HUB_BUSINESS_PROFILE_CARD} title={FM('settings.hub.businessProfileCard')} onPress={navigate(Routes.BUSINESS_PROFILE_SETTINGS)} />
      <SettingsNavCard accessibilityHint={FM('settings.locations.menuCardHint')} accessibilityLabel={FM('settings.locations.menuCard')} description={FM('settings.locations.menuCardDescription')} testID={TestIds.LOCATION_SETTINGS_SCREEN} title={FM('settings.locations.menuCard')} onPress={navigate(Routes.LOCATION_SETTINGS)} />
      <SettingsNavCard accessibilityHint={FM('settings.hub.teamCardHint')} accessibilityLabel={FM('settings.hub.teamCard')} description={FM('settings.hub.teamCardDescription')} testID={TestIds.ACCOUNT_HUB_TEAM_CARD} title={FM('settings.hub.teamCard')} onPress={navigate(Routes.TEAM_SETTINGS)} />
      <SettingsNavCard accessibilityHint={FM('settings.hub.billingCardHint')} accessibilityLabel={FM('settings.hub.billingCard')} description={FM('settings.hub.billingCardDescription')} testID={TestIds.ACCOUNT_HUB_BILLING_CARD} title={FM('settings.hub.billingCard')} onPress={navigate(Routes.BILLING_SETTINGS)} />

      <Text style={[styles.sectionHeading, { color: colors.text }]} testID={TestIds.ACCOUNT_HUB_ADVANCED_SECTION}>
        {FM('settings.hub.advancedSection')}
      </Text>
      <SettingsNavCard accessibilityHint={FM('settings.hub.themeCardHint')} accessibilityLabel={FM('settings.hub.themeCard')} description={FM('settings.hub.themeCardDescription')} testID={TestIds.ACCOUNT_HUB_THEME_CARD} title={FM('settings.hub.themeCard')} onPress={navigate(Routes.THEME_SETTINGS)} />
      <SettingsNavCard accessibilityHint={FM('settings.hub.customDomainCardHint')} accessibilityLabel={FM('settings.hub.customDomainCard')} description={FM('settings.hub.customDomainCardDescription')} testID={TestIds.ACCOUNT_HUB_CUSTOM_DOMAIN_CARD} title={FM('settings.hub.customDomainCard')} onPress={navigate(Routes.CUSTOM_DOMAIN_SETTINGS)} />
      <SettingsNavCard accessibilityHint={FM('settings.hub.whiteLabelCardHint')} accessibilityLabel={FM('settings.hub.whiteLabelCard')} description={FM('settings.hub.whiteLabelCardDescription')} testID={TestIds.ACCOUNT_HUB_WHITE_LABEL_CARD} title={FM('settings.hub.whiteLabelCard')} onPress={navigate(Routes.WHITE_LABEL_SETTINGS)} />
    </View>
  );
};

export default SettingsNavCards;
