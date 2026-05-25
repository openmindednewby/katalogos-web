import React from 'react';

import { Text } from 'react-native';

import type { FormStyles } from '../../../../theme/utils/styles';

interface Props {
  styles: FormStyles;
}

export const RequiredMark: React.FC<Props> = ({ styles }) => (
  <Text style={styles.requiredMark}> *</Text>
);
