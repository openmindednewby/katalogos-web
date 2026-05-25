import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { TypographyMenuPicker } from './TypographyMenuPicker';

import type { TypographyMenuPickerProps } from './TypographyMenuPicker';

// =============================================================================
// Mocks
// =============================================================================

// =============================================================================
// Test Data
// =============================================================================

const MOCK_OPTIONS = [
  { label: 'System', value: 'System' },
  { label: 'Serif', value: 'Serif' },
  { label: 'Sans-serif', value: 'Sans-serif' },
  { label: 'Monospace', value: 'Monospace' },
] as const;

const DEFAULT_PROPS: TypographyMenuPickerProps = {
  label: 'Font',
  currentLabel: 'System',
  options: MOCK_OPTIONS,
  onSelect: jest.fn(),
  disabled: false,
  textColor: '#000000',
  textSecondary: '#666666',
  borderColor: '#cccccc',
  bgColor: '#ffffff',
  testID: 'test-picker',
  accessibilityLabel: 'Font picker',
  accessibilityHint: 'Opens font selection',
};

// =============================================================================
// Test Suite
// =============================================================================

describe('TypographyMenuPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Search Filtering
  // ---------------------------------------------------------------------------

  describe('search filtering', () => {
    it('shows all options when modal is opened', () => {
      const { getByTestId, getAllByText, getByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} />,
      );

      fireEvent.press(getByTestId('test-picker'));

      // System appears twice: trigger label + option in list
      expect(getAllByText('System')).toHaveLength(2);
      expect(getByText('Serif')).toBeTruthy();
      expect(getByText('Sans-serif')).toBeTruthy();
      expect(getByText('Monospace')).toBeTruthy();
    });

    it('filters options as user types', () => {
      const { getByTestId, queryAllByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');

      fireEvent.changeText(searchInput, 'ser');

      // 'Serif' matches; 'System' only in trigger (not in filtered list)
      expect(queryAllByText('Serif')).toHaveLength(1);
      // System still visible in trigger but NOT in options
      expect(queryAllByText('System')).toHaveLength(1); // only the trigger label
      expect(queryAllByText('Monospace')).toHaveLength(0);
    });

    it('performs case-insensitive filtering', () => {
      const { getByTestId, queryAllByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');

      fireEvent.changeText(searchInput, 'MONO');

      expect(queryAllByText('Monospace')).toHaveLength(1);
      // System only in trigger
      expect(queryAllByText('System')).toHaveLength(1);
    });

    it('shows no-results message when filter matches nothing', () => {
      const { getByTestId, getByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');

      fireEvent.changeText(searchInput, 'xyz');

      expect(getByText('No results found')).toBeTruthy();
    });

    it('shows all options again when search is cleared', () => {
      const { getByTestId, queryAllByText, getByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');

      fireEvent.changeText(searchInput, 'Serif');
      expect(queryAllByText('Monospace')).toHaveLength(0);

      fireEvent.changeText(searchInput, '');

      // All options visible again - System x2 (trigger + option)
      expect(queryAllByText('System')).toHaveLength(2);
      expect(getByText('Serif')).toBeTruthy();
      expect(getByText('Sans-serif')).toBeTruthy();
      expect(getByText('Monospace')).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  describe('selection', () => {
    it('calls onSelect when option is pressed', () => {
      const mockOnSelect = jest.fn();
      const { getByTestId, getByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} onSelect={mockOnSelect} />,
      );

      fireEvent.press(getByTestId('test-picker'));
      fireEvent.press(getByText('Serif'));

      expect(mockOnSelect).toHaveBeenCalledWith({ label: 'Serif', value: 'Serif' });
    });

    it('calls onSelect for filtered option', () => {
      const mockOnSelect = jest.fn();
      const { getByTestId, getByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} onSelect={mockOnSelect} />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');
      fireEvent.changeText(searchInput, 'Mono');
      fireEvent.press(getByText('Monospace'));

      expect(mockOnSelect).toHaveBeenCalledWith({ label: 'Monospace', value: 'Monospace' });
    });

    it('resets search text after selection', () => {
      const { getByTestId, getAllByText, getByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} />,
      );

      // Open, type, select
      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');
      fireEvent.changeText(searchInput, 'Ser');
      fireEvent.press(getByText('Serif'));

      // Re-open - should show all options
      fireEvent.press(getByTestId('test-picker'));

      // System appears twice (trigger + list)
      expect(getAllByText('System')).toHaveLength(2);
      expect(getByText('Serif')).toBeTruthy();
      expect(getByText('Sans-serif')).toBeTruthy();
      expect(getByText('Monospace')).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Custom Font
  // ---------------------------------------------------------------------------

  describe('custom font', () => {
    it('does not show custom option when allowCustom is false', () => {
      const { getByTestId, queryByTestId } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');
      fireEvent.changeText(searchInput, 'CustomFont');

      expect(queryByTestId('test-picker-custom-option')).toBeNull();
    });

    it('shows custom font option when typed text has no exact match', () => {
      const { getByTestId, getByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} allowCustom />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');
      fireEvent.changeText(searchInput, 'Lobster');

      expect(getByText('Use custom font: Lobster')).toBeTruthy();
    });

    it('does not show custom option when typed text exactly matches an option', () => {
      const { getByTestId, queryByTestId } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} allowCustom />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');
      fireEvent.changeText(searchInput, 'System');

      expect(queryByTestId('test-picker-custom-option')).toBeNull();
    });

    it('passes raw search text as value when custom option is selected', () => {
      const mockOnSelect = jest.fn();
      const { getByTestId } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} allowCustom onSelect={mockOnSelect} />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');
      fireEvent.changeText(searchInput, 'Lobster');

      const customOption = getByTestId('test-picker-custom-option');
      fireEvent.press(customOption);

      expect(mockOnSelect).toHaveBeenCalledWith({ label: 'Lobster', value: 'Lobster' });
    });

    it('shows custom option alongside partial matches', () => {
      const { getByTestId, getByText, queryAllByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} allowCustom />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');
      fireEvent.changeText(searchInput, 'Ser');

      // 'Serif' partially matches and should be shown
      expect(queryAllByText('Serif')).toHaveLength(1);
      // Custom option should also appear since 'Ser' is not an exact match
      expect(getByText('Use custom font: Ser')).toBeTruthy();
    });

    it('performs case-insensitive exact match check for custom option', () => {
      const { getByTestId, queryByTestId } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} allowCustom />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');
      fireEvent.changeText(searchInput, 'system');

      // 'system' matches 'System' case-insensitively, so no custom option
      expect(queryByTestId('test-picker-custom-option')).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Disabled State
  // ---------------------------------------------------------------------------

  describe('disabled state', () => {
    it('does not open menu when disabled', () => {
      const { getByTestId, queryByTestId } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} disabled />,
      );

      fireEvent.press(getByTestId('test-picker'));
      expect(queryByTestId('test-picker-search')).toBeNull();
    });
  });
});
