/**
 * Processing step: shows a loading state while AI extracts menu data.
 */
import React from 'react';

import { ActivityIndicator, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { aiImportStyles as styles } from '../utils/aiImportStyles';

interface Props {
  textColor: string;
  primaryColor: string;
}

const AiProcessingStep: React.FC<Props> = ({ textColor, primaryColor }) => (
  <View style={styles.processingContainer} testID={TestIds.AI_IMPORT_PROCESSING_SPINNER}>
    <ActivityIndicator color={primaryColor} size="large" />
    <Text style={[styles.processingText, { color: textColor }]}>
      {FM('aiImport.processing.message')}
    </Text>
    <Text style={[styles.processingSubtext, { color: textColor }]}>
      {FM('aiImport.processing.submessage')}
    </Text>
  </View>
);

export default AiProcessingStep;
