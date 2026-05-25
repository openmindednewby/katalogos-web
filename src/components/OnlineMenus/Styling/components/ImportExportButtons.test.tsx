/**
 * Unit tests for ImportExportButtons component.
 *
 * Tests focus on logic and callbacks:
 * - Export button triggers download
 * - Disabled state prevents actions
 *
 * Note: File input tests are limited because HTML input elements
 * don't work well with react-native-testing-library.
 */

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';

import ImportExportButtons from './ImportExportButtons';
import i18n from '../../../../localization/i18n';
import { TestIds } from '../../../../shared/testIds';
import * as menuConfigExport from '../../../../utils/menuConfigExport';

import type { MenuContents } from '../../../../types/menuTypes';

// =============================================================================
// Mocks
// =============================================================================

jest.mock('../../../../utils/menuConfigExport', () => ({
  downloadMenuConfig: jest.fn(),
  exportMenuConfig: jest.fn(() => '{}'),
}));

jest.mock('../../../../utils/menuConfigImport', () => ({
  importMenuConfigFromFile: jest.fn(),
}));

// =============================================================================
// Test Setup
// =============================================================================

const mockStore = configureStore({
  reducer: {
    ui: () => ({ theme: 'light' }),
  },
});

function renderWithProviders(component: React.ReactElement): ReturnType<typeof render> {
  return render(
    <Provider store={mockStore}>
      <I18nextProvider i18n={i18n}>{component}</I18nextProvider>
    </Provider>
  );
}

const mockContents: MenuContents = {
  schemaVersion: 2,
  categories: [{ name: 'Test Category', displayOrder: 0, items: [{ name: 'Test Item', displayOrder: 0, price: 9.99 }] }],
};

describe('ImportExportButtons', () => {
  const mockOnImport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders export button', () => {
      const { getByTestId } = renderWithProviders(<ImportExportButtons contents={mockContents} onImport={mockOnImport} />);
      expect(getByTestId(TestIds.EXPORT_CONFIG_BUTTON)).toBeTruthy();
    });

    it('renders import button', () => {
      const { getByTestId } = renderWithProviders(<ImportExportButtons contents={mockContents} onImport={mockOnImport} />);
      expect(getByTestId(TestIds.IMPORT_CONFIG_BUTTON)).toBeTruthy();
    });

    it('renders container', () => {
      const { getByTestId } = renderWithProviders(<ImportExportButtons contents={mockContents} onImport={mockOnImport} />);
      expect(getByTestId(TestIds.IMPORT_EXPORT_CONTAINER)).toBeTruthy();
    });
  });

  describe('export functionality', () => {
    it('calls downloadMenuConfig when export button is pressed', () => {
      const { getByTestId } = renderWithProviders(<ImportExportButtons contents={mockContents} onImport={mockOnImport} />);
      fireEvent.press(getByTestId(TestIds.EXPORT_CONFIG_BUTTON));
      expect(menuConfigExport.downloadMenuConfig).toHaveBeenCalledWith(mockContents);
    });

    it('passes current contents to downloadMenuConfig', () => {
      const customContents: MenuContents = { categories: [{ name: 'Custom', displayOrder: 0 }], colorScheme: { background: '#FF0000' } };
      const { getByTestId } = renderWithProviders(<ImportExportButtons contents={customContents} onImport={mockOnImport} />);
      fireEvent.press(getByTestId(TestIds.EXPORT_CONFIG_BUTTON));
      expect(menuConfigExport.downloadMenuConfig).toHaveBeenCalledWith(customContents);
    });

    it('does not call onImport when exporting', () => {
      const { getByTestId } = renderWithProviders(<ImportExportButtons contents={mockContents} onImport={mockOnImport} />);
      fireEvent.press(getByTestId(TestIds.EXPORT_CONFIG_BUTTON));
      expect(mockOnImport).not.toHaveBeenCalled();
    });

    it('calls downloadMenuConfig each time export is pressed', () => {
      const { getByTestId } = renderWithProviders(<ImportExportButtons contents={mockContents} onImport={mockOnImport} />);
      fireEvent.press(getByTestId(TestIds.EXPORT_CONFIG_BUTTON));
      fireEvent.press(getByTestId(TestIds.EXPORT_CONFIG_BUTTON));
      expect(menuConfigExport.downloadMenuConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe('disabled state', () => {
    it('does not call downloadMenuConfig when disabled', () => {
      const { getByTestId } = renderWithProviders(<ImportExportButtons disabled contents={mockContents} onImport={mockOnImport} />);
      fireEvent.press(getByTestId(TestIds.EXPORT_CONFIG_BUTTON));
      expect(menuConfigExport.downloadMenuConfig).not.toHaveBeenCalled();
    });

    it('renders both buttons when disabled', () => {
      const { getByTestId } = renderWithProviders(<ImportExportButtons disabled contents={mockContents} onImport={mockOnImport} />);
      expect(getByTestId(TestIds.EXPORT_CONFIG_BUTTON)).toBeTruthy();
      expect(getByTestId(TestIds.IMPORT_CONFIG_BUTTON)).toBeTruthy();
    });
  });

  describe('props handling', () => {
    it('uses updated contents when prop changes', () => {
      const { getByTestId, rerender } = renderWithProviders(<ImportExportButtons contents={mockContents} onImport={mockOnImport} />);

      const newContents: MenuContents = { categories: [{ name: 'New Category', displayOrder: 0 }] };
      rerender(
        <Provider store={mockStore}>
          <I18nextProvider i18n={i18n}>
            <ImportExportButtons contents={newContents} onImport={mockOnImport} />
          </I18nextProvider>
        </Provider>
      );

      fireEvent.press(getByTestId(TestIds.EXPORT_CONFIG_BUTTON));
      expect(menuConfigExport.downloadMenuConfig).toHaveBeenCalledWith(newContents);
    });
  });
});
