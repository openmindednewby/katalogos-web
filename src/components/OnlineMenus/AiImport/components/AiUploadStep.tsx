/**
 * Upload step: lets user select an image or PDF for AI menu extraction.
 */
import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { isValueDefined } from '@dloizides/utils';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { aiImportStyles as styles } from '../utils/aiImportStyles';

interface Props {
  textColor: string;
  borderColor: string;
  errorColor: string;
  error: string | null;
  onUploadClick: () => void;
}

const CAMERA_ICON = '\u{1F4F7}';

const AiUploadStep: React.FC<Props> = ({ textColor, borderColor, errorColor, error, onUploadClick }) => (
  <View>
    <TouchableOpacity
      accessibilityHint={FM('aiImport.upload.selectFileHint')}
      accessibilityLabel={FM('aiImport.upload.selectFile')}
      accessibilityRole="button"
      style={[styles.uploadArea, { borderColor }]}
      testID={TestIds.AI_IMPORT_UPLOAD_AREA}
      onPress={onUploadClick}
    >
      <Text style={[styles.uploadIcon, { color: textColor }]}>
        {CAMERA_ICON}
      </Text>
      <Text style={[styles.uploadText, { color: textColor }]}>
        {FM('aiImport.upload.dragOrSelect')}
      </Text>
      <Text style={[styles.uploadSubtext, { color: textColor }]}>
        {FM('aiImport.upload.supportedFormats')}
      </Text>
    </TouchableOpacity>

    {isValueDefined(error) && error !== '' ? (
      <View style={styles.errorContainer} testID={TestIds.AI_IMPORT_ERROR}>
        <Text style={[styles.errorText, { color: errorColor }]}>
          {FM(error)}
        </Text>
      </View>
    ) : null}
  </View>
);

export default AiUploadStep;
