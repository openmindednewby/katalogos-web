/**
 * Tests for the useMenuImport hook.
 */
import { act, renderHook } from '@testing-library/react-native';

import { useMenuImport } from './useMenuImport';
import ImportStep from '../../../../shared/enums/ImportStep';
import MenuField from '../../../../shared/enums/MenuField';
import * as parseModule from '../utils/parseMenuFile';


// Mock parseMenuFile to avoid actual file I/O
jest.mock('../utils/parseMenuFile');
const mockParseMenuFile = parseModule.parseMenuFile as jest.MockedFunction<typeof parseModule.parseMenuFile>;

describe('useMenuImport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in Upload step with no data', () => {
    const { result } = renderHook(() => useMenuImport());

    expect(result.current.step).toBe(ImportStep.Upload);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.parsedFile).toBeNull();
    expect(result.current.columnMappings).toEqual([]);
  });

  it('transitions to MapColumns step after successful file parse', async () => {
    mockParseMenuFile.mockResolvedValue({
      headers: ['Category', 'Item Name', 'Price'],
      rows: [['Appetizers', 'Salad', '9.99']],
    });

    const { result } = renderHook(() => useMenuImport());

    const fakeFile = new File([''], 'menu.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.handleFileSelected(fakeFile);
    });

    expect(result.current.step).toBe(ImportStep.MapColumns);
    expect(result.current.columnMappings).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('shows error when file parse fails', async () => {
    mockParseMenuFile.mockResolvedValue({
      headers: [],
      rows: [],
      error: 'emptyFile',
    });

    const { result } = renderHook(() => useMenuImport());
    const fakeFile = new File([''], 'empty.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.handleFileSelected(fakeFile);
    });

    expect(result.current.step).toBe(ImportStep.Upload);
    expect(result.current.error).toBe('menuImport.errors.emptyFile');
  });

  it('updates column mapping when handleUpdateMapping is called', async () => {
    mockParseMenuFile.mockResolvedValue({
      headers: ['Col A', 'Col B', 'Col C'],
      rows: [['Appetizers', 'Salad', '9.99']],
    });

    const { result } = renderHook(() => useMenuImport());
    const fakeFile = new File([''], 'menu.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.handleFileSelected(fakeFile);
    });

    act(() => {
      result.current.handleUpdateMapping(0, MenuField.Category);
    });

    expect(result.current.columnMappings[0].field).toBe(MenuField.Category);
  });

  it('transitions to Preview step with validation results', async () => {
    mockParseMenuFile.mockResolvedValue({
      headers: ['Category', 'Item Name', 'Price'],
      rows: [['Appetizers', 'Salad', '9.99']],
    });

    const { result } = renderHook(() => useMenuImport());
    const fakeFile = new File([''], 'menu.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.handleFileSelected(fakeFile);
    });

    act(() => {
      result.current.handleGoToPreview();
    });

    expect(result.current.step).toBe(ImportStep.Preview);
    expect(result.current.validationResult).not.toBeNull();
    expect(result.current.validationResult?.validCount).toBe(1);
  });

  it('goes back from Preview to MapColumns', async () => {
    mockParseMenuFile.mockResolvedValue({
      headers: ['Category', 'Item Name', 'Price'],
      rows: [['Appetizers', 'Salad', '9.99']],
    });

    const { result } = renderHook(() => useMenuImport());
    const fakeFile = new File([''], 'menu.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.handleFileSelected(fakeFile);
    });

    act(() => {
      result.current.handleGoToPreview();
    });

    act(() => {
      result.current.handleGoBack();
    });

    expect(result.current.step).toBe(ImportStep.MapColumns);
  });

  it('goes back from MapColumns to Upload', async () => {
    mockParseMenuFile.mockResolvedValue({
      headers: ['Category', 'Item Name', 'Price'],
      rows: [['Appetizers', 'Salad', '9.99']],
    });

    const { result } = renderHook(() => useMenuImport());
    const fakeFile = new File([''], 'menu.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.handleFileSelected(fakeFile);
    });

    act(() => {
      result.current.handleGoBack();
    });

    expect(result.current.step).toBe(ImportStep.Upload);
  });

  it('returns MenuContents from handleConfirmImport', async () => {
    mockParseMenuFile.mockResolvedValue({
      headers: ['Category', 'Item Name', 'Price'],
      rows: [['Appetizers', 'Salad', '9.99']],
    });

    const { result } = renderHook(() => useMenuImport());
    const fakeFile = new File([''], 'menu.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.handleFileSelected(fakeFile);
    });

    act(() => {
      result.current.handleGoToPreview();
    });

    let importedContents = null;
    act(() => {
      importedContents = result.current.handleConfirmImport();
    });

    expect(importedContents).not.toBeNull();
    expect(result.current.importSummary).not.toBeNull();
    expect(result.current.importSummary?.itemCount).toBe(1);
    expect(result.current.importSummary?.categoryCount).toBe(1);
  });

  it('resets state when handleReset is called', async () => {
    mockParseMenuFile.mockResolvedValue({
      headers: ['Category', 'Item Name', 'Price'],
      rows: [['Appetizers', 'Salad', '9.99']],
    });

    const { result } = renderHook(() => useMenuImport());
    const fakeFile = new File([''], 'menu.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.handleFileSelected(fakeFile);
    });

    act(() => {
      result.current.handleReset();
    });

    expect(result.current.step).toBe(ImportStep.Upload);
    expect(result.current.parsedFile).toBeNull();
    expect(result.current.columnMappings).toEqual([]);
  });

  it('provides sample rows limited to configured count', async () => {
    mockParseMenuFile.mockResolvedValue({
      headers: ['Category', 'Item Name', 'Price'],
      rows: [
        ['A', 'Item 1', '1'],
        ['A', 'Item 2', '2'],
        ['A', 'Item 3', '3'],
        ['A', 'Item 4', '4'],
        ['A', 'Item 5', '5'],
      ],
    });

    const { result } = renderHook(() => useMenuImport());
    const fakeFile = new File([''], 'menu.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.handleFileSelected(fakeFile);
    });

    // SAMPLE_ROW_COUNT is 3
    expect(result.current.sampleRows).toHaveLength(3);
  });

  it('reports column mapping errors when required fields are missing', async () => {
    mockParseMenuFile.mockResolvedValue({
      headers: ['Notes', 'Allergens'],
      rows: [['Some note', 'Gluten']],
    });

    const { result } = renderHook(() => useMenuImport());
    const fakeFile = new File([''], 'menu.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.handleFileSelected(fakeFile);
    });

    // None of the headers match Category, Item Name, or Price
    expect(result.current.columnMappingErrors.length).toBeGreaterThan(0);
  });
});
