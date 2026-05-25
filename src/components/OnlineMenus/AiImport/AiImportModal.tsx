/**
 * AiImportModal - Multi-step wizard for importing menu items from photos/PDFs using AI.
 *
 * Steps:
 * 1. Upload - User selects an image or PDF
 * 2. Processing - AI extracts menu data
 * 3. Review - User edits extracted items
 * 4. Apply - Choose merge strategy and confirm
 */
import React, { useCallback, useMemo, useRef } from 'react';

import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import AiApplyStep from './components/AiApplyStep';
import AiImportModalFooter from './components/AiImportModalFooter';
import AiProcessingStep from './components/AiProcessingStep';
import AiReviewStep from './components/AiReviewStep';
import AiUploadStep from './components/AiUploadStep';
import { useAiImport } from './hooks/useAiImport';
import { AI_IMPORT_ACCEPTED_FILE_TYPES, AI_IMPORT_OVERLAY_COLOR, AI_IMPORT_STEP_INDICES, REVIEW_STEP_INDEX } from './utils/aiImportConstants';
import { aiImportStyles as styles } from './utils/aiImportStyles';
import { mergeMenuContents, transformImportedDataToContents } from './utils/aiImportTransformers';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { useImportMenuFromImage } from '../../../server/customHooks/useImportMenuFromImage';
import AiImportMergeStrategy from '../../../shared/enums/AiImportMergeStrategy';
import AiImportStep from '../../../shared/enums/AiImportStep';
import ThemeMode from '../../../shared/enums/ThemeMode';
import { TestIds } from '../../../shared/testIds';
import { themePalette } from '../../../theme/utils/styles';
import { isValueDefined } from '../../../utils/is';

import type { RootState } from '../../../store/reduxStore';
import type { ImportedMenuData } from '../../../types/aiImportTypes';
import type { MenuContents } from '../../../types/menuTypes';

interface Props {
  visible: boolean;
  existingContents?: MenuContents | null;
  onImportComplete: (contents: MenuContents) => void;
  onClose: () => void;
}

const HIDDEN_INPUT_STYLE = { display: 'none' as const };

function getStepIndex(step: AiImportStep): number {
  if (step === AiImportStep.Upload) return 0;
  if (step === AiImportStep.Processing) return 1;
  if (step === AiImportStep.Review) return REVIEW_STEP_INDEX;
  return REVIEW_STEP_INDEX + 1;
}

/** Type-safe check that narrows ImportedMenuData | null to ImportedMenuData. */
function hasImportedData(data: ImportedMenuData | null): data is ImportedMenuData {
  return isValueDefined(data);
}

const AiImportModal: React.FC<Props> = ({ visible, existingContents, onImportComplete, onClose }) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;
  const dialogRef = useRef<View>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useFocusTrap(dialogRef, visible);

  const textColor = String(colors.text);
  const surfaceColor = String(colors.surface);
  const borderColor = String(colors.border);
  const primaryColor = String(colors.primary);
  const textOnPrimary = String(colors.textOnPrimary);
  const errorColor = String(colors.error);

  const {
    state, handleFileValidation, handleExtractionSuccess, handleExtractionError,
    handleUpdateCategory, handleUpdateItem, handleDeleteItem, handleAddItem,
    handleSetStrategy, handleGoBack, handleGoToApply, handleReset,
  } = useAiImport();

  const importOptions = useMemo(() => ({
    onSuccess: handleExtractionSuccess,
    onError: handleExtractionError,
  }), [handleExtractionSuccess, handleExtractionError]);

  const { mutate: uploadFile } = useImportMenuFromImage(importOptions);

  const handleClose = useCallback(() => { handleReset(); onClose(); }, [handleReset, onClose]);
  const handleUploadClick = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!isValueDefined(file)) return;
      const validationError = handleFileValidation(file);
      if (!isValueDefined(validationError)) uploadFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFileValidation, uploadFile],
  );

  const handleApply = useCallback(() => {
    if (!hasImportedData(state.importedData)) return;
    const imported = transformImportedDataToContents(state.importedData);
    const isReplace = state.mergeStrategy === AiImportMergeStrategy.Replace;
    const result = isReplace ? imported : mergeMenuContents(existingContents ?? { categories: [] }, imported);
    onImportComplete(result);
    handleReset();
    onClose();
  }, [state.importedData, state.mergeStrategy, existingContents, onImportComplete, handleReset, onClose]);

  const currentStepIndex = getStepIndex(state.step);
  const hasData = hasImportedData(state.importedData) && state.importedData.categories.length > 0;

  return (
    <Modal transparent animationType="fade" testID={TestIds.AI_IMPORT_MODAL} visible={visible} onRequestClose={handleClose}>
      <TouchableOpacity accessibilityHint={FM('aiImport.closeModalHint')} accessibilityLabel={FM('aiImport.cancelButton')} activeOpacity={1} style={[styles.modalOverlay, { backgroundColor: AI_IMPORT_OVERLAY_COLOR }]} onPress={handleClose}>
        <TouchableOpacity ref={dialogRef} accessibilityViewIsModal accessibilityHint={FM('aiImport.modalContentHint')} accessibilityLabel={FM('aiImport.modalTitle')} activeOpacity={1} aria-label={FM('aiImport.modalTitle')} role="dialog" style={[styles.modalContent, { backgroundColor: surfaceColor }]} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.modalTitle, { color: textColor }]}>{FM('aiImport.modalTitle')}</Text>

          <View style={styles.stepIndicatorRow}>
            {AI_IMPORT_STEP_INDICES.map((idx) => (
              <View key={idx} style={[styles.stepDot, { backgroundColor: primaryColor }, idx <= currentStepIndex && styles.stepDotActive]} />
            ))}
          </View>

          <View style={styles.body}>
            {state.step === AiImportStep.Upload ? <AiUploadStep borderColor={borderColor} error={state.error} errorColor={errorColor} textColor={textColor} onUploadClick={handleUploadClick} /> : null}
            {state.step === AiImportStep.Processing ? <AiProcessingStep primaryColor={primaryColor} textColor={textColor} /> : null}
            {state.step === AiImportStep.Review && hasImportedData(state.importedData) ? <AiReviewStep borderColor={borderColor} data={state.importedData} primaryColor={primaryColor} textColor={textColor} onAddItem={handleAddItem} onDeleteItem={handleDeleteItem} onUpdateCategory={handleUpdateCategory} onUpdateItem={handleUpdateItem} /> : null}
            {state.step === AiImportStep.Apply ? <AiApplyStep borderColor={borderColor} primaryColor={primaryColor} strategy={state.mergeStrategy} textColor={textColor} onSetStrategy={handleSetStrategy} /> : null}
          </View>

          <input ref={fileInputRef} accept={AI_IMPORT_ACCEPTED_FILE_TYPES} data-testid={TestIds.AI_IMPORT_FILE_INPUT} style={HIDDEN_INPUT_STYLE} type="file" onChange={handleFileInputChange} />

          <AiImportModalFooter hasData={hasData} primaryColor={primaryColor} step={state.step} textOnPrimary={textOnPrimary} onApply={handleApply} onClose={handleClose} onGoBack={handleGoBack} onGoToApply={handleGoToApply} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default AiImportModal;
