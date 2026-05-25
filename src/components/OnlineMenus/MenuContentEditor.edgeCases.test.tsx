/**
 * Tests for MenuContentEditor - Edge Cases.
 */
import './MenuContentEditor.mocks';

import { fireEvent, render } from '@testing-library/react-native';

import MenuContentEditor from './MenuContentEditor';
import { createWrapper } from './testUtils';

import type { MenuContents } from '../../types/menuTypes';

describe('MenuContentEditor - Edge Cases', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    contents: null,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles null description correctly', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          description: null,
          items: [],
          displayOrder: 0,
        },
      ],
    };

    const { getByTestId, getByPlaceholderText } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    // Expand category
    fireEvent.press(getByTestId('category-toggle-button-0'));

    // Description input should exist and be empty
    const descInput = getByPlaceholderText('Category Description (optional)');
    expect(descInput.props.value).toBe('');
  });

  it('handles empty categories array', () => {
    const contents: MenuContents = {
      categories: [],
    };

    const { getByText } = render(<MenuContentEditor {...defaultProps} contents={contents} />, {
      wrapper: createWrapper(),
    });

    expect(getByText('Add Category')).toBeTruthy();
  });

  it('does not crash with invalid price input', () => {
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

    // Try invalid price
    const priceInput = getByDisplayValue('8.5');
    fireEvent.changeText(priceInput, 'invalid');

    // Should not call onChange with invalid price
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
