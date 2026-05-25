/**
 * Notification Preferences Screen.
 * Allows users to configure their notification settings.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';

import SaveButton from '@/components/Buttons/SaveButton';
import { FormSwitch } from '@/components/Forms';
import {
  BODY_FONT_SIZE,
  ERROR_TEXT_MARGIN_TOP,
  MEDIUM_SPACING,
  SECTION_SPACING,
  TITLE_FONT_SIZE,
} from '@/components/Settings/constants';
import Breadcrumb from '@/components/Shared/Breadcrumb';
import Heading from '@/components/Shared/Heading';
import Section from '@/components/Shared/Section';
import {
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/lib/hooks/notification';
import type {
  NotificationPreferences,
  DisplayPreference,
  NotificationCategoryKey,
} from '@/lib/hooks/notification';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';
import { layoutStyles } from '@/theme/utils/layout';
import { isValueDefined } from '@/utils/is';

import NotificationCategoriesSection from './NotificationCategoriesSection';
import { getDefaultPreferences } from '../utils/notificationPreferencesHelpers';



const SAVE_BUTTON_MARGIN_TOP = 24;
const SAVE_BUTTON_MARGIN_BOTTOM = 32;

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
  sectionTitle: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
    marginBottom: MEDIUM_SPACING,
  },
  saveButtonContainer: {
    marginTop: SAVE_BUTTON_MARGIN_TOP,
    marginBottom: SAVE_BUTTON_MARGIN_BOTTOM,
  },
});

const NotificationPreferencesScreen = (): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];

  const { preferences, isLoading, isError } = useGetNotificationPreferences();
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>(
    getDefaultPreferences()
  );
  const [hasChanges, setHasChanges] = useState(false);

  const handleSuccess = useCallback(() => {
    notifySuccess(FM('settings.notificationPreferences.messages.saveSuccess'));
    setHasChanges(false);
  }, []);

  const handleError = useCallback(
    (_error: Error) => {
      notifyError(FM('settings.notificationPreferences.messages.saveError'));
    },
    []
  );

  const updateCallbacks = useMemo(() => ({ onSuccess: handleSuccess, onError: handleError }), [handleSuccess, handleError]);
  const { updatePreferences, isPending } = useUpdateNotificationPreferences(updateCallbacks);

  useEffect(() => {
    if (isValueDefined(preferences))
      setLocalPreferences(preferences);

  }, [preferences]);

  const handleNotificationsEnabledChange = useCallback((enabled: boolean) => {
    setLocalPreferences((prev) => ({ ...prev, notificationsEnabled: enabled }));
    setHasChanges(true);
  }, []);

  const handleQuietHoursChange = useCallback((enabled: boolean) => {
    setLocalPreferences((prev) => ({ ...prev, quietHoursEnabled: enabled }));
    setHasChanges(true);
  }, []);

  const handleCategoryChange = useCallback(
    (categoryKey: NotificationCategoryKey, enabled: boolean) => {
      setLocalPreferences((prev) => ({
        ...prev,
        categoryPreferences: {
          ...prev.categoryPreferences,
          [categoryKey]: { ...prev.categoryPreferences[categoryKey], enabled },
        },
      }));
      setHasChanges(true);
    },
    []
  );

  const handleDisplayChange = useCallback(
    (categoryKey: NotificationCategoryKey, display: DisplayPreference) => {
      setLocalPreferences((prev) => ({
        ...prev,
        categoryPreferences: {
          ...prev.categoryPreferences,
          [categoryKey]: { ...prev.categoryPreferences[categoryKey], displayPreference: display },
        },
      }));
      setHasChanges(true);
    },
    []
  );

  const handleSave = useCallback(() => {
    updatePreferences(localPreferences);
  }, [localPreferences, updatePreferences]);

  if (isLoading)
    return (
      <View style={styles.loadingContainer} testID={TestIds.LOADING_INDICATOR}>
        <ActivityIndicator color={primary} size="large" />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{FM('loading')}</Text>
      </View>
    );

  if (isError)
    return (
      <View style={styles.loadingContainer} testID={TestIds.NOTIFICATION_PREFERENCES_ERROR}>
        <Text style={[styles.errorText, { color: errorColor }]}>
          {FM('settings.notificationPreferences.messages.loadError')}
        </Text>
      </View>
    );

  const isSaveDisabled = !hasChanges || isPending;
  const buttonTitle = isPending ? FM('common.saving') : FM('settings.notificationPreferences.save');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID={TestIds.NOTIFICATION_PREFERENCES_SCREEN}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Breadcrumb />
        <Heading>{FM('settings.notificationPreferences.title')}</Heading>

        <Section style={layoutStyles.sectionSpacing}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {FM('settings.notificationPreferences.generalSettings')}
          </Text>
          <FormSwitch
            description={FM('settings.notificationPreferences.enableNotificationsDescription')}
            label={FM('settings.notificationPreferences.enableNotifications')}
            value={localPreferences.notificationsEnabled}
            onValueChange={handleNotificationsEnabledChange}
          />
          <FormSwitch
            description={FM('settings.notificationPreferences.quietHoursDescription')}
            disabled={!localPreferences.notificationsEnabled}
            label={FM('settings.notificationPreferences.quietHours')}
            value={localPreferences.quietHoursEnabled}
            onValueChange={handleQuietHoursChange}
          />
        </Section>

        {localPreferences.notificationsEnabled ? (
          <NotificationCategoriesSection
            categoryPreferences={localPreferences.categoryPreferences}
            onCategoryChange={handleCategoryChange}
            onDisplayChange={handleDisplayChange}
          />
        ) : null}

        <View style={styles.saveButtonContainer}>
          <SaveButton
            disabled={isSaveDisabled}
            testID={TestIds.NOTIFICATION_PREFERENCES_SAVE_BUTTON}
            title={buttonTitle}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationPreferencesScreen;
