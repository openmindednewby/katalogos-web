/**
 * Personal Info Section.
 * Editable fields for first name, last name, email, and phone number.
 */
import React from 'react';

import { StyleSheet, Text, TextInput } from 'react-native';

import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Section from '../../../Shared/Section';
import {
  BODY_FONT_SIZE,
  TITLE_FONT_SIZE,
  TITLE_GAP,
  DESCRIPTION_FONT_SIZE,
  INPUT_BORDER_RADIUS,
  INPUT_PADDING,
  INPUT_BORDER_WIDTH,
  INPUT_HEIGHT,
  MEDIUM_SPACING,
} from '../constants';

const TITLE_FONT_WEIGHT = '600' as const;

const styles = StyleSheet.create({
  sectionTitle: { fontSize: TITLE_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT, marginBottom: TITLE_GAP },
  fieldLabel: { fontSize: DESCRIPTION_FONT_SIZE, marginBottom: TITLE_GAP, marginTop: MEDIUM_SPACING },
  textInput: {
    borderWidth: INPUT_BORDER_WIDTH,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    fontSize: BODY_FONT_SIZE,
    height: INPUT_HEIGHT,
  },
});

interface PersonalInfoSectionProps {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly onFirstNameChange: (value: string) => void;
  readonly onLastNameChange: (value: string) => void;
  readonly onEmailChange: (value: string) => void;
  readonly onPhoneChange: (value: string) => void;
}

const PersonalInfoSection = ({
  firstName,
  lastName,
  email,
  phone,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
}: PersonalInfoSectionProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Section>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {FM('settings.profile.personalInfo')}
      </Text>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.profile.firstName')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.profile.firstNameHint')}
        accessibilityLabel={FM('settings.profile.firstName')}
        placeholder={FM('settings.profile.firstNamePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.PROFILE_FIRST_NAME_INPUT}
        value={firstName}
        onChangeText={onFirstNameChange}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.profile.lastName')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.profile.lastNameHint')}
        accessibilityLabel={FM('settings.profile.lastName')}
        placeholder={FM('settings.profile.lastNamePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.PROFILE_LAST_NAME_INPUT}
        value={lastName}
        onChangeText={onLastNameChange}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.profile.email')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.profile.emailHint')}
        accessibilityLabel={FM('settings.profile.email')}
        keyboardType="email-address"
        placeholder={FM('settings.profile.emailPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.PROFILE_EMAIL_INPUT}
        value={email}
        onChangeText={onEmailChange}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.profile.phone')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.profile.phoneHint')}
        accessibilityLabel={FM('settings.profile.phone')}
        keyboardType="phone-pad"
        placeholder={FM('settings.profile.phonePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.PROFILE_PHONE_INPUT}
        value={phone}
        onChangeText={onPhoneChange}
      />
    </Section>
  );
};

export default PersonalInfoSection;
