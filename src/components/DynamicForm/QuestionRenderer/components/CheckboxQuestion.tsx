import React from 'react';

import { TouchableOpacity, View, Text } from 'react-native';

import type { FormStyles } from '../../../../theme/utils/styles';
import type { Option } from '../../interfaces';

interface Props {
  value: Array<string | number>;
  errorMsg?: string;
  updateAnswer: (updated: Array<string | number>) => void;
  styles: FormStyles;
  options: Option[];
}

export const CheckboxQuestion: React.FC<Props> = ({ value, errorMsg, updateAnswer, styles, options }) => (
  <>
    {options.map((option) => {
      const isSelected = value.includes(option.value);
      return (
        <TouchableOpacity
          key={option.value.toString()}
          accessibilityRole="button"
          style={styles.checkboxRow}
          onPress={() => {
            const updated = isSelected
              ? value.filter((v) => v !== option.value)
              : [...value, option.value];
            updateAnswer(updated);
          }}
        >
          <View style={[styles.checkboxBoxBasic, isSelected ? styles.checkboxBoxSelected : null]} />
          <Text style={styles.checkboxLabel}>{option.label}</Text>
        </TouchableOpacity>
      );
    })}
    {typeof errorMsg === 'string' && errorMsg !== '' ? (
      <Text style={styles.errorText}>{errorMsg}</Text>
    ) : null}
  </>
);
