/**
 * Privacy Settings Screen.
 * Main screen combining consent management, data export, and account deletion.
 */
import React from 'react';

import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';

import AccountDeletionSection from './AccountDeletionSection';
import ConsentManagement from './ConsentManagement';
import DataExportSection from './DataExportSection';
import { useGetConsent } from '../../../../lib/hooks/privacy';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Breadcrumb from '../../../Shared/Breadcrumb';
import Heading from '../../../Shared/Heading';
import { SECTION_SPACING, BODY_FONT_SIZE, ERROR_TEXT_MARGIN_TOP } from '../constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SECTION_SPACING,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: BODY_FONT_SIZE,
    textAlign: 'center',
    marginTop: ERROR_TEXT_MARGIN_TOP,
  },
  sectionGap: {
    marginTop: SECTION_SPACING,
  },
});

const PrivacySettingsScreen = (): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];

  const { isLoading, isError } = useGetConsent();

  if (isLoading)
    return (
      <View style={styles.loadingContainer} testID={TestIds.PRIVACY_SETTINGS_LOADING}>
        <ActivityIndicator color={primary} size="large" />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{FM('loading')}</Text>
      </View>
    );

  if (isError)
    return (
      <View style={styles.loadingContainer} testID={TestIds.PRIVACY_SETTINGS_ERROR}>
        <Text style={[styles.errorText, { color: errorColor }]}>
          {FM('settings.privacy.messages.loadError')}
        </Text>
      </View>
    );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      testID={TestIds.PRIVACY_SETTINGS_SCREEN}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Breadcrumb />
        <Heading>{FM('settings.privacy.title')}</Heading>

        <ConsentManagement />

        <View style={styles.sectionGap}>
          <DataExportSection />
        </View>

        <View style={styles.sectionGap}>
          <AccountDeletionSection />
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacySettingsScreen;
