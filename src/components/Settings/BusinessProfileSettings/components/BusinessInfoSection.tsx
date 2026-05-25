import React from 'react';

import { StyleSheet, Text, TextInput } from 'react-native';

import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Section from '../../../Shared/Section';
import {
  BODY_FONT_SIZE,
  DESCRIPTION_FONT_SIZE,
  DESCRIPTION_NUMBER_OF_LINES,
  INPUT_BORDER_RADIUS,
  INPUT_BORDER_WIDTH,
  INPUT_HEIGHT,
  INPUT_PADDING,
  MAX_CUISINE_TYPE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MEDIUM_SPACING,
  MULTILINE_INPUT_HEIGHT,
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
  multilineInput: {
    borderWidth: INPUT_BORDER_WIDTH,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    fontSize: BODY_FONT_SIZE,
    height: MULTILINE_INPUT_HEIGHT,
    textAlignVertical: 'top',
  },
});

interface Props {
  readonly name: string;
  readonly description: string;
  readonly cuisineType: string;
  readonly onNameChange: (value: string) => void;
  readonly onDescriptionChange: (value: string) => void;
  readonly onCuisineTypeChange: (value: string) => void;
}

const BusinessInfoSection = ({
  name,
  description,
  cuisineType,
  onNameChange,
  onDescriptionChange,
  onCuisineTypeChange,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Section>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {FM('settings.businessProfile.businessInfo.heading')}
      </Text>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.businessInfo.name')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.businessInfo.nameHint')}
        accessibilityLabel={FM('settings.businessProfile.businessInfo.name')}
        maxLength={MAX_NAME_LENGTH}
        placeholder={FM('settings.businessProfile.businessInfo.namePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.BUSINESS_PROFILE_NAME_INPUT}
        value={name}
        onChangeText={onNameChange}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.businessInfo.description')}
      </Text>
      <TextInput
        multiline
        accessibilityHint={FM('settings.businessProfile.businessInfo.descriptionHint')}
        accessibilityLabel={FM('settings.businessProfile.businessInfo.description')}
        maxLength={MAX_DESCRIPTION_LENGTH}
        numberOfLines={DESCRIPTION_NUMBER_OF_LINES}
        placeholder={FM('settings.businessProfile.businessInfo.descriptionPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.multilineInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.BUSINESS_PROFILE_DESCRIPTION_INPUT}
        value={description}
        onChangeText={onDescriptionChange}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {FM('settings.businessProfile.businessInfo.cuisineType')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.businessProfile.businessInfo.cuisineTypeHint')}
        accessibilityLabel={FM('settings.businessProfile.businessInfo.cuisineType')}
        maxLength={MAX_CUISINE_TYPE_LENGTH}
        placeholder={FM('settings.businessProfile.businessInfo.cuisineTypePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.BUSINESS_PROFILE_CUISINE_INPUT}
        value={cuisineType}
        onChangeText={onCuisineTypeChange}
      />
    </Section>
  );
};

export default BusinessInfoSection;
