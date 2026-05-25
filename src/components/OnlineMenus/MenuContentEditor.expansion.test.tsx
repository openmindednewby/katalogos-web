/**
 * Tests for MenuContentEditor - Category Expansion functionality.
 */
import './MenuContentEditor.mocks';

import { fireEvent, render, within } from '@testing-library/react-native';

import MenuContentEditor from './MenuContentEditor';
import { createWrapper } from './testUtils';

import type { MenuContents } from '../../types/menuTypes';

describe('MenuContentEditor - Category Expansion', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    contents: null,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('expands and collapses categories when toggle button is pressed', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [],
          displayOrder: 0,
        },
      ],
    };

    const { getByTestId, getByText, queryByText } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    const toggleButton = getByTestId('category-toggle-button-0');

    // Initially collapsed - arrow points right, no Add Item button
    expect(within(toggleButton).getByText('\u25B6')).toBeTruthy();
    expect(getByText('Appetizers')).toBeTruthy();
    expect(queryByText('Add Item')).toBeNull();

    // Expand
    fireEvent.press(toggleButton);
    expect(within(toggleButton).getByText('\u25BC')).toBeTruthy();
    expect(queryByText('Add Item')).toBeTruthy();

    // Collapse
    fireEvent.press(toggleButton);
    expect(within(toggleButton).getByText('\u25B6')).toBeTruthy();
    expect(queryByText('Add Item')).toBeNull();
  });
});
