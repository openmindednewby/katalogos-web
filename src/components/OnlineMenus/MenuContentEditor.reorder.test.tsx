/**
 * Tests for MenuContentEditor - Category and Item reordering.
 * Category move buttons are inside the overflow menu modal.
 */
import './MenuContentEditor.mocks';

import { fireEvent, render } from '@testing-library/react-native';

import MenuContentEditor from './MenuContentEditor';
import { createWrapper } from './testUtils';

import type { MenuContents } from '../../types/menuTypes';

/** Opens the overflow menu for a category, then presses the target button. */
function openOverflowAndPress(
  getByTestId: ReturnType<typeof render>['getByTestId'],
  categoryIndex: number,
  targetTestId: string,
): void {
  const overflowButton = getByTestId(`category-overflow-button-${categoryIndex}`);
  fireEvent.press(overflowButton);
  const button = getByTestId(targetTestId);
  fireEvent.press(button);
}

describe('MenuContentEditor - Category Reordering', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const threeCategories: MenuContents = {
    categories: [
      { name: 'First', items: [], displayOrder: 0 },
      { name: 'Second', items: [], displayOrder: 1 },
      { name: 'Third', items: [], displayOrder: 2 },
    ],
  };

  it('moves category down when down button is pressed', () => {
    const { getByTestId } = render(
      <MenuContentEditor contents={threeCategories} onChange={mockOnChange} />,
      { wrapper: createWrapper() },
    );

    openOverflowAndPress(getByTestId, 0, 'category-move-down-button-0');

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const result = mockOnChange.mock.calls[0][0] as MenuContents;
    expect(result.categories?.[0].name).toBe('Second');
    expect(result.categories?.[1].name).toBe('First');
    expect(result.categories?.[2].name).toBe('Third');
  });

  it('moves category up when up button is pressed', () => {
    const { getByTestId } = render(
      <MenuContentEditor contents={threeCategories} onChange={mockOnChange} />,
      { wrapper: createWrapper() },
    );

    openOverflowAndPress(getByTestId, 1, 'category-move-up-button-1');

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const result = mockOnChange.mock.calls[0][0] as MenuContents;
    expect(result.categories?.[0].name).toBe('Second');
    expect(result.categories?.[1].name).toBe('First');
    expect(result.categories?.[2].name).toBe('Third');
  });

  it('hides up button on first category overflow menu', () => {
    const { getByTestId, queryByTestId } = render(
      <MenuContentEditor contents={threeCategories} onChange={mockOnChange} />,
      { wrapper: createWrapper() },
    );

    const overflowButton = getByTestId('category-overflow-button-0');
    fireEvent.press(overflowButton);

    expect(queryByTestId('category-move-up-button-0')).toBeNull();
  });

  it('hides down button on last category overflow menu', () => {
    const { getByTestId, queryByTestId } = render(
      <MenuContentEditor contents={threeCategories} onChange={mockOnChange} />,
      { wrapper: createWrapper() },
    );

    const lastIndex = 2;
    const overflowButton = getByTestId(`category-overflow-button-${lastIndex}`);
    fireEvent.press(overflowButton);

    expect(queryByTestId(`category-move-down-button-${lastIndex}`)).toBeNull();
  });

  it('reassigns displayOrder after moving category', () => {
    const { getByTestId } = render(
      <MenuContentEditor contents={threeCategories} onChange={mockOnChange} />,
      { wrapper: createWrapper() },
    );

    openOverflowAndPress(getByTestId, 0, 'category-move-down-button-0');

    const result = mockOnChange.mock.calls[0][0] as MenuContents;
    expect(result.categories?.[0].displayOrder).toBe(0);
    expect(result.categories?.[1].displayOrder).toBe(1);
    expect(result.categories?.[2].displayOrder).toBe(2);
  });
});

describe('MenuContentEditor - Item Reordering', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const categoryWithItems: MenuContents = {
    categories: [
      {
        id: 'cat-1',
        name: 'Appetizers',
        displayOrder: 0,
        items: [
          { id: 'item-1', name: 'Soup', price: 5, displayOrder: 0, isAvailable: true },
          { id: 'item-2', name: 'Salad', price: 7, displayOrder: 1, isAvailable: true },
          { id: 'item-3', name: 'Bread', price: 3, displayOrder: 2, isAvailable: true },
        ],
      },
    ],
  };

  it('moves item down within a category', () => {
    const { getByTestId } = render(
      <MenuContentEditor contents={categoryWithItems} onChange={mockOnChange} />,
      { wrapper: createWrapper() },
    );

    const toggleButton = getByTestId('category-toggle-button-0');
    fireEvent.press(toggleButton);

    const moveDownButton = getByTestId('menu-item-move-down-button-0-0');
    fireEvent.press(moveDownButton);

    expect(mockOnChange).toHaveBeenCalled();
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0] as MenuContents;
    const items = lastCall.categories?.[0].items ?? [];
    expect(items[0].name).toBe('Salad');
    expect(items[1].name).toBe('Soup');
    expect(items[2].name).toBe('Bread');
  });

  it('moves item up within a category', () => {
    const { getByTestId } = render(
      <MenuContentEditor contents={categoryWithItems} onChange={mockOnChange} />,
      { wrapper: createWrapper() },
    );

    const toggleButton = getByTestId('category-toggle-button-0');
    fireEvent.press(toggleButton);

    const moveUpButton = getByTestId('menu-item-move-up-button-0-1');
    fireEvent.press(moveUpButton);

    expect(mockOnChange).toHaveBeenCalled();
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0] as MenuContents;
    const items = lastCall.categories?.[0].items ?? [];
    expect(items[0].name).toBe('Salad');
    expect(items[1].name).toBe('Soup');
    expect(items[2].name).toBe('Bread');
  });

  it('reassigns item displayOrder after reorder', () => {
    const { getByTestId } = render(
      <MenuContentEditor contents={categoryWithItems} onChange={mockOnChange} />,
      { wrapper: createWrapper() },
    );

    const toggleButton = getByTestId('category-toggle-button-0');
    fireEvent.press(toggleButton);

    const moveDownButton = getByTestId('menu-item-move-down-button-0-0');
    fireEvent.press(moveDownButton);

    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0] as MenuContents;
    const items = lastCall.categories?.[0].items ?? [];
    expect(items[0].displayOrder).toBe(0);
    expect(items[1].displayOrder).toBe(1);
    expect(items[2].displayOrder).toBe(2);
  });
});
