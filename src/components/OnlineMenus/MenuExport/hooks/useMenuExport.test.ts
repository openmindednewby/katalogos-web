import { renderHook, act } from '@testing-library/react-native';

import { useMenuExport } from './useMenuExport';
import ExportFormat from '../../../../shared/enums/ExportFormat';

import type { MenuContents } from '../../../../types/menuTypes';

// Mock the download utility to prevent actual DOM manipulation in tests
jest.mock('../utils/downloadFile', () => ({
  buildExportFilename: jest.fn().mockReturnValue('test-export-2026-03-20.csv'),
  downloadFile: jest.fn(),
}));

const MENU_WITH_DATA: MenuContents = {
  categories: [{
    name: 'Mains',
    displayOrder: 0,
    items: [{
      name: 'Burger',
      description: 'Beef patty',
      price: 12.5,
      isAvailable: true,
      displayOrder: 0,
    }],
  }],
};

const EMPTY_MENU: MenuContents = { categories: [] };

describe('useMenuExport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('defaults to CSV format', () => {
    const { result } = renderHook(() => useMenuExport({ contents: MENU_WITH_DATA }));
    expect(result.current.selectedFormat).toBe(ExportFormat.Csv);
  });

  it('allows changing the selected format', () => {
    const { result } = renderHook(() => useMenuExport({ contents: MENU_WITH_DATA }));

    act(() => { result.current.setSelectedFormat(ExportFormat.Json); });

    expect(result.current.selectedFormat).toBe(ExportFormat.Json);
  });

  it('reports hasData as true when menu has items', () => {
    const { result } = renderHook(() => useMenuExport({ contents: MENU_WITH_DATA }));
    expect(result.current.hasData).toBe(true);
  });

  it('reports hasData as false for empty menu', () => {
    const { result } = renderHook(() => useMenuExport({ contents: EMPTY_MENU }));
    expect(result.current.hasData).toBe(false);
  });

  it('reports hasData as false for null contents', () => {
    const { result } = renderHook(() => useMenuExport({ contents: null }));
    expect(result.current.hasData).toBe(false);
  });

  it('reports hasData as false for categories with no items', () => {
    const contentsNoItems: MenuContents = {
      categories: [{ name: 'Empty', items: [] }],
    };
    const { result } = renderHook(() => useMenuExport({ contents: contentsNoItems }));
    expect(result.current.hasData).toBe(false);
  });

  it('returns failure when exporting empty menu', () => {
    const { result } = renderHook(() => useMenuExport({ contents: EMPTY_MENU }));

    let exportResult: { success: boolean; message: string } = { success: true, message: '' };
    act(() => { exportResult = result.current.exportMenu(); });

    expect(exportResult.success).toBe(false);
  });

  it('returns success when exporting menu with data', () => {
    const { result } = renderHook(() => useMenuExport({ contents: MENU_WITH_DATA, menuName: 'Test Menu' }));

    let exportResult: { success: boolean; message: string } = { success: false, message: '' };
    act(() => { exportResult = result.current.exportMenu(); });

    expect(exportResult.success).toBe(true);
  });

  it('calls downloadFile when exporting with data', () => {
    const { downloadFile } = jest.requireMock('../utils/downloadFile');
    const { result } = renderHook(() => useMenuExport({ contents: MENU_WITH_DATA, menuName: 'Test' }));

    act(() => { result.current.exportMenu(); });

    expect(downloadFile).toHaveBeenCalledTimes(1);
  });

  it('does not call downloadFile when exporting empty menu', () => {
    const { downloadFile } = jest.requireMock('../utils/downloadFile');
    const { result } = renderHook(() => useMenuExport({ contents: EMPTY_MENU }));

    act(() => { result.current.exportMenu(); });

    expect(downloadFile).not.toHaveBeenCalled();
  });

  it('exports in JSON format when selected', () => {
    const { downloadFile } = jest.requireMock('../utils/downloadFile');
    const { result } = renderHook(() => useMenuExport({ contents: MENU_WITH_DATA }));

    act(() => { result.current.setSelectedFormat(ExportFormat.Json); });
    act(() => { result.current.exportMenu(); });

    expect(downloadFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      ExportFormat.Json,
    );
  });
});
