import React from 'react';

import { StyleSheet, Text, TextInput } from 'react-native';

import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Section from '../../../Shared/Section';
import {
  BODY_FONT_SIZE,
  DESCRIPTION_FONT_SIZE,
  INPUT_BORDER_RADIUS,
  INPUT_BORDER_WIDTH,
  INPUT_HEIGHT,
  INPUT_PADDING,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_WEBSITE_LENGTH,
  MEDIUM_SPACING,
  TITLE_FONT_SIZE,
  TITLE_FONT_WEIGHT,
  TITLE_GAP,
} from '../constants';

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

interface Props {
  readonly phone: string;
  readonly email: string;
  readonly website: string;
  readonly onPhoneChange: (value: string) => void;
  readonly onEmailChange: (value: string) => void;
  readonly onWebsiteChange: (value: string) => void;
}

const ContactInfoSection = ({
  phone,
  email,
  website,
  onPhoneChange,
  onEmailChange,
  onWebsiteChange,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Section>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {FM('settings.businessProfile.contact.heading')}
      </Text>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.contact.phone')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.contact.phoneHint')}
        accessibilityLabel={FM('settings.businessProfile.contact.phone')}
        keyboardType="phone-pad"
        maxLength={MAX_PHONE_LENGTH}
        placeholder={FM('settings.businessProfile.contact.phonePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.BUSINESS_PROFILE_PHONE_INPUT}
        value={phone}
        onChangeText={onPhoneChange}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.contact.email')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.contact.emailHint')}
        accessibilityLabel={FM('settings.businessProfile.contact.email')}
        keyboardType="email-address"
        maxLength={MAX_EMAIL_LENGTH}
        placeholder={FM('settings.businessProfile.contact.emailPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.BUSINESS_PROFILE_EMAIL_INPUT}
        value={email}
        onChangeText={onEmailChange}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.contact.website')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.contact.websiteHint')}
        accessibilityLabel={FM('settings.businessProfile.contact.website')}
        autoCapitalize="none"
        keyboardType="url"
        maxLength={MAX_WEBSITE_LENGTH}
        placeholder={FM('settings.businessProfile.contact.websitePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.BUSINESS_PROFILE_WEBSITE_INPUT}
        value={website}
        onChangeText={onWebsiteChange}
      />
    </Section>
  );
};

export default ContactInfoSection;
