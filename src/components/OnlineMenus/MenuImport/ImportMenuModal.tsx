/**
 * ImportMenuModal - Multi-step wizard for importing menu items from CSV/Excel.
 *
 * Steps:
 * 1. Upload - User selects a CSV or XLSX file
 * 2. Map Columns - Auto-detect and let user adjust column mappings
 * 3. Preview - Show validated data with error/warning highlighting
 * After confirm, the imported MenuContents are passed to the parent.
 */
import React, { useCallback, useRef } from 'react';

import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import ColumnMappingStep from './components/ColumnMappingStep';
import ImportPreviewTable from './components/ImportPreviewTable';
import ImportSummaryCard from './components/ImportSummary';
import UploadStep from './components/UploadStep';
import { useMenuImport } from './hooks/useMenuImport';
import { ACCEPTED_FILE_TYPES, MODAL_OVERLAY_COLOR } from './utils/menuImportConstants';
import { menuImportStyles as styles } from './utils/menuImportStyles';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import ImportStep from '../../../shared/enums/ImportStep';
import ThemeMode from '../../../shared/enums/ThemeMode';
import { TestIds } from '../../../shared/testIds';
import { themePalette } from '../../../theme/utils/styles';

import type { RootState } from '../../../store/reduxStore';
import type { MenuContents } from '../../../types/menuTypes';

// =============================================================================
// Types
// =============================================================================

interface Props {
  visible: boolean;
  existingContents?: MenuContents | null;
  onImportComplete: (contents: MenuContents) => void;
  onClose: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const HIDDEN_INPUT_STYLE = { display: 'none' as const };
const STEP_COUNT = 3;
const STEP_INDICES = [0, 1, 2];

// =============================================================================
// Helpers
// =============================================================================

function getStepIndex(step: ImportStep): number {
  if (step === ImportStep.Upload) return 0;
  if (step === ImportStep.MapColumns) return 1;
  return STEP_COUNT - 1;
}

// =============================================================================
// Footer Sub-component (defined before main component)
// =============================================================================

interface ModalFooterProps {
  step: ImportStep;
  primaryColor: string;
  textOnPrimary: string;
  canProceed: boolean;
  hasValidRows: boolean;
  onClose: () => void;
  onGoBack: () => void;
  onGoToPreview: () => void;
  onConfirm: () => void;
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  step, primaryColor, textOnPrimary, canProceed, hasValidRows,
  onClose, onGoBack, onGoToPreview, onConfirm,
}) => (
  <View style={styles.buttonRow}>
    <Pressable accessibilityHint={FM('menuImport.cancelImportHint')} accessibilityLabel={FM('menuImport.cancelImport')} accessibilityRole="button" style={[styles.buttonOutlined, { borderColor: primaryColor }]} testID={TestIds.MENU_IMPORT_CANCEL_BUTTON} onPress={onClose}>
      <Text style={[styles.buttonText, { color: primaryColor }]}>{FM('menuImport.cancelImport')}</Text>
    </Pressable>

    {step !== ImportStep.Upload ? (
      <Pressable accessibilityHint={FM('menuImport.previousStepHint')} accessibilityLabel={FM('menuImport.previousStep')} accessibilityRole="button" style={[styles.buttonOutlined, { borderColor: primaryColor }]} testID={TestIds.MENU_IMPORT_BACK_BUTTON} onPress={onGoBack}>
        <Text style={[styles.buttonText, { color: primaryColor }]}>{FM('menuImport.previousStep')}</Text>
      </Pressable>
    ) : null}

    {step === ImportStep.MapColumns ? (
      <Pressable accessibilityHint={FM('menuImport.nextStepHint')} accessibilityLabel={FM('menuImport.nextStep')} accessibilityRole="button" disabled={!canProceed} style={[styles.buttonContained, { backgroundColor: primaryColor }, !canProceed && styles.buttonDisabled]} testID={TestIds.MENU_IMPORT_NEXT_BUTTON} onPress={onGoToPreview}>
        <Text style={[styles.buttonText, { color: textOnPrimary }]}>{FM('menuImport.nextStep')}</Text>
      </Pressable>
    ) : null}

    {step === ImportStep.Preview ? (
      <Pressable accessibilityHint={FM('menuImport.confirmImportHint')} accessibilityLabel={FM('menuImport.confirmImport')} accessibilityRole="button" disabled={!hasValidRows} style={[styles.buttonContained, { backgroundColor: primaryColor }, !hasValidRows && styles.buttonDisabled]} testID={TestIds.MENU_IMPORT_CONFIRM_BUTTON} onPress={onConfirm}>
        <Text style={[styles.buttonText, { color: textOnPrimary }]}>{FM('menuImport.confirmImport')}</Text>
      </Pressable>
    ) : null}
  </View>
);

// =============================================================================
// Main Component
// =============================================================================

const ImportMenuModal: React.FC<Props> = ({ visible, existingContents, onImportComplete, onClose }) => {
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

  const {
    step, isLoading, error, columnMappings, validationResult,
    importSummary, sampleRows, columnMappingErrors,
    handleFileSelected, handleUpdateMapping, handleGoToPreview,
    handleGoBack, handleConfirmImport, handleReset,
  } = useMenuImport();

  const handleClose = useCallback(() => { handleReset(); onClose(); }, [handleReset, onClose]);
  const handleUploadClick = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) await handleFileSelected(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFileSelected],
  );

  const handleConfirm = useCallback(() => {
    const result = handleConfirmImport(existingContents);
    if (result) { onImportComplete(result); handleReset(); onClose(); }
  }, [handleConfirmImport, existingContents, onImportComplete, handleReset, onClose]);

  const currentStepIndex = getStepIndex(step);
  const canProceed = step === ImportStep.MapColumns && columnMappingErrors.length === 0;
  const hasValidRows = (validationResult?.validCount ?? 0) > 0;

  return (
    <Modal transparent animationType="fade" testID={TestIds.MENU_IMPORT_MODAL} visible={visible} onRequestClose={handleClose}>
      <TouchableOpacity accessibilityHint={FM('menuImport.closeModalHint')} accessibilityLabel={FM('menuImport.cancelImport')} activeOpacity={1} style={[styles.modalOverlay, { backgroundColor: MODAL_OVERLAY_COLOR }]} onPress={handleClose}>
        <TouchableOpacity ref={dialogRef} accessibilityViewIsModal accessibilityHint={FM('menuImport.modalContentHint')} accessibilityLabel={FM('menuImport.importMenu')} activeOpacity={1} aria-label={FM('menuImport.importMenu')} role="dialog" style={[styles.modalContent, { backgroundColor: surfaceColor }]} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.modalTitle, { color: textColor }]}>{FM('menuImport.importMenu')}</Text>

          <View style={styles.stepIndicatorRow}>
            {STEP_INDICES.map((idx) => (
              <View key={idx} style={[styles.stepDot, { backgroundColor: primaryColor }, idx <= currentStepIndex && styles.stepDotActive]} />
            ))}
          </View>

          <View style={styles.body}>
            {step === ImportStep.Upload ? <UploadStep borderColor={borderColor} error={error} isLoading={isLoading} textColor={textColor} onUploadClick={handleUploadClick} /> : null}
            {step === ImportStep.MapColumns ? <ColumnMappingStep borderColor={borderColor} mappingErrors={columnMappingErrors} mappings={columnMappings} sampleRows={sampleRows} textColor={textColor} onUpdateMapping={handleUpdateMapping} /> : null}
            {step === ImportStep.Preview && validationResult ? <ImportPreviewTable borderColor={borderColor} textColor={textColor} validationResult={validationResult} /> : null}
            {importSummary ? <ImportSummaryCard borderColor={borderColor} summary={importSummary} textColor={textColor} /> : null}
          </View>

          <input ref={fileInputRef} accept={ACCEPTED_FILE_TYPES} data-testid={TestIds.MENU_IMPORT_FILE_INPUT} style={HIDDEN_INPUT_STYLE} type="file" onChange={handleFileInputChange} />
          <ModalFooter canProceed={canProceed} hasValidRows={hasValidRows} primaryColor={primaryColor} step={step} textOnPrimary={textOnPrimary} onClose={handleClose} onConfirm={handleConfirm} onGoBack={handleGoBack} onGoToPreview={handleGoToPreview} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ImportMenuModal;
