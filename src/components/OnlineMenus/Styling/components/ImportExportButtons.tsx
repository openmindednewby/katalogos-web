


/**
 * ImportExportButtons - UI component for importing and exporting menu configurations.
 *
 * Provides buttons for:
 * - Exporting current menu configuration as JSON
 * - Importing configuration from a JSON file with preview
 */
import React, { useCallback, useRef, useState } from 'react';

import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { isValueDefined } from '@dloizides/utils';
import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import { MODAL_OVERLAY_COLOR } from '../../../../shared/constants';
import ThemeMode from '../../../../shared/enums/ThemeMode';
import { TestIds } from '../../../../shared/testIds';
import { themePalette } from '../../../../theme/utils/styles';
import { downloadMenuConfig } from '../../../../utils/menuConfigExport';
import { importMenuConfigFromFile } from '../../../../utils/menuConfigImport';
import { importExportButtonsStyles as styles } from '../utils/importExportButtonsStyles';

import type { RootState } from '../../../../store/reduxStore';
import type { MenuContents } from '../../../../types/menuTypes';
import type { ExportMetadata } from '../../../../utils/menuConfigExport';

// =============================================================================
// Constants
// =============================================================================


// =============================================================================
// Types
// =============================================================================

interface Props {
  contents: MenuContents;
  onImport: (contents: MenuContents) => void;
  disabled?: boolean;
}

interface ImportPreviewState {
  isVisible: boolean;
  contents: MenuContents | null;
  metadata: ExportMetadata | null;
  error: string | null;
}
const ERROR_BACKGROUND_COLOR = '#FFEBEE';
const ERROR_TEXT_COLOR = '#C62828';
const HIDDEN_INPUT_STYLE = { display: 'none' as const };
const EXPORT_ICON = '\u2193';
const IMPORT_ICON = '\u2191';

// =============================================================================
// Helper Functions
// =============================================================================

function formatExportDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

function getPreviewSummary(config: MenuContents): string {
  const categoryCount = config.categories?.length ?? 0;
  const itemCount =
    config.categories?.reduce((sum, cat) => sum + (cat.items?.length ?? 0), 0) ?? 0;
  return `${categoryCount} categories, ${itemCount} items`;
}

function createEmptyState(): ImportPreviewState {
  return { isVisible: false, contents: null, metadata: null, error: null };
}

// =============================================================================
// Component
// =============================================================================

const ImportExportButtons: React.FC<Props> = ({ contents, onImport, disabled = false }) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<View>(null);
  const [importState, setImportState] = useState<ImportPreviewState>(createEmptyState());
  useFocusTrap(dialogRef, importState.isVisible);

  const textColor = String(colors.text);
  const surfaceColor = String(colors.surface);
  const borderColor = String(colors.border);
  const primaryColor = String(colors.primary);
  const textOnPrimary = String(colors.textOnPrimary);

  const handleExport = useCallback(() => downloadMenuConfig(contents), [contents]);
  const handleImportClick = useCallback(() => fileInputRef.current?.click(), []);
  const handleCancelImport = useCallback(() => setImportState(createEmptyState()), []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const result = await importMenuConfigFromFile(file);
      const isSuccessful = result.success && isValueDefined(result.contents);

      if (isSuccessful)
        setImportState({ isVisible: true, contents: result.contents, metadata: result.metadata, error: null });
      else
        setImportState({
          isVisible: true,
          contents: null,
          metadata: null,
          error: result.error ?? FM('importExport.unknownError'),
        });

      // Reset file input using a ref callback pattern
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    []
  );

  const handleConfirmImport = useCallback(() => {
    if (!isValueDefined(importState.contents)) return;
    onImport(importState.contents);
    setImportState(createEmptyState());
  }, [importState.contents, onImport]);

  const hasError = isValueDefined(importState.error) && importState.error !== '';
  const hasMetadata = isValueDefined(importState.metadata);
  const hasContents = isValueDefined(importState.contents);

  return (
    <View style={styles.container} testID={TestIds.IMPORT_EXPORT_CONTAINER}>
      <Pressable
        accessibilityHint={FM('importExport.exportHint')}
        accessibilityLabel={FM('importExport.export')}
        accessibilityRole="button"
        disabled={disabled}
        style={[styles.actionButton, styles.actionButtonOutlined, { borderColor: primaryColor }, disabled && styles.actionButtonDisabled]}
        testID={TestIds.EXPORT_CONFIG_BUTTON}
        onPress={handleExport}
      >
        <Text style={styles.actionButtonIcon}>{EXPORT_ICON}</Text>
        <Text style={[styles.actionButtonText, { color: primaryColor }]}>{FM('importExport.export')}</Text>
      </Pressable>
      <Pressable
        accessibilityHint={FM('importExport.importHint')}
        accessibilityLabel={FM('importExport.import')}
        accessibilityRole="button"
        disabled={disabled}
        style={[styles.actionButton, styles.actionButtonOutlined, { borderColor: primaryColor }, disabled && styles.actionButtonDisabled]}
        testID={TestIds.IMPORT_CONFIG_BUTTON}
        onPress={handleImportClick}
      >
        <Text style={styles.actionButtonIcon}>{IMPORT_ICON}</Text>
        <Text style={[styles.actionButtonText, { color: primaryColor }]}>{FM('importExport.import')}</Text>
      </Pressable>
      <input ref={fileInputRef} accept=".json,application/json" data-testid={TestIds.IMPORT_FILE_INPUT} style={HIDDEN_INPUT_STYLE} type="file" onChange={handleFileChange} />

      <Modal transparent animationType="fade" testID={TestIds.IMPORT_PREVIEW_MODAL} visible={importState.isVisible} onRequestClose={handleCancelImport}>
        <TouchableOpacity accessibilityHint={FM('importExport.closeModalHint')} accessibilityLabel={FM('importExport.closeModal')} activeOpacity={1} style={[styles.modalOverlay, { backgroundColor: MODAL_OVERLAY_COLOR }]} onPress={handleCancelImport}>
          <TouchableOpacity ref={dialogRef} accessibilityViewIsModal accessibilityHint={FM('importExport.modalContentHint')} accessibilityLabel={FM('importExport.modalContent')} activeOpacity={1} aria-label={FM('importExport.previewTitle')} role="dialog" style={[styles.modalContent, { backgroundColor: surfaceColor }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: textColor }]}>{FM('importExport.previewTitle')}</Text>
            {hasError ? <View style={[styles.errorContainer, { backgroundColor: ERROR_BACKGROUND_COLOR }]} testID={TestIds.IMPORT_ERROR_MESSAGE}>
                <Text style={[styles.errorText, { color: ERROR_TEXT_COLOR }]}>{importState.error}</Text>
              </View> : null}
            {hasMetadata ? <View style={[styles.metadataContainer, { backgroundColor: borderColor }]}>
                <Text style={[styles.metadataLabel, { color: textColor }]}>{FM('importExport.exportedOn')}</Text>
                <Text style={[styles.metadataValue, { color: textColor }]}>{formatExportDate(importState.metadata?.exportDate ?? '')}</Text>
                <Text style={[styles.metadataLabel, { color: textColor }]}>{FM('importExport.appVersion')}</Text>
                <Text style={[styles.metadataValue, { color: textColor }]}>{importState.metadata?.appVersion}</Text>
              </View> : null}
            {hasContents ? <View testID={TestIds.IMPORT_PREVIEW_CONTENT}>
                <Text style={[styles.previewLabel, { color: textColor }]}>{FM('importExport.configurationSummary')}</Text>
                <ScrollView style={[styles.previewContainer, { backgroundColor: borderColor }]}>
                  <Text style={[styles.previewText, { color: textColor }]}>{getPreviewSummary(importState.contents ?? { categories: [] })}</Text>
                </ScrollView>
              </View> : null}
            <View style={styles.buttonRow}>
              <Pressable
                accessibilityHint={FM('importExport.cancelImportHint')}
                accessibilityLabel={FM('common.cancel')}
                accessibilityRole="button"
                style={[styles.actionButton, styles.actionButtonOutlined, { borderColor: primaryColor }]}
                testID={TestIds.IMPORT_CANCEL_BUTTON}
                onPress={handleCancelImport}
              >
                <Text style={[styles.actionButtonText, { color: primaryColor }]}>{FM('common.cancel')}</Text>
              </Pressable>
              <Pressable
                accessibilityHint={FM('importExport.confirmImportHint')}
                accessibilityLabel={FM('common.confirm')}
                accessibilityRole="button"
                disabled={!hasContents}
                style={[styles.actionButton, styles.actionButtonContained, { backgroundColor: primaryColor }, !hasContents && styles.actionButtonDisabled]}
                testID={TestIds.IMPORT_CONFIRM_BUTTON}
                onPress={handleConfirmImport}
              >
                <Text style={[styles.actionButtonText, { color: textOnPrimary }]}>{FM('common.confirm')}</Text>
              </Pressable>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ImportExportButtons;
