/**
 * Preview table for the menu import wizard.
 * Displays validated rows with color-coded status (valid, error, warning).
 */
import React from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import ValidationSeverity from '../../../../shared/enums/ValidationSeverity';
import { TestIds } from '../../../../shared/testIds';
import {
  ERROR_ROW_COLOR,
  ERROR_TEXT_COLOR,
  VALID_ROW_COLOR,
  WARNING_ROW_COLOR,
  WARNING_TEXT_COLOR,
  sharedImportStyles,
} from '../utils/menuImportConstants';
import { menuImportStyles as modalStyles } from '../utils/menuImportStyles';

import type { ValidationResult, ValidatedRow, ValidationIssue } from '../utils/validateMenuRows';

// =============================================================================
// Local Styles
// =============================================================================

const previewStyles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryText: { fontSize: 13 },
  summaryBold: { fontSize: 13, fontWeight: '600' },
  narrowCol: { flex: 0.5 },
  wideCol: { flex: 1.5 },
  issueContainer: { paddingHorizontal: 12, paddingVertical: 4 },
  issueText: { fontSize: 11 },
});

// =============================================================================
// Sub-components (defined before main component)
// =============================================================================

const IssueList: React.FC<{ issues: ValidationIssue[]; rowIndex: number; bgColor: string | undefined }> = ({ issues, rowIndex, bgColor }) => (
  <View style={[previewStyles.issueContainer, { backgroundColor: bgColor }]}>
    {issues.map((issue) => (
      <Text
        key={`${rowIndex}-${issue.messageKey}`}
        style={[previewStyles.issueText, { color: issue.severity === ValidationSeverity.Error ? ERROR_TEXT_COLOR : WARNING_TEXT_COLOR }]}
      >
        {FM(issue.messageKey)}
      </Text>
    ))}
  </View>
);

const PreviewRow: React.FC<{
  row: ValidatedRow;
  textColor: string;
  borderColor: string;
}> = ({ row, textColor, borderColor }) => {
  const bgColor = getRowBackgroundColor(row);

  return (
    <View>
      <View style={[sharedImportStyles.tableRow, { borderBottomColor: borderColor, backgroundColor: bgColor }]}>
        <Text style={[sharedImportStyles.tableCell, previewStyles.narrowCol, { color: textColor }]}>{row.rowIndex + 1}</Text>
        <Text style={[sharedImportStyles.tableCell, { color: textColor }]}>{row.category}</Text>
        <Text style={[sharedImportStyles.tableCell, { color: textColor }]}>{row.itemName}</Text>
        <Text style={[sharedImportStyles.tableCell, { color: textColor }]}>{row.rawPrice}</Text>
        <Text numberOfLines={2} style={[sharedImportStyles.tableCell, previewStyles.wideCol, { color: textColor }]}>{row.description}</Text>
      </View>
      {row.issues.length > 0 ? <IssueList bgColor={bgColor} issues={row.issues} rowIndex={row.rowIndex} /> : null}
    </View>
  );
};

// =============================================================================
// Main Component
// =============================================================================

interface Props {
  validationResult: ValidationResult;
  textColor: string;
  borderColor: string;
}

const ImportPreviewTable: React.FC<Props> = ({ validationResult, textColor, borderColor }) => (
  <View testID={TestIds.MENU_IMPORT_PREVIEW_TABLE}>
    <Text style={[sharedImportStyles.stepTitle, { color: textColor }]}>{FM('menuImport.preview.title')}</Text>

    <View style={previewStyles.summaryRow}>
      <Text style={[previewStyles.summaryText, { color: textColor }]}>{FM('menuImport.preview.rowCount', String(validationResult.rows.length))}</Text>
      <Text style={[previewStyles.summaryBold, { color: VALID_ROW_COLOR }]}>{FM('menuImport.preview.validRows', String(validationResult.validCount))}</Text>
      {validationResult.errorCount > 0 ? <Text style={[previewStyles.summaryBold, { color: ERROR_TEXT_COLOR }]}>{FM('menuImport.preview.invalidRows', String(validationResult.errorCount))}</Text> : null}
      {validationResult.warningCount > 0 ? <Text style={[previewStyles.summaryBold, { color: WARNING_TEXT_COLOR }]}>{FM('menuImport.preview.warningRows', String(validationResult.warningCount))}</Text> : null}
    </View>

    <ScrollView style={modalStyles.previewScrollView}>
      <View style={[sharedImportStyles.tableHeader, { borderBottomColor: borderColor }]}>
        <Text style={[sharedImportStyles.tableHeaderCell, previewStyles.narrowCol, { color: textColor }]}>#</Text>
        <Text style={[sharedImportStyles.tableHeaderCell, { color: textColor }]}>{FM('menuImport.columns.category')}</Text>
        <Text style={[sharedImportStyles.tableHeaderCell, { color: textColor }]}>{FM('menuImport.columns.itemName')}</Text>
        <Text style={[sharedImportStyles.tableHeaderCell, { color: textColor }]}>{FM('menuImport.columns.price')}</Text>
        <Text style={[sharedImportStyles.tableHeaderCell, previewStyles.wideCol, { color: textColor }]}>{FM('menuImport.columns.description')}</Text>
      </View>

      {validationResult.rows.map((row) => (
        <PreviewRow key={row.rowIndex} borderColor={borderColor} row={row} textColor={textColor} />
      ))}
    </ScrollView>
  </View>
);

function getRowBackgroundColor(row: ValidatedRow): string | undefined {
  if (row.issues.some((i) => i.severity === ValidationSeverity.Error)) return ERROR_ROW_COLOR;
  if (row.issues.some((i) => i.severity === ValidationSeverity.Warning)) return WARNING_ROW_COLOR;
  return undefined;
}

export default ImportPreviewTable;
