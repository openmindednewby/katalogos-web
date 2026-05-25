/** Form fields for language, timezone, and date format preferences. */
import React from 'react';

import { Text, View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import SettingsDropdown from './SettingsDropdown';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import Section from '../../../Shared/Section';
import { DATE_FORMATS, LANGUAGE_CODES, TIMEZONES, SECTION_SPACING, DESCRIPTION_FONT_SIZE, MEDIUM_SPACING } from '../constants';


const fieldLabelStyle = { fontSize: DESCRIPTION_FONT_SIZE, marginBottom: MEDIUM_SPACING };
const fieldGapStyle = { marginTop: SECTION_SPACING };

interface Props {
  language: string;
  timezone: string;
  dateFormat: string;
  textSecondaryStyle: StyleProp<TextStyle>;
  onLanguageChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
  onDateFormatChange: (value: string) => void;
}

const PreferencesFormFields = ({
  language, timezone, dateFormat, textSecondaryStyle,
  onLanguageChange, onTimezoneChange, onDateFormatChange,
}: Props): React.ReactElement => {
  const languageLabelMap: Record<string, string> = { en: FM('settings.preferences.languageEnglish') };
  const languageOptions = LANGUAGE_CODES.map((code) => ({ label: languageLabelMap[code] ?? code, value: code }));

  return (
    <Section>
      <Text style={[fieldLabelStyle, textSecondaryStyle]}>
        {FM('settings.preferences.language')}
      </Text>
      <SettingsDropdown
        accessibilityHint={FM('settings.preferences.languageHint')}
        accessibilityLabel={FM('settings.preferences.language')}
        options={languageOptions}
        testID={TestIds.PREFERENCES_LANGUAGE_DROPDOWN}
        value={language}
        onChange={onLanguageChange}
      />

      <View style={fieldGapStyle}>
        <Text style={[fieldLabelStyle, textSecondaryStyle]}>
          {FM('settings.preferences.timezone')}
        </Text>
        <SettingsDropdown
          accessibilityHint={FM('settings.preferences.timezoneHint')}
          accessibilityLabel={FM('settings.preferences.timezone')}
          options={TIMEZONES}
          testID={TestIds.PREFERENCES_TIMEZONE_DROPDOWN}
          value={timezone}
          onChange={onTimezoneChange}
        />
      </View>

      <View style={fieldGapStyle}>
        <Text style={[fieldLabelStyle, textSecondaryStyle]}>
          {FM('settings.preferences.dateFormat')}
        </Text>
        <SettingsDropdown
          accessibilityHint={FM('settings.preferences.dateFormatHint')}
          accessibilityLabel={FM('settings.preferences.dateFormat')}
          options={DATE_FORMATS}
          testID={TestIds.PREFERENCES_DATE_FORMAT_DROPDOWN}
          value={dateFormat}
          onChange={onDateFormatChange}
        />
      </View>
    </Section>
  );
};

export default PreferencesFormFields;
