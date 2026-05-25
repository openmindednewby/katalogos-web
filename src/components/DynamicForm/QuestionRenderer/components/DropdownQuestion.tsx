import React from 'react';

import { View, TouchableOpacity, Text } from 'react-native';

import { FM } from '@/localization/helpers';

import type { FormStyles } from '../../../../theme/utils/styles';
import type { Option } from '../../interfaces';

interface Props {
  value: string | number;
  errorMsg?: string;
  updateAnswer: (v: string | number) => void;
  styles: FormStyles;
  options: Option[];
}

export const DropdownQuestion: React.FC<Props> = ({ value, errorMsg, updateAnswer, styles, options }) => (
  <>
    <View>
      <Text style={styles.helpText}>{FM('Select an option')}</Text>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value.toString()}
            accessibilityRole="button"
            style={[styles.optionRow, selected ? styles.optionRowSelected : null]}
            onPress={() => updateAnswer(option.value)}
          >
            <View style={styles.radioOuter}>
              {selected ? <View style={styles.radioInner} /> : null}
            </View>
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
    {typeof errorMsg === 'string' && errorMsg !== '' ? (
      <Text style={styles.errorText}>{errorMsg}</Text>
    ) : null}
  </>
);
