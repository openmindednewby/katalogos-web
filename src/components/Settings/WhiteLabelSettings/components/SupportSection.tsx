/** Support section for white-label settings (support email input). */
import React from 'react';

import { Text, TextInput } from 'react-native';

import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import Section from '../../../Shared/Section';
import { whiteLabelStyles } from '../styles';

import type { ThemeModeColors } from '../../../../theme/types/themeModeColors';

interface Props {
  supportEmail: string;
  colors: ThemeModeColors;
  surfaceColor: string;
  onChangeEmail: (value: string) => void;
}

const SupportSection = ({ supportEmail, colors, surfaceColor, onChangeEmail }: Props): React.ReactElement => (
  <Section>
    <Text style={[whiteLabelStyles.sectionTitle, { color: colors.text }]}>
      {FM('settings.whiteLabel.support.heading')}
    </Text>
    <Text style={[whiteLabelStyles.label, { color: colors.text }]}>
      {FM('settings.whiteLabel.support.supportEmail')}
    </Text>
    <TextInput
      accessibilityHint={FM('settings.whiteLabel.support.supportEmailHint')}
      accessibilityLabel={FM('settings.whiteLabel.support.supportEmail')}
      autoCapitalize="none"
      keyboardType="email-address"
      placeholder={FM('settings.whiteLabel.support.supportEmailPlaceholder')}
      placeholderTextColor={colors.textSecondary}
      style={[whiteLabelStyles.input, { color: colors.text, borderColor: colors.border, backgroundColor: surfaceColor }]}
      testID={TestIds.WHITE_LABEL_SUPPORT_EMAIL_INPUT}
      value={supportEmail}
      onChangeText={onChangeEmail}
    />
  </Section>
);

export default SupportSection;
