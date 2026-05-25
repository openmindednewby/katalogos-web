/**
 * Hook for managing the menu import wizard state.
 * Orchestrates file parsing, column detection, validation, and building final contents.
 */
import { useCallback, useMemo, useState } from 'react';

import { isValueDefined } from '@dloizides/utils';

import ImportStep from '../../../../shared/enums/ImportStep';
import { buildMenuContents } from '../utils/buildMenuContents';
import { detectColumnMappings } from '../utils/columnDetection';
import { SAMPLE_ROW_COUNT } from '../utils/menuImportConstants';
import { parseMenuFile } from '../utils/parseMenuFile';
import { validateColumnMappings, validateRows } from '../utils/validateMenuRows';

import type MenuField from '../../../../shared/enums/MenuField';
import type { MenuContents } from '../../../../types/menuTypes';
import type { ImportSummary } from '../utils/buildMenuContents';
import type { ColumnMapping } from '../utils/columnDetection';
import type { ParsedFileResult } from '../utils/parseMenuFile';
import type { ValidationResult } from '../utils/validateMenuRows';

// =============================================================================
// Types
// =============================================================================

export interface UseMenuImportReturn {
  step: ImportStep;
  isLoading: boolean;
  error: string | null;
  parsedFile: ParsedFileResult | null;
  columnMappings: ColumnMapping[];
  validationResult: ValidationResult | null;
  importSummary: ImportSummary | null;
  sampleRows: string[][];
  columnMappingErrors: string[];
  handleFileSelected: (file: File) => Promise<void>;
  handleUpdateMapping: (columnIndex: number, field: MenuField) => void;
  handleGoToPreview: () => void;
  handleGoBack: () => void;
  handleConfirmImport: (existingContents?: MenuContents | null) => MenuContents | null;
  handleReset: () => void;
}

interface ImportState {
  step: ImportStep;
  isLoading: boolean;
  error: string | null;
  parsedFile: ParsedFileResult | null;
  columnMappings: ColumnMapping[];
  validationResult: ValidationResult | null;
  importSummary: ImportSummary | null;
}

type SetState = React.Dispatch<React.SetStateAction<ImportState>>;

// =============================================================================
// Helpers
// =============================================================================

function createInitialState(): ImportState {
  return {
    step: ImportStep.Upload, isLoading: false, error: null,
    parsedFile: null, columnMappings: [], validationResult: null, importSummary: null,
  };
}

function buildErrorKey(errorCode: string): string {
  const knownErrors = new Set(['fileReadFailed', 'unsupportedFormat', 'emptyFile', 'tooManyRows']);
  if (knownErrors.has(errorCode)) return `menuImport.errors.${errorCode}`;
  return 'menuImport.errors.parseError';
}

// =============================================================================
// Hook
// =============================================================================

export function useMenuImport(): UseMenuImportReturn {
  const [state, setState] = useState<ImportState>(createInitialState);

  const sampleRows = useMemo(() => {
    if (!state.parsedFile) return [];
    return state.parsedFile.rows.slice(0, SAMPLE_ROW_COUNT);
  }, [state.parsedFile]);

  const columnMappingErrors = useMemo(
    () => validateColumnMappings(state.columnMappings),
    [state.columnMappings],
  );

  const handleFileSelected = useFileSelectedHandler(setState);
  const handleUpdateMapping = useMappingHandler(setState);
  const { handleGoToPreview, handleGoBack } = useNavigationHandlers(setState);
  const handleConfirmImport = useConfirmHandler(state, setState);
  const handleReset = useCallback(() => { setState(createInitialState()); }, [setState]);

  return {
    step: state.step, isLoading: state.isLoading, error: state.error,
    parsedFile: state.parsedFile, columnMappings: state.columnMappings,
    validationResult: state.validationResult, importSummary: state.importSummary,
    sampleRows, columnMappingErrors,
    handleFileSelected, handleUpdateMapping, handleGoToPreview,
    handleGoBack, handleConfirmImport, handleReset,
  };
}

// =============================================================================
// Individual Handler Hooks
// =============================================================================

function useFileSelectedHandler(setState: SetState): (file: File) => Promise<void> {
  return useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const result = await parseMenuFile(file);

     
    const hasError = isValueDefined(result.error) && result.error !== '';
     
    if (hasError) {
      setState((prev) => ({ ...prev, isLoading: false, error: buildErrorKey(result.error ?? ''), parsedFile: null }));
      return;
    }

    const mappings = detectColumnMappings(result.headers);
    setState((prev) => ({ ...prev, isLoading: false, parsedFile: result, columnMappings: mappings, step: ImportStep.MapColumns }));
  }, [setState]);
}

function useMappingHandler(setState: SetState): (columnIndex: number, field: MenuField) => void {
  return useCallback((columnIndex: number, field: MenuField) => {
    setState((prev) => ({
      ...prev, columnMappings: prev.columnMappings.map((m) => m.columnIndex === columnIndex ? { ...m, field } : m),
    }));
  }, [setState]);
}

function useNavigationHandlers(setState: SetState): { handleGoToPreview: () => void; handleGoBack: () => void } {
  const handleGoToPreview = useCallback(() => {
    setState((prev) => {
      if (!prev.parsedFile) return prev;
      const result = validateRows(prev.parsedFile.rows, prev.columnMappings);
      return { ...prev, step: ImportStep.Preview, validationResult: result };
    });
  }, [setState]);

  const handleGoBack = useCallback(() => {
    setState((prev) => {
      if (prev.step === ImportStep.MapColumns) return { ...prev, step: ImportStep.Upload };
      if (prev.step === ImportStep.Preview) return { ...prev, step: ImportStep.MapColumns, validationResult: null };
      return prev;
    });
  }, [setState]);

  return { handleGoToPreview, handleGoBack };
}

function useConfirmHandler(
  state: ImportState,
  setState: SetState,
): (existingContents?: MenuContents | null) => MenuContents | null {
  return useCallback(
    (existingContents?: MenuContents | null): MenuContents | null => {
      if (!state.validationResult) return null;
      const { contents, summary } = buildMenuContents(state.validationResult.rows, existingContents);
      setState((prev) => ({ ...prev, importSummary: summary }));
      return contents;
    },
    [state.validationResult, setState],
  );
}
