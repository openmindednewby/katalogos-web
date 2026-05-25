/**
 * Column mapping step: lets user match file columns to menu fields.
 * Shows auto-detected mappings and allows manual adjustment.
 */
import React, { useCallback } from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import MenuField from '../../../../shared/enums/MenuField';
import { TestIds } from '../../../../shared/testIds';
import {
  ERROR_TEXT_COLOR,
  SAMPLE_ROW_COUNT,
  sharedImportStyles,
} from '../utils/menuImportConstants';
import { menuImportStyles as modalStyles } from '../utils/menuImportStyles';

import type { ColumnMapping } from '../utils/columnDetection';

// =============================================================================
// Local Styles
// =============================================================================

const columnStyles = StyleSheet.create({
  selectInput: { width: '100%', padding: 4, fontSize: 13 },
  errorBg: { backgroundColor: `${ERROR_TEXT_COLOR}15` },
});

// =============================================================================
// Constants
// =============================================================================

const FIELD_OPTIONS: Array<{ value: MenuField; labelKey: string }> = [
  { value: MenuField.Unmapped, labelKey: 'menuImport.columns.unmapped' },
  { value: MenuField.Category, labelKey: 'menuImport.columns.category' },
  { value: MenuField.ItemName, labelKey: 'menuImport.columns.itemName' },
  { value: MenuField.Description, labelKey: 'menuImport.columns.description' },
  { value: MenuField.Price, labelKey: 'menuImport.columns.price' },
];

const MENU_FIELD_MAP: Record<string, MenuField> = {
  [MenuField.Unmapped]: MenuField.Unmapped,
  [MenuField.Category]: MenuField.Category,
  [MenuField.ItemName]: MenuField.ItemName,
  [MenuField.Description]: MenuField.Description,
  [MenuField.Price]: MenuField.Price,
};

function toMenuField(value: string): MenuField {
  return MENU_FIELD_MAP[value] ?? MenuField.Unmapped;
}

// =============================================================================
// Types
// =============================================================================

interface Props {
  mappings: ColumnMapping[];
  sampleRows: string[][];
  mappingErrors: string[];
  textColor: string;
  borderColor: string;
  onUpdateMapping: (columnIndex: number, field: MenuField) => void;
}

// =============================================================================
// Component
// =============================================================================

const ColumnMappingStep: React.FC<Props> = ({
  mappings, sampleRows, mappingErrors, textColor, borderColor, onUpdateMapping,
}) => {
  const handleSelectChange = useCallback(
    (columnIndex: number, value: string) => { onUpdateMapping(columnIndex, toMenuField(value)); },
    [onUpdateMapping],
  );

  return (
    <View>
      <Text style={[sharedImportStyles.stepTitle, { color: textColor }]}>{FM('menuImport.columnMapping.title')}</Text>
      <Text style={[sharedImportStyles.stepDescription, { color: textColor }]}>{FM('menuImport.columnMapping.instruction')}</Text>

      {mappingErrors.length > 0 ? (
        <View style={[modalStyles.errorContainer, columnStyles.errorBg]}>
          {mappingErrors.map((errKey) => (
            <Text key={errKey} style={[modalStyles.errorText, { color: ERROR_TEXT_COLOR }]}>{FM(errKey)}</Text>
          ))}
        </View>
      ) : null}

      <ScrollView style={modalStyles.previewScrollView}>
        <View style={[sharedImportStyles.tableHeader, { borderBottomColor: borderColor }]}>
          <Text style={[sharedImportStyles.tableHeaderCell, { color: textColor }]}>{FM('menuImport.columnMapping.fileColumn')}</Text>
          <Text style={[sharedImportStyles.tableHeaderCell, { color: textColor }]}>{FM('menuImport.columnMapping.mapsTo')}</Text>
          <Text style={[sharedImportStyles.tableHeaderCell, { color: textColor }]}>{FM('menuImport.columnMapping.sampleData')}</Text>
        </View>

        {mappings.map((mapping) => (
          <View key={mapping.columnIndex} style={[modalStyles.columnMapRow, { borderBottomColor: borderColor }]}>
            <Text style={[modalStyles.columnMapLabel, { color: textColor }]}>{mapping.columnHeader}</Text>
            <View style={modalStyles.columnMapPicker}>
              <select
                aria-label={FM('menuImport.columnMapping.selectFieldHint')}
                data-testid={`${TestIds.MENU_IMPORT_COLUMN_SELECT}-${mapping.columnIndex}`}
                style={columnStyles.selectInput}
                value={mapping.field}
                onChange={(e) => { handleSelectChange(mapping.columnIndex, e.target.value); }}
              >
                {FIELD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{FM(opt.labelKey)}</option>
                ))}
              </select>
            </View>
            <Text numberOfLines={SAMPLE_ROW_COUNT} style={[modalStyles.columnMapSample, { color: textColor }]}>
              {getSampleValues(sampleRows, mapping.columnIndex)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

function getSampleValues(rows: string[][], columnIndex: number): string {
  return rows.map((row) => row[columnIndex] ?? '').filter((v) => v !== '').join(', ');
}

export default ColumnMappingStep;
