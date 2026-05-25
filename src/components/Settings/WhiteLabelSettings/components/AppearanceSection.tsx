/**
 * Appearance section for the White Label settings screen.
 * Includes custom CSS, header HTML, and footer HTML textareas.
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

const AppearanceSection = ({ form, updateField }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Section>
      <Text style={[whiteLabelStyles.sectionTitle, { color: colors.text }]}>
        {FM('settings.whiteLabel.appearance.heading')}
      </Text>

      <Text style={[whiteLabelStyles.label, { color: colors.text }]}>
        {FM('settings.whiteLabel.appearance.customCss')}
      </Text>
      <TextInput
        multiline
        accessibilityHint={FM('settings.whiteLabel.appearance.customCssHint')}
        accessibilityLabel={FM('settings.whiteLabel.appearance.customCss')}
        placeholder={FM('settings.whiteLabel.appearance.customCssPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[whiteLabelStyles.cssTextarea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        testID={TestIds.WHITE_LABEL_CUSTOM_CSS_INPUT}
        value={form.customCss}
        onChangeText={updateField('customCss')}
      />

      <Text style={[whiteLabelStyles.label, { color: colors.text }]}>
        {FM('settings.whiteLabel.appearance.headerHtml')}
      </Text>
      <TextInput
        multiline
        accessibilityHint={FM('settings.whiteLabel.appearance.headerHtmlHint')}
        accessibilityLabel={FM('settings.whiteLabel.appearance.headerHtml')}
        placeholder={FM('settings.whiteLabel.appearance.headerHtmlPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[whiteLabelStyles.textarea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        testID={TestIds.WHITE_LABEL_HEADER_HTML_INPUT}
        value={form.headerHtml}
        onChangeText={updateField('headerHtml')}
      />

      <Text style={[whiteLabelStyles.label, { color: colors.text }]}>
        {FM('settings.whiteLabel.appearance.footerHtml')}
      </Text>
      <TextInput
        multiline
        accessibilityHint={FM('settings.whiteLabel.appearance.footerHtmlHint')}
        accessibilityLabel={FM('settings.whiteLabel.appearance.footerHtml')}
        placeholder={FM('settings.whiteLabel.appearance.footerHtmlPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[whiteLabelStyles.textarea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        testID={TestIds.WHITE_LABEL_FOOTER_HTML_INPUT}
        value={form.footerHtml}
        onChangeText={updateField('footerHtml')}
      />
    </Section>
  );
};

export default AppearanceSection;
