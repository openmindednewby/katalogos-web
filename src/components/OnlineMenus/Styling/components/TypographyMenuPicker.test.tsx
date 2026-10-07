import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { TypographyMenuPicker } from './TypographyMenuPicker';

import type { TypographyMenuPickerProps } from './TypographyMenuPicker';



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


describe('TypographyMenuPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe('search filtering', () => {
    it('shows all options when modal is opened', () => {
      const { getByTestId, getAllByText, getByText } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} />,
      );

      fireEvent.press(getByTestId('test-picker'));

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

      expect(queryAllByText('Serif')).toHaveLength(1);
      expect(queryAllByText('System')).toHaveLength(1);
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

      expect(queryAllByText('System')).toHaveLength(2);
      expect(getByText('Serif')).toBeTruthy();
      expect(getByText('Sans-serif')).toBeTruthy();
      expect(getByText('Monospace')).toBeTruthy();
    });
  });


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

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');
      fireEvent.changeText(searchInput, 'Ser');
      fireEvent.press(getByText('Serif'));

      fireEvent.press(getByTestId('test-picker'));

      expect(getAllByText('System')).toHaveLength(2);
      expect(getByText('Serif')).toBeTruthy();
      expect(getByText('Sans-serif')).toBeTruthy();
      expect(getByText('Monospace')).toBeTruthy();
    });
  });


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

      expect(queryAllByText('Serif')).toHaveLength(1);
      expect(getByText('Use custom font: Ser')).toBeTruthy();
    });

    it('performs case-insensitive exact match check for custom option', () => {
      const { getByTestId, queryByTestId } = render(
        <TypographyMenuPicker {...DEFAULT_PROPS} allowCustom />,
      );

      fireEvent.press(getByTestId('test-picker'));
      const searchInput = getByTestId('test-picker-search');
      fireEvent.changeText(searchInput, 'system');

      expect(queryByTestId('test-picker-custom-option')).toBeNull();
    });
  });


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
