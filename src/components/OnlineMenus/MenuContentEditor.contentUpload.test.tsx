/**
 * Tests for MenuContentEditor - Content Upload Integration.
 */
import './MenuContentEditor.mocks';

import { fireEvent, render } from '@testing-library/react-native';

import MenuContentEditor from './MenuContentEditor';
import { createWrapper } from './testUtils';

import type { MenuContents } from '../../types/menuTypes';

describe('MenuContentEditor - Content Upload Integration', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    contents: null,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders image picker for category when expanded', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [],
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

    // Check that image picker is rendered
    expect(getByTestId('category-image-picker-0')).toBeTruthy();
  });

  it('renders video picker for category when expanded', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Appetizers',
          items: [],
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

    // Check that video picker is rendered
    expect(getByTestId('category-video-picker-0')).toBeTruthy();
  });

  it('renders content pickers for menu items when expanded', () => {
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

    const { getByTestId } = render(
      <MenuContentEditor {...defaultProps} contents={contents} />,
      { wrapper: createWrapper() },
    );

    // Expand category
    fireEvent.press(getByTestId('category-toggle-button-0'));

    // Check that content pickers are rendered for menu item
    expect(getByTestId('menu-item-image-picker-0-0')).toBeTruthy();
    expect(getByTestId('menu-item-video-picker-0-0')).toBeTruthy();
    expect(getByTestId('menu-item-document-picker-0-0')).toBeTruthy();
  });
});
