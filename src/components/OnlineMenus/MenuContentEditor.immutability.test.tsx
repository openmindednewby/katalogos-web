/**
 * Tests for MenuContentEditor - Immutable state updates and ID-based expansion.
 *
 * BUG-MENU-010: Expansion tracking uses category ID (not index).
 * BUG-MENU-013: Handlers clone category objects before mutating.
 */
import './MenuContentEditor.mocks';

import { fireEvent, render, within } from '@testing-library/react-native';

import MenuContentEditor from './MenuContentEditor';
import { createWrapper } from './testUtils';

import type { Category, MenuContents } from '../../types/menuTypes';

describe('MenuContentEditor - Immutable Updates (BUG-MENU-013)', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    contents: null,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not mutate the original category when adding an item', () => {
    const originalCategory: Category = {
      id: 'cat-1',
      name: 'Appetizers',
      items: [{ name: 'Existing', price: 5, isAvailable: true, displayOrder: 0 }],
      displayOrder: 0,
    };
    const contents: MenuContents = {
      categories: [originalCategory],
    };

    const { getByText, getByTestId } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    // Expand category
    fireEvent.press(getByTestId('category-toggle-button-0'));
    // Add item
    fireEvent.press(getByText('Add Item'));

    // Original category should NOT have been mutated
    expect(originalCategory.items).toHaveLength(1);
    expect(originalCategory.items?.[0].name).toBe('Existing');

    // onChange should have been called with a new category object
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const result = mockOnChange.mock.calls[0][0] as MenuContents;
    const EXPECTED_ITEMS_COUNT = 2;
    expect(result.categories?.[0].items).toHaveLength(EXPECTED_ITEMS_COUNT);
    // Verify it is a different reference
    expect(result.categories?.[0]).not.toBe(originalCategory);
  });

  it('does not mutate the original category when updating an item', () => {
    const originalItem = { name: 'Bruschetta', price: 8.5, isAvailable: true, displayOrder: 0 };
    const originalCategory: Category = {
      id: 'cat-1',
      name: 'Appetizers',
      items: [originalItem],
      displayOrder: 0,
    };
    const contents: MenuContents = {
      categories: [originalCategory],
    };

    const { getByTestId, getByDisplayValue } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    fireEvent.press(getByTestId('category-toggle-button-0'));
    fireEvent.changeText(getByDisplayValue('8.5'), '12.99');

    // Original should not have changed
    expect(originalItem.price).toBe(8.5);
    expect(originalCategory.items?.[0].price).toBe(8.5);

    // New data should be different reference
    const result = mockOnChange.mock.calls[0][0] as MenuContents;
    expect(result.categories?.[0]).not.toBe(originalCategory);
  });

  it('does not mutate the original category when deleting an item', () => {
    const originalCategory: Category = {
      id: 'cat-1',
      name: 'Appetizers',
      items: [
        { name: 'Item A', price: 5, isAvailable: true, displayOrder: 0 },
        { name: 'Item B', price: 6, isAvailable: true, displayOrder: 1 },
      ],
      displayOrder: 0,
    };
    const contents: MenuContents = {
      categories: [originalCategory],
    };

    const { getByTestId, getAllByText } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    fireEvent.press(getByTestId('category-toggle-button-0'));
    const deleteButtons = getAllByText('Delete');
    // First delete button is for category, second is for first item
    fireEvent.press(deleteButtons[1]);

    // Original should still have both items
    const ORIGINAL_ITEMS_COUNT = 2;
    expect(originalCategory.items).toHaveLength(ORIGINAL_ITEMS_COUNT);

    // New result should have only one item
    const result = mockOnChange.mock.calls[0][0] as MenuContents;
    expect(result.categories?.[0].items).toHaveLength(1);
    expect(result.categories?.[0]).not.toBe(originalCategory);
  });
});

describe('MenuContentEditor - ID-based Expansion (BUG-MENU-010)', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    contents: null,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('expands category by ID, not by index', () => {
    const contents: MenuContents = {
      categories: [
        { id: 'cat-alpha', name: 'Alpha', items: [], displayOrder: 0 },
        { id: 'cat-beta', name: 'Beta', items: [], displayOrder: 1 },
      ],
    };

    const { getByTestId, queryByText } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    // Expand the second category (Beta) using its toggle button
    fireEvent.press(getByTestId('category-toggle-button-1'));

    // Beta should be expanded: its toggle shows down arrow
    const alphaToggle = getByTestId('category-toggle-button-0');
    const betaToggle = getByTestId('category-toggle-button-1');
    expect(within(alphaToggle).getByText('\u25B6')).toBeTruthy();
    expect(within(betaToggle).getByText('\u25BC')).toBeTruthy();
    // Only the expanded category should show "Add Item"
    expect(queryByText('Add Item')).toBeTruthy();
  });

  it('maintains expansion state when category order changes', () => {
    const contents: MenuContents = {
      categories: [
        { id: 'cat-alpha', name: 'Alpha', items: [], displayOrder: 0 },
        { id: 'cat-beta', name: 'Beta', items: [], displayOrder: 1 },
      ],
    };

    const { getByTestId, rerender } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    // Expand Beta
    fireEvent.press(getByTestId('category-toggle-button-1'));
    const betaToggle = getByTestId('category-toggle-button-1');
    expect(within(betaToggle).getByText('\u25BC')).toBeTruthy();

    // Now rerender with Alpha deleted (Beta moves to index 0)
    const newContents: MenuContents = {
      categories: [
        { id: 'cat-beta', name: 'Beta', items: [], displayOrder: 0 },
      ],
    };

    rerender(<MenuContentEditor {...defaultProps} contents={newContents} />);

    // Beta should STILL be expanded (tracked by ID, not index)
    const betaToggleAfter = getByTestId('category-toggle-button-0');
    expect(within(betaToggleAfter).getByText('\u25BC')).toBeTruthy();
  });
});
