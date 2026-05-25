


/**
 * Category preference row component for notification settings.
 * Displays a toggle and display preference dropdown for a notification category.
 */
import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import { FormSwitch } from '@/components/Forms';
import {
  DESCRIPTION_FONT_SIZE,
  SECTION_SPACING,
  TITLE_GAP,
} from '@/components/Settings/constants';
import { DISPLAY_PREFERENCE_OPTIONS } from '@/lib/hooks/notification';
import type { CategoryPreference, DisplayPreference } from '@/lib/hooks/notification';
import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import DisplayPreferenceDropdown from './DisplayPreferenceDropdown';


interface Props {
  categoryKey: string;
  labelKey: string;
  preference: CategoryPreference;
  onDisplayChange: (display: DisplayPreference) => void;
  onEnabledChange: (enabled: boolean) => void;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SECTION_SPACING,
  },
  dropdownContainer: {
    paddingLeft: SECTION_SPACING,
  },
  dropdownLabel: {
    fontSize: DESCRIPTION_FONT_SIZE,
    marginBottom: TITLE_GAP,
  },
});

const CategoryPreferenceRow = ({
  categoryKey,
  labelKey,
  preference,
  onDisplayChange,
  onEnabledChange,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={styles.container}>
      <FormSwitch
        accessibilityHint={FM('settings.notificationPreferences.toggleCategoryHint')}
        label={FM(labelKey)}
        value={preference.enabled}
        onValueChange={onEnabledChange}
      />
      {preference.enabled ? (
        <View style={styles.dropdownContainer}>
          <Text style={[styles.dropdownLabel, { color: colors.textSecondary }]}>
            {FM('settings.notificationPreferences.displayAs')}
          </Text>
          <DisplayPreferenceDropdown
            options={DISPLAY_PREFERENCE_OPTIONS}
            testID={`${TestIds.NOTIFICATION_PREFERENCE_DROPDOWN}-${categoryKey}`}
            value={preference.displayPreference}
            onChange={onDisplayChange}
          />
        </View>
      ) : null}
    </View>
  );
};

export default CategoryPreferenceRow;
