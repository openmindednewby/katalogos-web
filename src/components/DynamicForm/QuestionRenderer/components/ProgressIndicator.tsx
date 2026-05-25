import React from 'react';

import { Text } from 'react-native';

import { FM } from '@/localization/helpers';

import type { FormStyles } from '../../../../theme/utils/styles';

interface Props {
  currentPage: number;
  totalPages: number;
  styles: FormStyles;
}

const ProgressIndicator: React.FC<Props> = ({ currentPage, totalPages, styles }) => (
  <Text style={styles.progressText}>
    {FM('Page')} {currentPage} / {totalPages}
  </Text>
);

export default ProgressIndicator;
