/**
 * Brand Identity section for the White Label settings screen.
 * Includes company name, logo URL, and favicon URL inputs.
 */
import React from 'react';

import { Text, TextInput } from 'react-native';

import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Section from '../../../Shared/Section';
import { whiteLabelStyles } from '../styles';

import type { WhiteLabelFormState } from '../../../../hooks/whiteLabel/types';

interface Props {
  form: WhiteLabelFormState;
  updateField: (field: keyof WhiteLabelFormState) => (value: string) => void;
}

const BrandIdentitySection = ({ form, updateField }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Section>
      <Text style={[whiteLabelStyles.sectionTitle, { color: colors.text }]}>
        {FM('settings.whiteLabel.brandIdentity.heading')}
      </Text>

      <Text style={[whiteLabelStyles.label, { color: colors.text }]}>
        {FM('settings.whiteLabel.brandIdentity.companyName')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.whiteLabel.brandIdentity.companyNameHint')}
        accessibilityLabel={FM('settings.whiteLabel.brandIdentity.companyName')}
        placeholder={FM('settings.whiteLabel.brandIdentity.companyNamePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[whiteLabelStyles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        testID={TestIds.WHITE_LABEL_COMPANY_NAME_INPUT}
        value={form.companyName}
        onChangeText={updateField('companyName')}
      />

      <Text style={[whiteLabelStyles.label, { color: colors.text }]}>
        {FM('settings.whiteLabel.brandIdentity.logoUrl')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.whiteLabel.brandIdentity.logoUrlHint')}
        accessibilityLabel={FM('settings.whiteLabel.brandIdentity.logoUrl')}
        autoCapitalize="none"
        keyboardType="url"
        placeholder={FM('settings.whiteLabel.brandIdentity.logoUrlPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[whiteLabelStyles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        testID={TestIds.WHITE_LABEL_LOGO_URL_INPUT}
        value={form.customLogoUrl}
        onChangeText={updateField('customLogoUrl')}
      />

      <Text style={[whiteLabelStyles.label, { color: colors.text }]}>
        {FM('settings.whiteLabel.brandIdentity.faviconUrl')}
      </Text>
      <TextInput
        accessibilityHint={FM('settings.whiteLabel.brandIdentity.faviconUrlHint')}
        accessibilityLabel={FM('settings.whiteLabel.brandIdentity.faviconUrl')}
        autoCapitalize="none"
        keyboardType="url"
        placeholder={FM('settings.whiteLabel.brandIdentity.faviconUrlPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[whiteLabelStyles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        testID={TestIds.WHITE_LABEL_FAVICON_URL_INPUT}
        value={form.customFaviconUrl}
        onChangeText={updateField('customFaviconUrl')}
      />
    </Section>
  );
};

export default BrandIdentitySection;
