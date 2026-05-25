/**
 * Tests for useAiImport hook.
 * Focuses on state transitions and data manipulation logic.
 */
import { renderHook, act } from '@testing-library/react-native';

import { useAiImport } from './useAiImport';
import AiImportMergeStrategy from '../../../../shared/enums/AiImportMergeStrategy';
import AiImportStep from '../../../../shared/enums/AiImportStep';


import type { ImportedMenuData } from '../../../../types/aiImportTypes';

const MOCK_DATA: ImportedMenuData = {
  categories: [
    {
      name: 'Starters',
      items: [
        { name: 'Soup', description: 'Hot soup', price: 8 },
        { name: 'Salad', description: 'Fresh salad', price: 10 },
      ],
    },
    {
      name: 'Mains',
      items: [{ name: 'Steak', price: 25 }],
    },
  ],
};

function createLargeFile(sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes);
  return new File([content], 'large.jpg', { type: 'image/jpeg' });
}

function createValidFile(): File {
  return new File(['content'], 'menu.jpg', { type: 'image/jpeg' });
}

describe('useAiImport', () => {
  it('starts at upload step with default state', () => {
    const { result } = renderHook(() => useAiImport());

    expect(result.current.state.step).toBe(AiImportStep.Upload);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.importedData).toBeNull();
    expect(result.current.state.mergeStrategy).toBe(AiImportMergeStrategy.Replace);
  });

  describe('handleFileValidation', () => {
    it('rejects files that are too large', () => {
      const { result } = renderHook(() => useAiImport());
      const largeFile = createLargeFile(11_000_000);

      let validationError: string | null = null;
      act(() => {
        validationError = result.current.handleFileValidation(largeFile);
      });

      expect(validationError).toBe('aiImport.errors.fileTooLarge');
      expect(result.current.state.step).toBe(AiImportStep.Upload);
    });

    it('rejects unsupported file formats', () => {
      const { result } = renderHook(() => useAiImport());
      const txtFile = new File(['data'], 'menu.txt', { type: 'text/plain' });

      let validationError: string | null = null;
      act(() => {
        validationError = result.current.handleFileValidation(txtFile);
      });

      expect(validationError).toBe('aiImport.errors.unsupportedFormat');
    });

    it('accepts valid image files and moves to processing', () => {
      const { result } = renderHook(() => useAiImport());
      const validFile = createValidFile();

      let validationError: string | null = null;
      act(() => {
        validationError = result.current.handleFileValidation(validFile);
      });

      expect(validationError).toBeNull();
      expect(result.current.state.step).toBe(AiImportStep.Processing);
    });
  });

  describe('handleExtractionSuccess', () => {
    it('sets imported data and moves to review step', () => {
      const { result } = renderHook(() => useAiImport());

      act(() => { result.current.handleExtractionSuccess(MOCK_DATA); });

      expect(result.current.state.step).toBe(AiImportStep.Review);
      expect(result.current.state.importedData).toEqual(MOCK_DATA);
      expect(result.current.state.error).toBeNull();
    });
  });

  describe('handleExtractionError', () => {
    it('sets error and returns to upload step', () => {
      const { result } = renderHook(() => useAiImport());

      act(() => { result.current.handleExtractionError(); });

      expect(result.current.state.step).toBe(AiImportStep.Upload);
      expect(result.current.state.error).toBe('aiImport.errors.extractionFailed');
    });
  });

  describe('review step editing', () => {
    it('updates a category name', () => {
      const { result } = renderHook(() => useAiImport());
      act(() => { result.current.handleExtractionSuccess(MOCK_DATA); });

      act(() => { result.current.handleUpdateCategory(0, 'Appetizers'); });

      expect(result.current.state.importedData?.categories[0].name).toBe('Appetizers');
    });

    it('updates an item', () => {
      const { result } = renderHook(() => useAiImport());
      act(() => { result.current.handleExtractionSuccess(MOCK_DATA); });

      act(() => { result.current.handleUpdateItem(0, 0, { name: 'Tomato Soup', price: 9 }); });

      const item = result.current.state.importedData?.categories[0].items[0];
      expect(item?.name).toBe('Tomato Soup');
      expect(item?.price).toBe(9);
    });

    it('deletes an item', () => {
      const { result } = renderHook(() => useAiImport());
      act(() => { result.current.handleExtractionSuccess(MOCK_DATA); });

      act(() => { result.current.handleDeleteItem(0, 0); });

      expect(result.current.state.importedData?.categories[0].items).toHaveLength(1);
      expect(result.current.state.importedData?.categories[0].items[0].name).toBe('Salad');
    });

    it('removes category when last item is deleted', () => {
      const { result } = renderHook(() => useAiImport());
      act(() => { result.current.handleExtractionSuccess(MOCK_DATA); });

      act(() => { result.current.handleDeleteItem(1, 0); });

      expect(result.current.state.importedData?.categories).toHaveLength(1);
    });

    it('adds an item to a category', () => {
      const { result } = renderHook(() => useAiImport());
      act(() => { result.current.handleExtractionSuccess(MOCK_DATA); });

      act(() => { result.current.handleAddItem(0); });

      expect(result.current.state.importedData?.categories[0].items).toHaveLength(3);
    });
  });

  describe('navigation', () => {
    it('moves from review to apply', () => {
      const { result } = renderHook(() => useAiImport());
      act(() => { result.current.handleExtractionSuccess(MOCK_DATA); });

      act(() => { result.current.handleGoToApply(); });

      expect(result.current.state.step).toBe(AiImportStep.Apply);
    });

    it('goes back from apply to review', () => {
      const { result } = renderHook(() => useAiImport());
      act(() => { result.current.handleExtractionSuccess(MOCK_DATA); });
      act(() => { result.current.handleGoToApply(); });

      act(() => { result.current.handleGoBack(); });

      expect(result.current.state.step).toBe(AiImportStep.Review);
    });

    it('goes back from review to upload', () => {
      const { result } = renderHook(() => useAiImport());
      act(() => { result.current.handleExtractionSuccess(MOCK_DATA); });

      act(() => { result.current.handleGoBack(); });

      expect(result.current.state.step).toBe(AiImportStep.Upload);
    });
  });

  describe('handleSetStrategy', () => {
    it('updates the merge strategy', () => {
      const { result } = renderHook(() => useAiImport());

      act(() => { result.current.handleSetStrategy(AiImportMergeStrategy.Merge); });

      expect(result.current.state.mergeStrategy).toBe(AiImportMergeStrategy.Merge);
    });
  });

  describe('handleReset', () => {
    it('resets all state to initial values', () => {
      const { result } = renderHook(() => useAiImport());
      act(() => { result.current.handleExtractionSuccess(MOCK_DATA); });

      act(() => { result.current.handleReset(); });

      expect(result.current.state.step).toBe(AiImportStep.Upload);
      expect(result.current.state.importedData).toBeNull();
      expect(result.current.state.error).toBeNull();
    });
  });
});
