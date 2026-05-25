/**
 * ItemStylingSection Unit Tests
 *
 * Tests focus on logic and behavior, not rendering:
 * - Toggle expansion state
 * - Styling changes propagate through callbacks
 * - Default values are used when item has no styling
 */
import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import ItemStylingSection from './ItemStylingSection';
import { TestIds } from '../../shared/testIds';
import CurrencyPosition from '../../types/enums/CurrencyPosition';
import FontWeight from '../../types/enums/FontWeight';
import MediaFit from '../../types/enums/MediaFit';
import MediaPosition from '../../types/enums/MediaPosition';
import MediaSize from '../../types/enums/MediaSize';

import type { MenuItem } from '../../types/menuTypes';

// =============================================================================
// Mocks
// =============================================================================

jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => 'light'),
}));

jest.mock('./Styling/components/BoxStyleEditor', () => {
  const { View, Text } = require('react-native');
  const MockBoxStyleEditor = ({ onChange, value, label }: {
    onChange: (value: unknown) => void;
    value: unknown;
    label?: string;
  }): React.ReactElement => (
    <View testID="mock-box-style-editor">
      <Text>{label}</Text>
      <Text
        testID="box-style-trigger"
        onPress={() => onChange({ ...value as object, padding: 10 })}
      >
        Trigger Box Change
      </Text>
    </View>
  );
  return MockBoxStyleEditor;
});

jest.mock('./Styling/components/MediaPositionEditor', () => {
  const { View, Text } = require('react-native');
  const MockMediaPositionEditor = ({ onChange, value }: {
    onChange: (value: unknown) => void;
    value: unknown;
  }): React.ReactElement => (
    <View testID="mock-media-position-editor">
      <Text
        testID="media-position-trigger"
        onPress={() => onChange({ ...value as object, position: 'right' })}
      >
        Trigger Media Change
      </Text>
    </View>
  );
  return MockMediaPositionEditor;
});

jest.mock('./Styling/components/PriceStyleEditor', () => {
  const { View, Text } = require('react-native');
  const MockPriceStyleEditor = ({ onChange, value }: {
    onChange: (value: unknown) => void;
    value: unknown;
  }): React.ReactElement => (
    <View testID="mock-price-style-editor">
      <Text
        testID="price-style-trigger"
        onPress={() => onChange({ ...value as object, fontSize: 20 })}
      >
        Trigger Price Change
      </Text>
    </View>
  );
  return MockPriceStyleEditor;
});

// =============================================================================
// Test Data
// =============================================================================

const createMockItem = (overrides?: Partial<MenuItem>): MenuItem => ({
  id: 'item-1',
  name: 'Test Item',
  price: 10.99,
  isAvailable: true,
  displayOrder: 0,
  ...overrides,
});

const defaultProps = {
  item: createMockItem(),
  onUpdate: jest.fn(),
  borderColor: '#ccc',
  textColor: '#000',
  surfaceColor: '#fff',
};

// =============================================================================
// Tests
// =============================================================================

describe('ItemStylingSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Expansion Toggle', () => {
    it('starts collapsed by default', () => {
      const { queryByTestId } = render(<ItemStylingSection {...defaultProps} />);

      expect(queryByTestId(TestIds.ITEM_STYLING_CONTENT)).toBeNull();
    });

    it('expands when header is pressed', () => {
      const { getByTestId, queryByTestId } = render(<ItemStylingSection {...defaultProps} />);

      // Initially collapsed
      expect(queryByTestId(TestIds.ITEM_STYLING_CONTENT)).toBeNull();

      // Press header to expand
      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));

      // Now expanded
      expect(getByTestId(TestIds.ITEM_STYLING_CONTENT)).toBeTruthy();
    });

    it('collapses when header is pressed again', () => {
      const { getByTestId, queryByTestId } = render(<ItemStylingSection {...defaultProps} />);

      // Expand
      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));
      expect(getByTestId(TestIds.ITEM_STYLING_CONTENT)).toBeTruthy();

      // Collapse
      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));
      expect(queryByTestId(TestIds.ITEM_STYLING_CONTENT)).toBeNull();
    });
  });

  describe('Box Style Changes', () => {
    it('calls onUpdate with styling when box style changes', () => {
      const onUpdate = jest.fn();
      const { getByTestId } = render(
        <ItemStylingSection {...defaultProps} onUpdate={onUpdate} />
      );

      // Expand section
      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));

      // Trigger box style change
      fireEvent.press(getByTestId('box-style-trigger'));

      expect(onUpdate).toHaveBeenCalledWith({
        styling: expect.objectContaining({ padding: 10 }),
      });
    });

    it('preserves existing styling values when updating', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({
        styling: {
          borderWidth: 2,
          borderColor: '#000',
          borderRadius: 8,
          padding: 5,
          shadowEnabled: true,
        },
      });

      const { getByTestId } = render(
        <ItemStylingSection {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));
      fireEvent.press(getByTestId('box-style-trigger'));

      expect(onUpdate).toHaveBeenCalledWith({
        styling: expect.objectContaining({
          borderWidth: 2,
          borderColor: '#000',
          borderRadius: 8,
          padding: 10, // Changed value
          shadowEnabled: true,
        }),
      });
    });
  });

  describe('Media Settings Changes', () => {
    it('calls onUpdate with imageSettings when media settings change', () => {
      const onUpdate = jest.fn();
      const { getByTestId } = render(
        <ItemStylingSection {...defaultProps} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));
      fireEvent.press(getByTestId('media-position-trigger'));

      expect(onUpdate).toHaveBeenCalledWith({
        imageSettings: expect.objectContaining({ position: 'right' }),
      });
    });

    it('preserves existing image settings when updating', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({
        imageSettings: {
          position: MediaPosition.Left,
          size: MediaSize.Large,
          fit: MediaFit.Contain,
          borderRadius: 12,
        },
      });

      const { getByTestId } = render(
        <ItemStylingSection {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));
      fireEvent.press(getByTestId('media-position-trigger'));

      expect(onUpdate).toHaveBeenCalledWith({
        imageSettings: expect.objectContaining({
          position: 'right', // Changed value
          size: 'large',
          fit: 'contain',
          borderRadius: 12,
        }),
      });
    });
  });

  describe('Price Style Changes', () => {
    it('calls onUpdate with priceStyle when price style changes', () => {
      const onUpdate = jest.fn();
      const { getByTestId } = render(
        <ItemStylingSection {...defaultProps} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));
      fireEvent.press(getByTestId('price-style-trigger'));

      expect(onUpdate).toHaveBeenCalledWith({
        priceStyle: expect.objectContaining({ fontSize: 20 }),
      });
    });

    it('preserves existing price style when updating', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({
        priceStyle: {
          fontSize: 16,
          fontWeight: FontWeight.Bold,
          color: '#ff0000',
          showCurrency: true,
          currencyPosition: CurrencyPosition.Before,
          strikethroughWhenUnavailable: false,
        },
      });

      const { getByTestId } = render(
        <ItemStylingSection {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));
      fireEvent.press(getByTestId('price-style-trigger'));

      expect(onUpdate).toHaveBeenCalledWith({
        priceStyle: expect.objectContaining({
          fontSize: 20, // Changed value
          fontWeight: 'bold',
          color: '#ff0000',
          showCurrency: true,
          currencyPosition: 'before',
          strikethroughWhenUnavailable: false,
        }),
      });
    });
  });

  describe('Default Values', () => {
    it('uses default box styling when item has none', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({ styling: undefined });

      const { getByTestId } = render(
        <ItemStylingSection {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));
      fireEvent.press(getByTestId('box-style-trigger'));

      // Should use defaults and apply the change
      expect(onUpdate).toHaveBeenCalledWith({
        styling: expect.objectContaining({ padding: 10 }),
      });
    });

    it('uses default media settings when item has none', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({ imageSettings: undefined });

      const { getByTestId } = render(
        <ItemStylingSection {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));
      fireEvent.press(getByTestId('media-position-trigger'));

      expect(onUpdate).toHaveBeenCalledWith({
        imageSettings: expect.objectContaining({ position: 'right' }),
      });
    });

    it('uses default price style when item has none', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({ priceStyle: undefined });

      const { getByTestId } = render(
        <ItemStylingSection {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(TestIds.ITEM_STYLING_HEADER));
      fireEvent.press(getByTestId('price-style-trigger'));

      expect(onUpdate).toHaveBeenCalledWith({
        priceStyle: expect.objectContaining({ fontSize: 20 }),
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible header with correct state', () => {
      const { getByTestId } = render(<ItemStylingSection {...defaultProps} />);

      const header = getByTestId(TestIds.ITEM_STYLING_HEADER);
      expect(header.props.accessibilityRole).toBe('button');
      expect(header.props.accessibilityState).toEqual({ expanded: false });
    });

    it('updates accessibility state when expanded', () => {
      const { getByTestId } = render(<ItemStylingSection {...defaultProps} />);

      const header = getByTestId(TestIds.ITEM_STYLING_HEADER);
      fireEvent.press(header);

      expect(header.props.accessibilityState).toEqual({ expanded: true });
    });
  });
});
