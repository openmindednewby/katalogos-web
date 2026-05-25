import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import GlobalStylingTab, { TAB_BUTTONS, TAB_COLORS, TAB_HEADER, TAB_LAYOUT, TAB_MEDIA, TAB_SPACING, TAB_TYPOGRAPHY } from './GlobalStylingTab';
import LayoutTemplate from '../../../../types/enums/LayoutTemplate';

import type { MenuContents } from '../../../../types/menuTypes';

// =============================================================================
// Mocks
// =============================================================================

jest.mock('react-redux', () => ({ useSelector: () => 'light' }));

jest.mock('./CollapsibleSection', () => {
  const R = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: { testId: string; isExpanded: boolean; onToggle: () => void; disabled?: boolean; children: React.ReactNode }) =>
      R.createElement(RN.View, { testID: props.testId },
        R.createElement(RN.TouchableOpacity, { testID: `${props.testId}-header`, onPress: props.onToggle, disabled: props.disabled, accessibilityRole: 'button', accessibilityState: { expanded: props.isExpanded } }),
        props.isExpanded ? R.createElement(RN.View, { testID: `${props.testId}-content` }, props.children) : null),
  };
});

jest.mock('./LayoutTemplateSelector', () => {
  const R = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return { __esModule: true, default: () => R.createElement(RN.View, { testID: 'layout-template-selector' }) };
});

jest.mock('./ColorSchemeEditor', () => {
  const R = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return { __esModule: true, default: () => R.createElement(RN.View, { testID: 'color-scheme-editor' }) };
});

jest.mock('./TypographyEditor', () => {
  const R = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return { __esModule: true, default: () => R.createElement(RN.View, { testID: 'typography-editor' }) };
});

jest.mock('./MediaPositionEditor', () => {
  const R = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return { __esModule: true, default: () => R.createElement(RN.View, { testID: 'media-position-editor' }) };
});

jest.mock('./SpacingEditor', () => {
  const R = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return { __esModule: true, default: () => R.createElement(RN.View, { testID: 'spacing-editor' }) };
});

jest.mock('./HeaderEditor', () => {
  const R = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return { __esModule: true, default: () => R.createElement(RN.View, { testID: 'header-editor' }) };
});

// =============================================================================
// Tests
// =============================================================================

describe('GlobalStylingTab', () => {
  const mockOnChange = jest.fn();
  const defaultValue: MenuContents = { layout: { template: LayoutTemplate.ModernGrid }, categories: [] };
  const defaultProps = { value: defaultValue, onChange: mockOnChange };

  beforeEach(() => { jest.clearAllMocks(); });

  describe('tab navigation', () => {
    it('renders all tab buttons', () => {
      const { getByTestId } = render(<GlobalStylingTab {...defaultProps} />);
      expect(getByTestId('tab-layout')).toBeTruthy();
      expect(getByTestId('tab-colors')).toBeTruthy();
      expect(getByTestId('tab-typography')).toBeTruthy();
      expect(getByTestId('tab-media')).toBeTruthy();
      expect(getByTestId('tab-header')).toBeTruthy();
      expect(getByTestId('tab-spacing')).toBeTruthy();
    });

    it('switches tabs when buttons are pressed', () => {
      const { getByTestId, queryByTestId } = render(<GlobalStylingTab {...defaultProps} />);
      fireEvent.press(getByTestId('tab-colors'));
      expect(getByTestId('global-styling-tab-colors')).toBeTruthy();
      expect(queryByTestId('global-styling-tab-layout')).toBeNull();
    });
  });

  describe('section expansion', () => {
    it('expands section when tab is switched', () => {
      const { getByTestId } = render(<GlobalStylingTab {...defaultProps} />);
      expect(getByTestId('global-styling-tab-layout-content')).toBeTruthy();
      fireEvent.press(getByTestId('tab-colors'));
      expect(getByTestId('global-styling-tab-colors-content')).toBeTruthy();
    });

    it('toggles section when header is pressed', () => {
      const { getByTestId, queryByTestId } = render(<GlobalStylingTab {...defaultProps} />);
      expect(getByTestId('global-styling-tab-layout-content')).toBeTruthy();
      fireEvent.press(getByTestId('global-styling-tab-layout-header'));
      expect(queryByTestId('global-styling-tab-layout-content')).toBeNull();
      fireEvent.press(getByTestId('global-styling-tab-layout-header'));
      expect(getByTestId('global-styling-tab-layout-content')).toBeTruthy();
    });

    it('passes disabled prop to collapsible section', () => {
      const { getByTestId } = render(<GlobalStylingTab {...defaultProps} disabled />);
      // When disabled, section is still rendered but toggle is disabled
      const header = getByTestId('global-styling-tab-layout-header');
      expect(header).toBeTruthy();
      // Verify component renders without error when disabled
      expect(getByTestId('global-styling-tab')).toBeTruthy();
    });
  });

  describe('sub-editor rendering', () => {
    it('renders correct editors for each tab', () => {
      const { getByTestId } = render(<GlobalStylingTab {...defaultProps} />);
      expect(getByTestId('layout-template-selector')).toBeTruthy();
      fireEvent.press(getByTestId('tab-colors'));
      expect(getByTestId('color-scheme-editor')).toBeTruthy();
      fireEvent.press(getByTestId('tab-typography'));
      expect(getByTestId('typography-editor')).toBeTruthy();
      fireEvent.press(getByTestId('tab-media'));
      expect(getByTestId('media-position-editor')).toBeTruthy();
      fireEvent.press(getByTestId('tab-header'));
      expect(getByTestId('header-editor')).toBeTruthy();
      fireEvent.press(getByTestId('tab-spacing'));
      expect(getByTestId('spacing-editor')).toBeTruthy();
    });
  });

  describe('constants', () => {
    it('TAB constants have correct values', () => {
      expect(TAB_LAYOUT).toBe('layout');
      expect(TAB_COLORS).toBe('colors');
      expect(TAB_TYPOGRAPHY).toBe('typography');
      expect(TAB_MEDIA).toBe('media');
      expect(TAB_HEADER).toBe('header');
      expect(TAB_SPACING).toBe('spacing');
    });

    it('TAB_BUTTONS has correct number of buttons', () => {
      const EXPECTED_TAB_COUNT = 6;
      expect(TAB_BUTTONS).toHaveLength(EXPECTED_TAB_COUNT);
    });
  });

  describe('edge cases', () => {
    it('handles empty menu contents', () => {
      const { getByTestId } = render(<GlobalStylingTab {...defaultProps} value={{}} />);
      expect(getByTestId('global-styling-tab')).toBeTruthy();
    });

    it('starts with layout tab active and expanded', () => {
      const { getByTestId, queryByTestId } = render(<GlobalStylingTab {...defaultProps} />);
      expect(getByTestId('global-styling-tab-layout')).toBeTruthy();
      expect(getByTestId('global-styling-tab-layout-content')).toBeTruthy();
      expect(queryByTestId('global-styling-tab-colors')).toBeNull();
    });
  });

  describe('header tab', () => {
    it('switches to header tab and shows header editor', () => {
      const { getByTestId, queryByTestId } = render(<GlobalStylingTab {...defaultProps} />);
      fireEvent.press(getByTestId('tab-header'));
      expect(getByTestId('global-styling-tab-header')).toBeTruthy();
      expect(getByTestId('header-editor')).toBeTruthy();
      expect(queryByTestId('global-styling-tab-layout')).toBeNull();
    });

    it('expands header section when tab is selected', () => {
      const { getByTestId } = render(<GlobalStylingTab {...defaultProps} />);
      fireEvent.press(getByTestId('tab-header'));
      expect(getByTestId('global-styling-tab-header-content')).toBeTruthy();
    });

    it('toggles header section when header is pressed', () => {
      const { getByTestId, queryByTestId } = render(<GlobalStylingTab {...defaultProps} />);
      fireEvent.press(getByTestId('tab-header'));
      expect(getByTestId('global-styling-tab-header-content')).toBeTruthy();
      fireEvent.press(getByTestId('global-styling-tab-header-header'));
      expect(queryByTestId('global-styling-tab-header-content')).toBeNull();
    });
  });
});
