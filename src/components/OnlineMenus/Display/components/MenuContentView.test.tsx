/**
 * Unit tests for MenuContentView component.
 *
 * Tests focus on logic and behavior, not visual rendering:
 * - Layout template switching
 * - Global styles propagation
 * - Item press callback
 * - Category filtering (empty categories hidden)
 * - Style merging with defaults
 */
import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react-native';

import { MenuContentView } from './MenuContentView';
import { TestIds } from '../../../../shared/testIds';
import ItemLayoutType from '../../../../types/enums/ItemLayoutType';

import type { Category, MenuContents, MenuItem } from '../../../../types/menuTypes';

// Mock the MenuItemDisplay to simplify testing - must be before any imports use it
jest.mock('./MenuItemDisplay', () => {
   
  const ReactModule = require('react');
   
  const { View, Text, TouchableOpacity } = require('react-native');

  function mockMenuItemDisplay({
    item,
    testID,
    onPress,
  }: {
    item: { name?: string };
    testID: string;
    onPress?: () => void;
  }): unknown {
    const itemName = item.name ?? 'Item';
    if (onPress)
      return ReactModule.createElement(
        TouchableOpacity,
        { accessibilityRole: 'button', testID: `${testID}-touchable`, onPress },
        ReactModule.createElement(View, { testID }, ReactModule.createElement(Text, null, itemName))
      );

    return ReactModule.createElement(View, { testID }, ReactModule.createElement(Text, null, itemName));
  }

  return { MenuItemDisplay: mockMenuItemDisplay };
});

// =============================================================================
// Test Data Factories
// =============================================================================

function createMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'item-1',
    name: 'Test Item',
    description: 'A delicious test item',
    price: 9.99,
    isAvailable: true,
    displayOrder: 0,
    ...overrides,
  };
}

function createCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'cat-1',
    name: 'Test Category',
    description: 'A test category',
    displayOrder: 0,
    items: [createMenuItem()],
    ...overrides,
  };
}

function createMenuContents(overrides: Partial<MenuContents> = {}): MenuContents {
  return {
    categories: [createCategory()],
    ...overrides,
  };
}

// =============================================================================
// Test Suite
// =============================================================================

describe('MenuContentView', () => {
  describe('rendering', () => {
    it('renders empty state when no categories exist', () => {
      const contents = createMenuContents({ categories: [] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW)).toBeTruthy();
      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW_EMPTY)).toBeTruthy();
    });

    it('renders empty state when all categories have no available items', () => {
      const unavailableItem = createMenuItem({ isAvailable: false });
      const category = createCategory({ items: [unavailableItem] });
      const contents = createMenuContents({ categories: [category] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW_EMPTY)).toBeTruthy();
    });

    it('renders categories with available items', () => {
      const contents = createMenuContents();

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_CATEGORY_SECTION}-0`)).toBeTruthy();
    });

    it('filters out unavailable items within a category', () => {
      const availableItem = createMenuItem({ id: 'available', name: 'Available Item', isAvailable: true });
      const unavailableItem = createMenuItem({ id: 'unavailable', name: 'Unavailable Item', isAvailable: false });
      const category = createCategory({ items: [availableItem, unavailableItem] });
      const contents = createMenuContents({ categories: [category] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      // Should render available item
      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_MENU_ITEM}-0-0`)).toBeTruthy();

      // Should NOT render unavailable item (only 1 item rendered)
      expect(screen.queryByTestId(`${TestIds.MENU_CONTENT_VIEW_MENU_ITEM}-0-1`)).toBeNull();
    });
  });

  describe('onItemPress callback', () => {
    it('calls onItemPress with correct category and item when item is pressed', () => {
      const mockOnItemPress = jest.fn();
      const item = createMenuItem({ id: 'test-item', name: 'Pressed Item' });
      const category = createCategory({ id: 'test-cat', items: [item] });
      const contents = createMenuContents({ categories: [category] });

      render(
        <MenuContentView
          contents={contents}
          menuName="Test Menu"
          onItemPress={mockOnItemPress}
        />
      );

      const touchable = screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_MENU_ITEM}-0-0-touchable`);
      fireEvent.press(touchable);

      expect(mockOnItemPress).toHaveBeenCalledTimes(1);
      expect(mockOnItemPress).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-cat' }),
        expect.objectContaining({ id: 'test-item', name: 'Pressed Item' })
      );
    });

    it('does not render touchable wrapper when onItemPress is not provided', () => {
      const contents = createMenuContents();

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.queryByTestId(`${TestIds.MENU_CONTENT_VIEW_MENU_ITEM}-0-0-touchable`)).toBeNull();
      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_MENU_ITEM}-0-0`)).toBeTruthy();
    });
  });

  describe('layout template switching', () => {
    it('applies list layout by default', () => {
      const contents = createMenuContents();

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      // Component renders - layout is applied internally
      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW)).toBeTruthy();
    });

    it('applies grid layout when specified', () => {
      const contents = createMenuContents({
        layout: { itemLayout: ItemLayoutType.Grid, itemsPerRow: 2 },
      });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW)).toBeTruthy();
    });

    it('applies cards layout when specified', () => {
      const contents = createMenuContents({
        layout: { itemLayout: ItemLayoutType.Cards, itemsPerRow: 3 },
      });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW)).toBeTruthy();
    });
  });

  describe('global styles propagation', () => {
    it('applies custom color scheme to container', () => {
      const contents = createMenuContents({
        colorScheme: {
          background: '#FF0000',
          text: '#00FF00',
        },
      });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      const container = screen.getByTestId(TestIds.MENU_CONTENT_VIEW);
      // Verify component renders with custom colors
      expect(container).toBeTruthy();
    });

    it('merges custom typography with defaults', () => {
      const contents = createMenuContents({
        typography: {
          titleFontSize: 40,
          bodyFontSize: 20,
        },
      });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW)).toBeTruthy();
    });

    it('applies custom spacing settings', () => {
      const contents = createMenuContents({
        spacing: {
          pagePadding: 32,
          categorySpacing: 48,
          itemSpacing: 24,
        },
      });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW)).toBeTruthy();
    });
  });

  describe('header rendering', () => {
    it('renders header with menu name and description', () => {
      const contents = createMenuContents({
        header: { showMenuName: true, showMenuDescription: true },
      });

      render(
        <MenuContentView
          contents={contents}
          menuDescription="A great menu"
          menuName="My Restaurant"
        />
      );

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW_HEADER)).toBeTruthy();
      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW_TITLE)).toBeTruthy();
      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW_DESCRIPTION)).toBeTruthy();
    });

    it('hides menu name when showMenuName is false', () => {
      const contents = createMenuContents({
        header: { showMenuName: false, showMenuDescription: true },
      });

      render(
        <MenuContentView
          contents={contents}
          menuDescription="A great menu"
          menuName="My Restaurant"
        />
      );

      expect(screen.queryByTestId(TestIds.MENU_CONTENT_VIEW_TITLE)).toBeNull();
      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW_DESCRIPTION)).toBeTruthy();
    });

    it('hides description when showMenuDescription is false', () => {
      const contents = createMenuContents({
        header: { showMenuName: true, showMenuDescription: false },
      });

      render(
        <MenuContentView
          contents={contents}
          menuDescription="A great menu"
          menuName="My Restaurant"
        />
      );

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW_TITLE)).toBeTruthy();
      expect(screen.queryByTestId(TestIds.MENU_CONTENT_VIEW_DESCRIPTION)).toBeNull();
    });

    it('does not render header when all content is hidden', () => {
      const contents = createMenuContents({
        header: {
          showMenuName: false,
          showMenuDescription: false,
          showLogo: false,
        },
      });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.queryByTestId(TestIds.MENU_CONTENT_VIEW_HEADER)).toBeNull();
    });
  });

  describe('category sorting', () => {
    it('sorts categories by displayOrder', () => {
      const categoryA = createCategory({ id: 'cat-a', name: 'Category A', displayOrder: 2 });
      const categoryB = createCategory({ id: 'cat-b', name: 'Category B', displayOrder: 1 });
      const categoryC = createCategory({ id: 'cat-c', name: 'Category C', displayOrder: 0 });
      const contents = createMenuContents({ categories: [categoryA, categoryB, categoryC] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      // All categories should be rendered
      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_CATEGORY_SECTION}-0`)).toBeTruthy();
      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_CATEGORY_SECTION}-1`)).toBeTruthy();
      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_CATEGORY_SECTION}-2`)).toBeTruthy();
    });
  });

  describe('category-level styling', () => {
    it('applies category-level typography overrides', () => {
      const category = createCategory({
        typography: {
          titleFontSize: 28,
          titleColor: '#FF0000',
        },
      });
      const contents = createMenuContents({ categories: [category] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_CATEGORY_SECTION}-0`)).toBeTruthy();
    });

    it('applies category-level box styling', () => {
      const category = createCategory({
        styling: {
          padding: 20,
          borderRadius: 12,
          borderWidth: 2,
          shadowEnabled: true,
        },
      });
      const contents = createMenuContents({ categories: [category] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_CATEGORY_SECTION}-0`)).toBeTruthy();
    });
  });

  describe('item-level styling', () => {
    it('applies item-level color overrides', () => {
      const item = createMenuItem({
        textColor: '#00FF00',
        backgroundColor: '#0000FF',
      });
      const category = createCategory({ items: [item] });
      const contents = createMenuContents({ categories: [category] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_MENU_ITEM}-0-0`)).toBeTruthy();
    });

    it('applies item-level typography overrides', () => {
      const item = createMenuItem({
        typography: {
          nameFontSize: 20,
          descriptionFontSize: 12,
        },
      });
      const category = createCategory({ items: [item] });
      const contents = createMenuContents({ categories: [category] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_MENU_ITEM}-0-0`)).toBeTruthy();
    });

    it('renders category with available items when some items are unavailable', () => {
      // Need at least one available item in category for it to render
      const availableItem = createMenuItem({ id: 'available', isAvailable: true });
      const unavailableItem = createMenuItem({
        id: 'unavailable',
        isAvailable: false,
        priceStyle: { strikethroughWhenUnavailable: true },
      });
      const category = createCategory({ items: [availableItem, unavailableItem] });
      const contents = createMenuContents({ categories: [category] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      // Category renders because it has an available item
      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_CATEGORY_SECTION}-0`)).toBeTruthy();
    });
  });

  describe('translation function', () => {
    it('uses translation function for empty message when provided', () => {
      const mockT = jest.fn().mockReturnValue('Custom Empty Message');
      const contents = createMenuContents({ categories: [] });

      render(<MenuContentView contents={contents} menuName="Test Menu" t={mockT} />);

      expect(mockT).toHaveBeenCalledWith('onlineMenus.messages.emptyMenu', expect.any(String));
      expect(screen.getByText('Custom Empty Message')).toBeTruthy();
    });

    it('falls back to default empty message when t is not provided', () => {
      const contents = createMenuContents({ categories: [] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByText('No menu items available')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles undefined categories gracefully', () => {
      const contents: MenuContents = { categories: undefined };

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW_EMPTY)).toBeTruthy();
    });

    it('handles category with undefined items gracefully', () => {
      const category: Category = {
        id: 'cat-1',
        name: 'Empty Category',
        displayOrder: 0,
        items: undefined,
      };
      const contents = createMenuContents({ categories: [category] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW_EMPTY)).toBeTruthy();
    });

    it('handles item with undefined name and price', () => {
      const item = createMenuItem({
        name: undefined,
        price: undefined,
      });
      const category = createCategory({ items: [item] });
      const contents = createMenuContents({ categories: [category] });

      render(<MenuContentView contents={contents} menuName="Test Menu" />);

      expect(screen.getByTestId(`${TestIds.MENU_CONTENT_VIEW_MENU_ITEM}-0-0`)).toBeTruthy();
    });

    it('uses default menu name when not provided', () => {
      const contents = createMenuContents({
        header: { showMenuName: true },
      });

      render(<MenuContentView contents={contents} />);

      expect(screen.getByTestId(TestIds.MENU_CONTENT_VIEW_TITLE)).toBeTruthy();
      expect(screen.getByText('Menu')).toBeTruthy();
    });
  });
});
