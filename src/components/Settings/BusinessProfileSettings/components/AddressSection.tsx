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
  MAX_ADDRESS_LENGTH,
  MAX_CITY_LENGTH,
  MAX_COUNTRY_LENGTH,
  MAX_POSTAL_CODE_LENGTH,
  MAX_STATE_LENGTH,
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
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly onAddressLine1Change: (value: string) => void;
  readonly onAddressLine2Change: (value: string) => void;
  readonly onCityChange: (value: string) => void;
  readonly onStateChange: (value: string) => void;
  readonly onPostalCodeChange: (value: string) => void;
  readonly onCountryChange: (value: string) => void;
}

const AddressSection = ({
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  country,
  onAddressLine1Change,
  onAddressLine2Change,
  onCityChange,
  onStateChange,
  onPostalCodeChange,
  onCountryChange,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const inputStyle = [styles.textInput, { borderColor: colors.border, color: colors.text }];

  return (
    <Section>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {FM('settings.businessProfile.address.heading')}
      </Text>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.address.line1')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.address.line1Hint')}
        accessibilityLabel={FM('settings.businessProfile.address.line1')}
        maxLength={MAX_ADDRESS_LENGTH}
        placeholder={FM('settings.businessProfile.address.line1Placeholder')}
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
        testID={TestIds.BUSINESS_PROFILE_ADDRESS_LINE1_INPUT}
        value={addressLine1}
        onChangeText={onAddressLine1Change}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.address.line2')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.address.line2Hint')}
        accessibilityLabel={FM('settings.businessProfile.address.line2')}
        maxLength={MAX_ADDRESS_LENGTH}
        placeholder={FM('settings.businessProfile.address.line2Placeholder')}
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
        testID={TestIds.BUSINESS_PROFILE_ADDRESS_LINE2_INPUT}
        value={addressLine2}
        onChangeText={onAddressLine2Change}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.address.city')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.address.cityHint')}
        accessibilityLabel={FM('settings.businessProfile.address.city')}
        maxLength={MAX_CITY_LENGTH}
        placeholder={FM('settings.businessProfile.address.cityPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
        testID={TestIds.BUSINESS_PROFILE_CITY_INPUT}
        value={city}
        onChangeText={onCityChange}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.address.state')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.address.stateHint')}
        accessibilityLabel={FM('settings.businessProfile.address.state')}
        maxLength={MAX_STATE_LENGTH}
        placeholder={FM('settings.businessProfile.address.statePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
        testID={TestIds.BUSINESS_PROFILE_STATE_INPUT}
        value={state}
        onChangeText={onStateChange}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.address.postalCode')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.address.postalCodeHint')}
        accessibilityLabel={FM('settings.businessProfile.address.postalCode')}
        maxLength={MAX_POSTAL_CODE_LENGTH}
        placeholder={FM('settings.businessProfile.address.postalCodePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
        testID={TestIds.BUSINESS_PROFILE_POSTAL_CODE_INPUT}
        value={postalCode}
        onChangeText={onPostalCodeChange}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.address.country')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.address.countryHint')}
        accessibilityLabel={FM('settings.businessProfile.address.country')}
        maxLength={MAX_COUNTRY_LENGTH}
        placeholder={FM('settings.businessProfile.address.countryPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
        testID={TestIds.BUSINESS_PROFILE_COUNTRY_INPUT}
        value={country}
        onChangeText={onCountryChange}
      />
    </Section>
  );
};

export default AddressSection;
