import { renderHook, act } from '@testing-library/react-native';

import { useMenuPdfExport } from './useMenuPdfExport';

import type { MenuContents } from '../../../../types/menuTypes';

// Mock the renderer module
const mockRenderMenuPdf = jest.fn();
jest.mock('../utils/menuPdfRenderer', () => ({
  renderMenuPdf: (...args: unknown[]) => mockRenderMenuPdf(...args),
}));

// Mock createPdfDocument to avoid dynamic jsPDF import
const mockSave = jest.fn();
const mockDoc = {
  setFontSize: jest.fn(),
  setFont: jest.fn(),
  setDrawColor: jest.fn(),
  setLineWidth: jest.fn(),
  text: jest.fn(),
  line: jest.fn(),
  splitTextToSize: jest.fn(() => []),
  addPage: jest.fn(),
};

jest.mock('../utils/createPdfDocument', () => ({
  createPdfDocument: jest.fn(async () =>
    Promise.resolve({ doc: mockDoc, save: mockSave }),
  ),
}));

jest.mock('../../../../lib/notifications', () => ({
  notify: jest.fn(),
  notifySuccess: jest.fn(),
}));

jest.mock('@/localization/helpers', () => ({
  FM: jest.fn((key: string) => key),
}));

const sampleContents: MenuContents = {
  categories: [
    {
      name: 'Appetizers',
      items: [
        { name: 'Spring Rolls', price: 8.5, isAvailable: true },
      ],
    },
  ],
};

describe('useMenuPdfExport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with isExporting false', () => {
    const { result } = renderHook(() =>
      useMenuPdfExport({ menuName: 'Test', restaurantName: 'Resto', contents: sampleContents }),
    );
    expect(result.current.isExporting).toBe(false);
  });

  it('calls renderMenuPdf and save on export', async () => {
    const { result } = renderHook(() =>
      useMenuPdfExport({ menuName: 'Lunch', restaurantName: 'Cafe', contents: sampleContents }),
    );

    await act(async () => {
      await result.current.exportPdf();
    });

    expect(mockRenderMenuPdf).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith('menu-Lunch.pdf');
  });

  it('notifies success after export', async () => {
    const { notifySuccess } = jest.requireMock('../../../../lib/notifications');
    const { result } = renderHook(() =>
      useMenuPdfExport({ menuName: 'Menu', restaurantName: '', contents: sampleContents }),
    );

    await act(async () => {
      await result.current.exportPdf();
    });

    expect(notifySuccess).toHaveBeenCalledWith('onlineMenus.pdfExport.downloadStarted');
  });

  it('notifies error when rendering throws', async () => {
    mockRenderMenuPdf.mockImplementationOnce(() => {
      throw new Error('PDF error');
    });
    const { notify } = jest.requireMock('../../../../lib/notifications');
    const { result } = renderHook(() =>
      useMenuPdfExport({ menuName: 'Menu', restaurantName: '', contents: sampleContents }),
    );

    await act(async () => {
      await result.current.exportPdf();
    });

    expect(notify).toHaveBeenCalledWith('error', 'onlineMenus.pdfExport.downloadFailed');
  });

  it('resets isExporting to false after completion', async () => {
    const { result } = renderHook(() =>
      useMenuPdfExport({ menuName: 'Menu', restaurantName: '', contents: sampleContents }),
    );

    await act(async () => {
      await result.current.exportPdf();
    });

    expect(result.current.isExporting).toBe(false);
  });
});
