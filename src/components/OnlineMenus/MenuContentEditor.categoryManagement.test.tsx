/**
 * Tests for MenuContentEditor - Category Management functionality.
 */
import './MenuContentEditor.mocks';

import { fireEvent, render } from '@testing-library/react-native';

import MenuContentEditor from './MenuContentEditor';
import { createWrapper } from './testUtils';

import type { MenuContents } from '../../types/menuTypes';

describe('MenuContentEditor - Category Management', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    contents: null,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onChange with new category when add category is pressed', () => {
    const { getByText } = render(<MenuContentEditor {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    const addButton = getByText('Add Category');
    fireEvent.press(addButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      categories: [
        expect.objectContaining({
          name: 'Category',
          items: [],
          displayOrder: 0,
          imageContentId: null,
          videoContentId: null,
        }),
      ],
    });
    // Verify that the new category has an id field
    const calledWith = mockOnChange.mock.calls[0][0] as { categories: Array<{ id?: string }> };
    expect(calledWith.categories[0].id).toBeDefined();
    expect(calledWith.categories[0].id?.startsWith('cat_')).toBe(true);
  });

  it('calls onChange with updated category name', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [],
          displayOrder: 0,
        },
      ],
    };

    const { getByTestId, getByPlaceholderText } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    // Expand category first
    fireEvent.press(getByTestId('category-toggle-button-0'));

    // Now edit the category name
    const categoryInput = getByPlaceholderText('Category Name');
    fireEvent.changeText(categoryInput, 'Starters');

    expect(mockOnChange).toHaveBeenCalledWith({
      categories: [
        expect.objectContaining({
          name: 'Starters',
          items: [],
          displayOrder: 0,
        }),
      ],
    });
  });

  it('calls onChange to delete category', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [],
          displayOrder: 0,
        },
        {
          name: 'Main Course',
          items: [],
          displayOrder: 1,
        },
      ],
    };

    const { getByTestId } = render(<MenuContentEditor {...defaultProps} contents={contents} />, {
      wrapper: createWrapper(),
    });

    // Open overflow menu for first category, then press delete
    fireEvent.press(getByTestId('category-overflow-button-0'));
    fireEvent.press(getByTestId('category-delete-button-0'));

    expect(mockOnChange).toHaveBeenCalledWith({
      categories: [
        expect.objectContaining({
          name: 'Main Course',
          items: [],
          displayOrder: 1,
        }),
      ],
    });
  });
});
