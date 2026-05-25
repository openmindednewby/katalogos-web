import React from 'react';

import { TextInput, Text } from 'react-native';

import { FM } from '@/localization/helpers';

import { useTheme } from '../../../../theme/hooks/useTheme';

import type { FormStyles } from '../../../../theme/utils/styles';

interface Props {
  value: string;
  errorMsg?: string;
  updateAnswer: (txt: string) => void;
  styles: FormStyles;
}

export const TextQuestion: React.FC<Props> = ({ value, errorMsg, updateAnswer, styles }) => {
  const { theme } = useTheme();
  const hasError = typeof errorMsg === 'string' && errorMsg !== '';
  return (
    <>
      <TextInput accessibilityHint={FM('quizActive.answerHint')}
        accessibilityLabel={FM('quizActive.answerInputLabel')}
        placeholder={FM('quizActive.answerPlaceholder')}
        placeholderTextColor={theme.colors.textSecondary}
        style={[styles.input, hasError ? styles.errorBorder : null]}
        value={value}
        onChangeText={updateAnswer}
      />
      {hasError ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : null}
    </>
  );
};
