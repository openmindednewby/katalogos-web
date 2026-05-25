/**
 * Unit tests for CategoryStylingSection component.
 * Tests focus on logic and callbacks, not rendering.
 */
import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import CategoryStylingSection from './CategoryStylingSection';
import { TestIds } from '../../shared/testIds';
import MediaFit from '../../types/enums/MediaFit';
import MediaPosition from '../../types/enums/MediaPosition';
import MediaSize from '../../types/enums/MediaSize';

import type { BoxStyling, MediaSettings } from '../../types/menuStyleTypes';

// =============================================================================
// Mocks
// =============================================================================

jest.mock('react-redux', () => ({ useSelector: () => 'light' }));

jest.mock('./Styling/components/BoxStyleEditor', () => {
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ value, onChange }: { value: BoxStyling; onChange: (v: BoxStyling) => void }) => (
      <View testID="mock-box-style-editor">
        <TouchableOpacity
          accessibilityRole="button"
          testID="mock-box-style-change-trigger"
          onPress={() => onChange({ ...value, borderWidth: 5 })}
        >
          <Text>Change</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

 
jest.mock('./Styling/components/MediaPositionEditor', () => {
  const { View, TouchableOpacity, Text } = require('react-native');
  const MOCK_POSITION_RIGHT = 'right';
  return {
    __esModule: true,
    default: ({ value, onChange }: { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) => (
      <View testID="mock-media-position-editor">
        <TouchableOpacity
          accessibilityRole="button"
          testID="mock-media-position-change-trigger"
          onPress={() => onChange({ ...value, position: MOCK_POSITION_RIGHT })}
        >
          <Text>Change</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

// =============================================================================
// Test Suite
// =============================================================================

describe('CategoryStylingSection', () => {
  const mockOnUpdateStyling = jest.fn();
  const mockOnUpdateImageSettings = jest.fn();
  const mockT = jest.fn((_key: string, fallback?: string) => fallback ?? _key);

  const defaultProps = {
    categoryIndex: 0,
    onUpdateStyling: mockOnUpdateStyling,
    onUpdateImageSettings: mockOnUpdateImageSettings,
    textColor: '#333333',
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
    t: mockT,
  };

  beforeEach(() => { jest.clearAllMocks(); });

  describe('toggle behavior', () => {
    it('starts collapsed and expands on press', () => {
      const { getByTestId, queryByTestId } = render(<CategoryStylingSection {...defaultProps} />);

      expect(queryByTestId(`${TestIds.CATEGORY_STYLING_CONTENT}-0`)).toBeNull();

      fireEvent.press(getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-0`));
      expect(queryByTestId(`${TestIds.CATEGORY_STYLING_CONTENT}-0`)).toBeTruthy();
    });

    it('collapses when toggle is pressed again', () => {
      const { getByTestId, queryByTestId } = render(<CategoryStylingSection {...defaultProps} />);
      const toggle = getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-0`);

      fireEvent.press(toggle);
      expect(queryByTestId(`${TestIds.CATEGORY_STYLING_CONTENT}-0`)).toBeTruthy();

      fireEvent.press(toggle);
      expect(queryByTestId(`${TestIds.CATEGORY_STYLING_CONTENT}-0`)).toBeNull();
    });

    it('shows correct accessibility state', () => {
      const { getByTestId } = render(<CategoryStylingSection {...defaultProps} />);
      const toggle = getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-0`);

      expect(toggle.props.accessibilityState?.expanded).toBe(false);
      fireEvent.press(toggle);
      expect(toggle.props.accessibilityState?.expanded).toBe(true);
    });
  });

  describe('styling change propagation', () => {
    it('calls onUpdateStyling when box style changes', () => {
      const { getByTestId } = render(<CategoryStylingSection {...defaultProps} />);
      fireEvent.press(getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-0`));
      fireEvent.press(getByTestId('mock-box-style-change-trigger'));

      expect(mockOnUpdateStyling).toHaveBeenCalledWith(expect.objectContaining({ borderWidth: 5 }));
    });

    it('preserves existing styling values on change', () => {
      const customStyling: BoxStyling = {
        borderWidth: 3, borderColor: '#FF0000', borderRadius: 12, padding: 8, shadowEnabled: true,
      };
      const { getByTestId } = render(<CategoryStylingSection {...defaultProps} styling={customStyling} />);

      fireEvent.press(getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-0`));
      fireEvent.press(getByTestId('mock-box-style-change-trigger'));

      expect(mockOnUpdateStyling).toHaveBeenCalledWith(expect.objectContaining({
        borderColor: '#FF0000', borderRadius: 12, padding: 8, shadowEnabled: true, borderWidth: 5,
      }));
    });
  });

  describe('image settings change propagation', () => {
    it('calls onUpdateImageSettings when media position changes', () => {
      const { getByTestId } = render(<CategoryStylingSection {...defaultProps} />);
      fireEvent.press(getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-0`));
      fireEvent.press(getByTestId('mock-media-position-change-trigger'));

      expect(mockOnUpdateImageSettings).toHaveBeenCalledWith(expect.objectContaining({ position: 'right' }));
    });

    it('preserves existing image settings on change', () => {
      const customSettings: MediaSettings = { position: MediaPosition.Top, size: MediaSize.Large, fit: MediaFit.Contain, borderRadius: 16 };
      const { getByTestId } = render(<CategoryStylingSection {...defaultProps} imageSettings={customSettings} />);

      fireEvent.press(getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-0`));
      fireEvent.press(getByTestId('mock-media-position-change-trigger'));

      expect(mockOnUpdateImageSettings).toHaveBeenCalledWith(expect.objectContaining({
        size: 'large', fit: 'contain', borderRadius: 16, position: 'right',
      }));
    });
  });

  describe('default values', () => {
    it('uses default styling when none provided', () => {
      const { getByTestId } = render(<CategoryStylingSection {...defaultProps} />);
      fireEvent.press(getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-0`));
      fireEvent.press(getByTestId('mock-box-style-change-trigger'));

      expect(mockOnUpdateStyling).toHaveBeenCalledWith(expect.objectContaining({
        borderWidth: 5, borderColor: '', borderRadius: 0, padding: 0, shadowEnabled: false,
      }));
    });

    it('uses default image settings when none provided', () => {
      const { getByTestId } = render(<CategoryStylingSection {...defaultProps} />);
      fireEvent.press(getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-0`));
      fireEvent.press(getByTestId('mock-media-position-change-trigger'));

      expect(mockOnUpdateImageSettings).toHaveBeenCalledWith(expect.objectContaining({
        position: 'right', size: 'medium', fit: 'cover', borderRadius: 0,
      }));
    });
  });

  describe('categoryIndex handling', () => {
    it('includes categoryIndex in test IDs', () => {
      const { getByTestId } = render(<CategoryStylingSection {...defaultProps} categoryIndex={3} />);

      expect(getByTestId(`${TestIds.CATEGORY_STYLING_SECTION}-3`)).toBeTruthy();
      expect(getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-3`)).toBeTruthy();

      fireEvent.press(getByTestId(`${TestIds.CATEGORY_STYLING_TOGGLE}-3`));
      expect(getByTestId(`${TestIds.CATEGORY_STYLING_CONTENT}-3`)).toBeTruthy();
    });
  });
});
