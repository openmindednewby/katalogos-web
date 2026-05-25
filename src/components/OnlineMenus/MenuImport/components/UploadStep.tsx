/**
 * Upload step: lets user select a CSV or Excel file for import.
 */
import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { isValueDefined } from '@dloizides/utils';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { ERROR_TEXT_COLOR } from '../utils/menuImportConstants';
import { menuImportStyles as styles } from '../utils/menuImportStyles';

interface Props {
  textColor: string;
  borderColor: string;
  isLoading: boolean;
  error: string | null;
  onUploadClick: () => void;
}

const FILE_ICON = '\u{1F4C4}';

const UploadStep: React.FC<Props> = ({ textColor, borderColor, isLoading, error, onUploadClick }) => (
  <View>
    <TouchableOpacity
      accessibilityHint={FM('menuImport.selectFileHint')}
      accessibilityLabel={FM('menuImport.selectFile')}
      accessibilityRole="button"
      style={[styles.uploadArea, { borderColor }]}
      testID={TestIds.MENU_IMPORT_UPLOAD_AREA}
      onPress={onUploadClick}
    >
      <Text style={[styles.uploadIcon, { color: textColor }]}>
        {FILE_ICON}
      </Text>
      <Text style={[styles.uploadText, { color: textColor }]}>
        {isLoading ? FM('loading') : FM('menuImport.dragOrSelect')}
      </Text>
      <Text style={[styles.uploadSubtext, { color: textColor }]}>
        {FM('menuImport.supportedFormats')}
      </Text>
    </TouchableOpacity>

    {isValueDefined(error) && error !== '' ? (
      <View style={styles.errorContainer} testID={TestIds.MENU_IMPORT_ERROR}>
        <Text style={[styles.errorText, { color: ERROR_TEXT_COLOR }]}>
          {FM(error)}
        </Text>
      </View>
    ) : null}
  </View>
);

export default UploadStep;
