/**
 * Notification categories section.
 * Renders the list of notification categories with their preference controls.
 */
import React from 'react';

import { StyleSheet, Text } from 'react-native';

import Section from '@/components/Shared/Section';
import { NOTIFICATION_CATEGORIES } from '@/lib/hooks/notification';
import type {
  CategoryPreference,
  DisplayPreference,
  NotificationCategoryKey,
} from '@/lib/hooks/notification';
import { FM } from '@/localization/helpers';
import { useTheme } from '@/theme/hooks/useTheme';
import { layoutStyles } from '@/theme/utils/layout';

import CategoryPreferenceRow from './CategoryPreferenceRow';
import { CATEGORY_LABEL_KEYS } from '../utils/notificationPreferencesHelpers';



interface Props {
  categoryPreferences: Record<NotificationCategoryKey, CategoryPreference>;
  onCategoryChange: (key: NotificationCategoryKey, enabled: boolean) => void;
  onDisplayChange: (key: NotificationCategoryKey, display: DisplayPreference) => void;
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});

const NotificationCategoriesSection = ({
  categoryPreferences,
  onCategoryChange,
  onDisplayChange,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Section style={layoutStyles.sectionSpacing}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {FM('settings.notificationPreferences.categorySettings')}
      </Text>
      {NOTIFICATION_CATEGORIES.map((key) => (
        <CategoryPreferenceRow
          key={key}
          categoryKey={key}
          labelKey={CATEGORY_LABEL_KEYS[key]}
          preference={categoryPreferences[key]}
          onDisplayChange={(display) => onDisplayChange(key, display)}
          onEnabledChange={(enabled) => onCategoryChange(key, enabled)}
        />
      ))}
    </Section>
  );
};

export default NotificationCategoriesSection;
