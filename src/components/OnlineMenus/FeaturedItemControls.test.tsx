/**
 * FeaturedItemControls Unit Tests
 *
 * Tests focus on logic and behavior, not rendering:
 * - Toggle expansion state
 * - Featured toggle calls onUpdate with correct value
 * - Staff note character limit enforcement
 * - Featured order parsing and defaults
 */
import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import FeaturedItemControls from './FeaturedItemControls';
import { TestIds } from '../../shared/testIds';

import type { MenuItem } from '../../types/menuTypes';

// =============================================================================
// Mocks
// =============================================================================

jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => 'light'),
}));

// =============================================================================
// Test Data
// =============================================================================

const STAFF_NOTE_MAX_LENGTH = 120;

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

describe('FeaturedItemControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Expansion Toggle', () => {
    it('starts collapsed by default', () => {
      const { queryByTestId } = render(<FeaturedItemControls {...defaultProps} />);

      expect(queryByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-content`)).toBeNull();
    });

    it('expands when header is pressed', () => {
      const { getByTestId, queryByTestId } = render(<FeaturedItemControls {...defaultProps} />);

      expect(queryByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-content`)).toBeNull();

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));

      expect(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-content`)).toBeTruthy();
    });

    it('collapses when header is pressed again', () => {
      const { getByTestId, queryByTestId } = render(<FeaturedItemControls {...defaultProps} />);

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));
      expect(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-content`)).toBeTruthy();

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));
      expect(queryByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-content`)).toBeNull();
    });
  });

  describe('Featured Toggle', () => {
    it('calls onUpdate with isFeatured true when toggled on', () => {
      const onUpdate = jest.fn();
      const { getByTestId } = render(
        <FeaturedItemControls {...defaultProps} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));
      fireEvent(getByTestId(TestIds.FEATURED_ITEM_CONTROLS_TOGGLE), 'valueChange', true);

      expect(onUpdate).toHaveBeenCalledWith({ isFeatured: true });
    });

    it('calls onUpdate with isFeatured false when toggled off', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({ isFeatured: true });
      const { getByTestId } = render(
        <FeaturedItemControls {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));
      fireEvent(getByTestId(TestIds.FEATURED_ITEM_CONTROLS_TOGGLE), 'valueChange', false);

      expect(onUpdate).toHaveBeenCalledWith({ isFeatured: false });
    });
  });

  describe('Staff Note', () => {
    it('calls onUpdate with staffNote when text changes', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({ isFeatured: true });
      const { getByTestId } = render(
        <FeaturedItemControls {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));
      fireEvent.changeText(getByTestId(TestIds.FEATURED_ITEM_CONTROLS_NOTE_INPUT), 'Great dish!');

      expect(onUpdate).toHaveBeenCalledWith({ staffNote: 'Great dish!' });
    });

    it('truncates staff note to max length', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({ isFeatured: true });
      const { getByTestId } = render(
        <FeaturedItemControls {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));
      const longText = 'a'.repeat(STAFF_NOTE_MAX_LENGTH + 50);
      fireEvent.changeText(getByTestId(TestIds.FEATURED_ITEM_CONTROLS_NOTE_INPUT), longText);

      const call = onUpdate.mock.calls[0][0] as { staffNote: string };
      expect(call.staffNote).toHaveLength(STAFF_NOTE_MAX_LENGTH);
    });

    it('sets staffNote to null when text is empty', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({ isFeatured: true, staffNote: 'Old note' });
      const { getByTestId } = render(
        <FeaturedItemControls {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));
      fireEvent.changeText(getByTestId(TestIds.FEATURED_ITEM_CONTROLS_NOTE_INPUT), '');

      expect(onUpdate).toHaveBeenCalledWith({ staffNote: null });
    });

    it('does not show staff note input when item is not featured', () => {
      const item = createMockItem({ isFeatured: false });
      const { getByTestId, queryByTestId } = render(
        <FeaturedItemControls {...defaultProps} item={item} />
      );

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));

      expect(queryByTestId(TestIds.FEATURED_ITEM_CONTROLS_NOTE_INPUT)).toBeNull();
    });
  });

  describe('Featured Order', () => {
    it('defaults to 0 when not set', () => {
      const item = createMockItem({ isFeatured: true });
      const { getByTestId } = render(
        <FeaturedItemControls {...defaultProps} item={item} />
      );

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));

      const input = getByTestId(TestIds.FEATURED_ITEM_CONTROLS_ORDER_INPUT);
      expect(input.props.defaultValue).toBe('0');
    });

    it('calls onUpdate with parsed integer on end editing', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({ isFeatured: true });
      const { getByTestId } = render(
        <FeaturedItemControls {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));
      fireEvent(
        getByTestId(TestIds.FEATURED_ITEM_CONTROLS_ORDER_INPUT),
        'endEditing',
        { nativeEvent: { text: '5' } },
      );

      expect(onUpdate).toHaveBeenCalledWith({ featuredOrder: 5 });
    });

    it('falls back to 0 for non-numeric input', () => {
      const onUpdate = jest.fn();
      const item = createMockItem({ isFeatured: true });
      const { getByTestId } = render(
        <FeaturedItemControls {...defaultProps} item={item} onUpdate={onUpdate} />
      );

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));
      fireEvent(
        getByTestId(TestIds.FEATURED_ITEM_CONTROLS_ORDER_INPUT),
        'endEditing',
        { nativeEvent: { text: 'abc' } },
      );

      expect(onUpdate).toHaveBeenCalledWith({ featuredOrder: 0 });
    });

    it('does not show order input when item is not featured', () => {
      const item = createMockItem({ isFeatured: false });
      const { getByTestId, queryByTestId } = render(
        <FeaturedItemControls {...defaultProps} item={item} />
      );

      fireEvent.press(getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`));

      expect(queryByTestId(TestIds.FEATURED_ITEM_CONTROLS_ORDER_INPUT)).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has accessible header with correct state', () => {
      const { getByTestId } = render(<FeaturedItemControls {...defaultProps} />);

      const header = getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`);
      expect(header.props.accessibilityRole).toBe('button');
      expect(header.props.accessibilityState).toEqual({ expanded: false });
    });

    it('updates accessibility state when expanded', () => {
      const { getByTestId } = render(<FeaturedItemControls {...defaultProps} />);

      const header = getByTestId(`${TestIds.FEATURED_ITEM_CONTROLS}-header`);
      fireEvent.press(header);

      expect(header.props.accessibilityState).toEqual({ expanded: true });
    });
  });
});
