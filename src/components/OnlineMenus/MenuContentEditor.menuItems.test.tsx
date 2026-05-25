/**
 * Tests for MenuContentEditor - Menu Item Management functionality.
 */
import './MenuContentEditor.mocks';

import { fireEvent, render } from '@testing-library/react-native';

import MenuContentEditor from './MenuContentEditor';
import { createWrapper } from './testUtils';

import type { MenuContents } from '../../types/menuTypes';

describe('MenuContentEditor - Menu Item Management', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    contents: null,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onChange with new item when add item is pressed', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [],
          displayOrder: 0,
        },
      ],
    };

    const { getByText, getByTestId } = render(<MenuContentEditor {...defaultProps} contents={contents} />, {
      wrapper: createWrapper(),
    });

    // Expand category
    fireEvent.press(getByTestId('category-toggle-button-0'));

    // Add item
    const addItemButton = getByText('Add Item');
    fireEvent.press(addItemButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      categories: [
        expect.objectContaining({
          name: 'Appetizers',
          items: [
            expect.objectContaining({
              name: 'Item',
              price: 0,
              isAvailable: true,
              displayOrder: 0,
              imageContentId: null,
              videoContentId: null,
              documentContentIds: [],
            }),
          ],
          displayOrder: 0,
        }),
      ],
    });
    // Verify that the new item has an id field
    const calledWith = mockOnChange.mock.calls[0][0] as {
      categories: Array<{ items: Array<{ id?: string }> }>;
    };
    expect(calledWith.categories[0].items[0].id).toBeDefined();
    expect(calledWith.categories[0].items[0].id?.startsWith('item_')).toBe(true);
  });

  it('calls onChange when item price is updated', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [
            {
              name: 'Bruschetta',
              price: 8.5,
              isAvailable: true,
              displayOrder: 0,
            },
          ],
          displayOrder: 0,
        },
      ],
    };

    const { getByTestId, getByDisplayValue } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    // Expand category
    fireEvent.press(getByTestId('category-toggle-button-0'));

    // Update price
    const priceInput = getByDisplayValue('8.5');
    fireEvent.changeText(priceInput, '12.99');

    expect(mockOnChange).toHaveBeenCalledWith({
      categories: [
        expect.objectContaining({
          name: 'Appetizers',
          items: [
            expect.objectContaining({
              name: 'Bruschetta',
              price: 12.99,
              isAvailable: true,
            }),
          ],
        }),
      ],
    });
  });

  it('calls onChange to toggle item availability', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [
            {
              name: 'Bruschetta',
              price: 8.5,
              isAvailable: true,
              displayOrder: 0,
            },
          ],
          displayOrder: 0,
        },
      ],
    };

    const { getByText, getByTestId } = render(<MenuContentEditor {...defaultProps} contents={contents} />, {
      wrapper: createWrapper(),
    });

    // Expand category
    fireEvent.press(getByTestId('category-toggle-button-0'));

    // Toggle availability
    const availableButton = getByText('Available');
    fireEvent.press(availableButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      categories: [
        expect.objectContaining({
          name: 'Appetizers',
          items: [
            expect.objectContaining({
              name: 'Bruschetta',
              price: 8.5,
              isAvailable: false,
            }),
          ],
        }),
      ],
    });
  });

  it('calls onChange to delete item', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [
            {
              name: 'Bruschetta',
              price: 8.5,
              isAvailable: true,
              displayOrder: 0,
            },
            {
              name: 'Salad',
              price: 6.0,
              isAvailable: true,
              displayOrder: 1,
            },
          ],
          displayOrder: 0,
        },
      ],
    };

    const { getByTestId } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    // Expand category
    fireEvent.press(getByTestId('category-toggle-button-0'));

    // Delete first item (Bruschetta) via testID
    fireEvent.press(getByTestId('menu-item-delete-button-0-0'));

    expect(mockOnChange).toHaveBeenCalledWith({
      categories: [
        expect.objectContaining({
          name: 'Appetizers',
          items: [
            expect.objectContaining({
              name: 'Salad',
              price: 6.0,
              isAvailable: true,
            }),
          ],
        }),
      ],
    });
  });
});
