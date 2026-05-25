import React, { useMemo } from 'react';

import { StyleSheet, Text, TextInput } from 'react-native';


import CancelButton from '@/components/Buttons/CancelButton';
import SaveButton from '@/components/Buttons/SaveButton';
import ActionRow from '@/components/core/ActionRow/ActionRow';
import Section from '@/components/Shared/Section';
import { FM } from '@/localization/helpers';
import { useTheme } from '@/theme/hooks/useTheme';

const styles = StyleSheet.create({
  jsonSection: {
    marginTop: 12,
  },
  jsonLabel: {
    marginTop: 8,
  },
  jsonInput: {
    minHeight: 300,
    padding: 8,
    marginBottom: 12,
  },
});

interface Props {
  jsonText: string;
  readOnly: boolean;
  onJsonTextChange: (text: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * JSON editor tab content for TemplateEditorModal.
 */
const TemplateJsonEditor = ({ jsonText, readOnly, onJsonTextChange, onCancel, onSave }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const jsonLabelStyle = useMemo(() => [styles.jsonLabel, { color: colors.text }], [colors.text]);
  const jsonInputStyle = useMemo(
    () => [styles.jsonInput, { backgroundColor: colors.surface, color: colors.text }],
    [colors.surface, colors.text],
  );

  return (
    <Section style={styles.jsonSection}>
      <Text style={jsonLabelStyle}>{FM('quizTemplates.contents')}</Text>
      <TextInput
        multiline
        accessibilityHint={FM('quizTemplates.contentsHint')}
        accessibilityLabel={FM('quizTemplates.contentsLabel')}
        style={jsonInputStyle}
        value={jsonText}
        onChangeText={onJsonTextChange}
      />
      {!readOnly ? (
        <ActionRow>
          <SaveButton title={FM('quizTemplates.save')} onPress={onSave} />
          <CancelButton title={FM('quizTemplates.cancel')} onPress={onCancel} />
        </ActionRow>
      ) : null}
    </Section>
  );
};

export default TemplateJsonEditor;
