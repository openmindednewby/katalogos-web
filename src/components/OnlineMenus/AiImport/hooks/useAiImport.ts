/**
 * Hook for managing the AI menu import wizard state.
 * Orchestrates upload, processing, review, and apply steps.
 */
import { useCallback, useState } from 'react';

import { isValueDefined } from '@dloizides/utils';

import AiImportMergeStrategy from '../../../../shared/enums/AiImportMergeStrategy';
import AiImportStep from '../../../../shared/enums/AiImportStep';
import {
  AI_IMPORT_ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../utils/aiImportConstants';

import type { ImportedCategory, ImportedItem, ImportedMenuData } from '../../../../types/aiImportTypes';

// =============================================================================
// Types
// =============================================================================

export interface AiImportState {
  step: AiImportStep;
  error: string | null;
  importedData: ImportedMenuData | null;
  mergeStrategy: AiImportMergeStrategy;
}

export interface UseAiImportReturn {
  state: AiImportState;
  handleFileValidation: (file: File) => string | null;
  handleExtractionSuccess: (data: ImportedMenuData) => void;
  handleExtractionError: () => void;
  handleUpdateCategory: (catIndex: number, name: string) => void;
  handleUpdateItem: (catIndex: number, itemIndex: number, updates: Partial<ImportedItem>) => void;
  handleDeleteItem: (catIndex: number, itemIndex: number) => void;
  handleAddItem: (catIndex: number) => void;
  handleSetStrategy: (strategy: AiImportMergeStrategy) => void;
  handleGoBack: () => void;
  handleGoToApply: () => void;
  handleReset: () => void;
}

type SetState = React.Dispatch<React.SetStateAction<AiImportState>>;

// =============================================================================
// Helpers
// =============================================================================

function createInitialState(): AiImportState {
  return {
    step: AiImportStep.Upload,
    error: null,
    importedData: null,
    mergeStrategy: AiImportMergeStrategy.Replace,
  };
}

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES)
    return 'aiImport.errors.fileTooLarge';

  const isAcceptedType = AI_IMPORT_ACCEPTED_MIME_TYPES.includes(file.type);
  if (!isAcceptedType) return 'aiImport.errors.unsupportedFormat';
  return null;
}

function updateCategoryInData(data: ImportedMenuData, catIndex: number, name: string): ImportedMenuData {
  const categories = data.categories.map((cat, i) => (i === catIndex ? { ...cat, name } : cat));
  return { ...data, categories };
}

function updateItemInData(data: ImportedMenuData, catIndex: number, itemIndex: number, updates: Partial<ImportedItem>): ImportedMenuData {
  const categories = data.categories.map((cat, ci) => {
    if (ci !== catIndex) return cat;
    const items = cat.items.map((item, ii) => (ii === itemIndex ? { ...item, ...updates } : item));
    return { ...cat, items };
  });
  return { ...data, categories };
}

function deleteItemInData(data: ImportedMenuData, catIndex: number, itemIndex: number): ImportedMenuData {
  const categories: ImportedCategory[] = data.categories
    .map((cat, ci) => {
      if (ci !== catIndex) return cat;
      return { ...cat, items: cat.items.filter((_, ii) => ii !== itemIndex) };
    })
    .filter((cat) => cat.items.length > 0);
  return { ...data, categories };
}

function addItemInData(data: ImportedMenuData, catIndex: number): ImportedMenuData {
  const categories = data.categories.map((cat, ci) => {
    if (ci !== catIndex) return cat;
    const newItem: ImportedItem = { name: '', price: 0 };
    return { ...cat, items: [...cat.items, newItem] };
  });
  return { ...data, categories };
}

// =============================================================================
// Sub-hooks
// =============================================================================

function useFileHandlers(setState: SetState): {
  handleFileValidation: (file: File) => string | null;
  handleExtractionSuccess: (data: ImportedMenuData) => void;
  handleExtractionError: () => void;
} {
  const handleFileValidation = useCallback((file: File): string | null => {
    const error = validateFile(file);
    if (isValueDefined(error)) {
      setState((prev) => ({ ...prev, error, step: AiImportStep.Upload }));
      return error;
    }
    setState((prev) => ({ ...prev, error: null, step: AiImportStep.Processing }));
    return null;
  }, [setState]);

  const handleExtractionSuccess = useCallback((data: ImportedMenuData) => {
    setState((prev) => ({ ...prev, importedData: data, step: AiImportStep.Review, error: null }));
  }, [setState]);

  const handleExtractionError = useCallback(() => {
    setState((prev) => ({ ...prev, error: 'aiImport.errors.extractionFailed', step: AiImportStep.Upload }));
  }, [setState]);

  return { handleFileValidation, handleExtractionSuccess, handleExtractionError };
}

function useDataEditing(setState: SetState): {
  handleUpdateCategory: (catIndex: number, name: string) => void;
  handleUpdateItem: (catIndex: number, itemIndex: number, updates: Partial<ImportedItem>) => void;
  handleDeleteItem: (catIndex: number, itemIndex: number) => void;
  handleAddItem: (catIndex: number) => void;
} {
  const handleUpdateCategory = useCallback((catIndex: number, name: string) => {
    setState((prev) => prev.importedData ? { ...prev, importedData: updateCategoryInData(prev.importedData, catIndex, name) } : prev);
  }, [setState]);

  const handleUpdateItem = useCallback((catIndex: number, itemIndex: number, updates: Partial<ImportedItem>) => {
    setState((prev) => prev.importedData ? { ...prev, importedData: updateItemInData(prev.importedData, catIndex, itemIndex, updates) } : prev);
  }, [setState]);

  const handleDeleteItem = useCallback((catIndex: number, itemIndex: number) => {
    setState((prev) => prev.importedData ? { ...prev, importedData: deleteItemInData(prev.importedData, catIndex, itemIndex) } : prev);
  }, [setState]);

  const handleAddItem = useCallback((catIndex: number) => {
    setState((prev) => prev.importedData ? { ...prev, importedData: addItemInData(prev.importedData, catIndex) } : prev);
  }, [setState]);

  return { handleUpdateCategory, handleUpdateItem, handleDeleteItem, handleAddItem };
}

function useNavigation(setState: SetState): {
  handleSetStrategy: (strategy: AiImportMergeStrategy) => void;
  handleGoBack: () => void;
  handleGoToApply: () => void;
  handleReset: () => void;
} {
  const handleSetStrategy = useCallback((strategy: AiImportMergeStrategy) => {
    setState((prev) => ({ ...prev, mergeStrategy: strategy }));
  }, [setState]);

  const handleGoBack = useCallback(() => {
    setState((prev) => {
      if (prev.step === AiImportStep.Review) return { ...prev, step: AiImportStep.Upload };
      if (prev.step === AiImportStep.Apply) return { ...prev, step: AiImportStep.Review };
      return prev;
    });
  }, [setState]);

  const handleGoToApply = useCallback(() => {
    setState((prev) => ({ ...prev, step: AiImportStep.Apply }));
  }, [setState]);

  const handleReset = useCallback(() => { setState(createInitialState()); }, [setState]);

  return { handleSetStrategy, handleGoBack, handleGoToApply, handleReset };
}

// =============================================================================
// Hook
// =============================================================================

export function useAiImport(): UseAiImportReturn {
  const [state, setState] = useState<AiImportState>(createInitialState);
  const fileHandlers = useFileHandlers(setState);
  const dataEditing = useDataEditing(setState);
  const navigation = useNavigation(setState);

  return { state, ...fileHandlers, ...dataEditing, ...navigation };
}
