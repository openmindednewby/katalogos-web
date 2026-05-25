/**
 * Tests for MenuContentEditor - Decimal Price Input.
 */
import './MenuContentEditor.mocks';

import { fireEvent, render } from '@testing-library/react-native';

import MenuContentEditor from './MenuContentEditor';
import { createWrapper } from './testUtils';

import type { MenuContents } from '../../types/menuTypes';

describe('MenuContentEditor - Decimal Price Input', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    contents: null,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows typing decimal numbers like 0.5', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [
            {
              name: 'Bruschetta',
              price: 0,
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

    // Type decimal number
    const priceInput = getByDisplayValue('0');
    fireEvent.changeText(priceInput, '0.5');

    expect(mockOnChange).toHaveBeenCalledWith({
      categories: [
        expect.objectContaining({
          name: 'Appetizers',
          items: [
            expect.objectContaining({
              name: 'Bruschetta',
              price: 0.5,
              isAvailable: true,
            }),
          ],
        }),
      ],
    });
  });

  it('allows typing multi-decimal prices like 12.99', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [
            {
              name: 'Bruschetta',
              price: 0,
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

    // Type decimal number
    const priceInput = getByDisplayValue('0');
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

  it('does not update price for intermediate states like a single decimal point', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [
            {
              name: 'Bruschetta',
              price: 5,
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

    // Type just a decimal point
    const priceInput = getByDisplayValue('5');
    fireEvent.changeText(priceInput, '.');

    // Should not call onChange for just a decimal point
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('rejects non-numeric characters in price input', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [
            {
              name: 'Bruschetta',
              price: 5,
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

    // Try typing letters
    const priceInput = getByDisplayValue('5');
    fireEvent.changeText(priceInput, '5abc');

    // Should not update with invalid characters
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
