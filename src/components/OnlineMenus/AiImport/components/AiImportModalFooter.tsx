/** Footer buttons for the AI import modal. */
import React from 'react';

import { Pressable, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import AiImportStep from '../../../../shared/enums/AiImportStep';
import { TestIds } from '../../../../shared/testIds';
import { aiImportStyles as styles } from '../utils/aiImportStyles';

interface Props {
  step: AiImportStep;
  primaryColor: string;
  textOnPrimary: string;
  hasData: boolean;
  onClose: () => void;
  onGoBack: () => void;
  onGoToApply: () => void;
  onApply: () => void;
}

const AiImportModalFooter: React.FC<Props> = ({ step, primaryColor, textOnPrimary, hasData, onClose, onGoBack, onGoToApply, onApply }) => {
  const showBack = step === AiImportStep.Review || step === AiImportStep.Apply;
  const showNext = step === AiImportStep.Review;
  const showApply = step === AiImportStep.Apply;

  return (
    <View style={styles.buttonRow}>
      <Pressable accessibilityHint={FM('aiImport.cancelButtonHint')} accessibilityLabel={FM('aiImport.cancelButton')} accessibilityRole="button" style={[styles.buttonOutlined, { borderColor: primaryColor }]} testID={TestIds.AI_IMPORT_CANCEL_BUTTON} onPress={onClose}>
        <Text style={[styles.buttonText, { color: primaryColor }]}>{FM('aiImport.cancelButton')}</Text>
      </Pressable>

      {showBack ? (
        <Pressable accessibilityHint={FM('aiImport.backButtonHint')} accessibilityLabel={FM('aiImport.backButton')} accessibilityRole="button" style={[styles.buttonOutlined, { borderColor: primaryColor }]} testID={TestIds.AI_IMPORT_BACK_BUTTON} onPress={onGoBack}>
          <Text style={[styles.buttonText, { color: primaryColor }]}>{FM('aiImport.backButton')}</Text>
        </Pressable>
      ) : null}

      {showNext ? (
        <Pressable accessibilityHint={FM('aiImport.apply.applyButtonHint')} accessibilityLabel={FM('aiImport.apply.title')} accessibilityRole="button" disabled={!hasData} style={[styles.buttonContained, { backgroundColor: primaryColor }, !hasData && styles.buttonDisabled]} testID={TestIds.AI_IMPORT_APPLY_BUTTON} onPress={onGoToApply}>
          <Text style={[styles.buttonText, { color: textOnPrimary }]}>{FM('Next')}</Text>
        </Pressable>
      ) : null}

      {showApply ? (
        <Pressable accessibilityHint={FM('aiImport.apply.applyButtonHint')} accessibilityLabel={FM('aiImport.apply.applyButton')} accessibilityRole="button" disabled={!hasData} style={[styles.buttonContained, { backgroundColor: primaryColor }, !hasData && styles.buttonDisabled]} testID={TestIds.AI_IMPORT_APPLY_BUTTON} onPress={onApply}>
          <Text style={[styles.buttonText, { color: textOnPrimary }]}>{FM('aiImport.apply.applyButton')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default AiImportModalFooter;
