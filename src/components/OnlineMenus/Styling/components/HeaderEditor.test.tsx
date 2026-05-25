import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import HeaderEditor from './HeaderEditor';
import HorizontalPosition from '../../../../types/enums/HorizontalPosition';
import LogoSize from '../../../../types/enums/LogoSize';

import type { HeaderSettings } from '../../../../types/menuStyleTypes';

// Mock dependencies
jest.mock('react-redux', () => ({
  useSelector: () => 'light',
}));

describe('HeaderEditor', () => {
  const mockOnChange = jest.fn();

  const defaultValue: HeaderSettings = {
    showLogo: false,
    logoPosition: HorizontalPosition.Center,
    logoSize: LogoSize.Medium,
    bannerHeight: 200,
    showMenuName: true,
    showMenuDescription: true,
    titlePosition: HorizontalPosition.Center,
  };

  const defaultProps = {
    value: defaultValue,
    onChange: mockOnChange,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the component with all controls', () => {
      const { getByTestId, getByText } = render(<HeaderEditor {...defaultProps} />);

      expect(getByTestId('header-editor')).toBeTruthy();
      expect(getByTestId('header-editor-preview')).toBeTruthy();
      expect(getByText('Header')).toBeTruthy();
    });

    it('renders preview section', () => {
      const { getByText, getByTestId } = render(<HeaderEditor {...defaultProps} />);

      expect(getByText('Preview')).toBeTruthy();
      expect(getByTestId('header-editor-preview')).toBeTruthy();
    });

    it('renders show logo toggle', () => {
      const { getByTestId, getByText } = render(<HeaderEditor {...defaultProps} />);

      expect(getByTestId('header-editor-show-logo-toggle')).toBeTruthy();
      expect(getByText('Show Logo')).toBeTruthy();
    });

    it('renders show menu name toggle', () => {
      const { getByTestId, getByText } = render(<HeaderEditor {...defaultProps} />);

      expect(getByTestId('header-editor-show-menu-name-toggle')).toBeTruthy();
      expect(getByText('Show Menu Name')).toBeTruthy();
    });

    it('renders show menu description toggle', () => {
      const { getByTestId, getByText } = render(<HeaderEditor {...defaultProps} />);

      expect(getByTestId('header-editor-show-menu-description-toggle')).toBeTruthy();
      expect(getByText('Show Description')).toBeTruthy();
    });

    it('renders title position selector', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      expect(getByTestId('header-editor-title-position-left')).toBeTruthy();
      expect(getByTestId('header-editor-title-position-center')).toBeTruthy();
      expect(getByTestId('header-editor-title-position-right')).toBeTruthy();
    });

    it('renders banner height slider', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      expect(getByTestId('header-editor-banner-height-slider-slider')).toBeTruthy();
    });
  });

  describe('logo controls visibility', () => {
    it('does not render logo position selector when showLogo is false', () => {
      const { queryByTestId } = render(<HeaderEditor {...defaultProps} />);

      expect(queryByTestId('header-editor-logo-position-left')).toBeNull();
      expect(queryByTestId('header-editor-logo-position-center')).toBeNull();
      expect(queryByTestId('header-editor-logo-position-right')).toBeNull();
    });

    it('does not render logo size selector when showLogo is false', () => {
      const { queryByTestId } = render(<HeaderEditor {...defaultProps} />);

      expect(queryByTestId('header-editor-logo-size-small')).toBeNull();
      expect(queryByTestId('header-editor-logo-size-medium')).toBeNull();
      expect(queryByTestId('header-editor-logo-size-large')).toBeNull();
    });

    it('renders logo position selector when showLogo is true', () => {
      const valueWithLogo: HeaderSettings = { ...defaultValue, showLogo: true };
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueWithLogo} />,
      );

      expect(getByTestId('header-editor-logo-position-left')).toBeTruthy();
      expect(getByTestId('header-editor-logo-position-center')).toBeTruthy();
      expect(getByTestId('header-editor-logo-position-right')).toBeTruthy();
    });

    it('renders logo size selector when showLogo is true', () => {
      const valueWithLogo: HeaderSettings = { ...defaultValue, showLogo: true };
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueWithLogo} />,
      );

      expect(getByTestId('header-editor-logo-size-small')).toBeTruthy();
      expect(getByTestId('header-editor-logo-size-medium')).toBeTruthy();
      expect(getByTestId('header-editor-logo-size-large')).toBeTruthy();
    });
  });

  describe('show logo toggle', () => {
    it('displays current show logo state (disabled)', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const toggle = getByTestId('header-editor-show-logo-toggle');
      expect(toggle.props.value).toBe(false);
    });

    it('displays current show logo state (enabled)', () => {
      const valueWithLogo: HeaderSettings = { ...defaultValue, showLogo: true };
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueWithLogo} />,
      );

      const toggle = getByTestId('header-editor-show-logo-toggle');
      expect(toggle.props.value).toBe(true);
    });

    it('calls onChange when toggle is switched on', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const toggle = getByTestId('header-editor-show-logo-toggle');
      fireEvent(toggle, 'onValueChange', true);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        showLogo: true,
      });
    });

    it('calls onChange when toggle is switched off', () => {
      const valueWithLogo: HeaderSettings = { ...defaultValue, showLogo: true };
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueWithLogo} />,
      );

      const toggle = getByTestId('header-editor-show-logo-toggle');
      fireEvent(toggle, 'onValueChange', false);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...valueWithLogo,
        showLogo: false,
      });
    });
  });

  describe('logo position selector', () => {
    const valueWithLogo: HeaderSettings = { ...defaultValue, showLogo: true };

    it('calls onChange when left position is selected', () => {
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueWithLogo} />,
      );

      const leftButton = getByTestId('header-editor-logo-position-left');
      fireEvent.press(leftButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...valueWithLogo,
        logoPosition: 'left',
      });
    });

    it('calls onChange when right position is selected', () => {
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueWithLogo} />,
      );

      const rightButton = getByTestId('header-editor-logo-position-right');
      fireEvent.press(rightButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...valueWithLogo,
        logoPosition: 'right',
      });
    });

    it('does not call onChange when disabled', () => {
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} disabled value={valueWithLogo} />,
      );

      const leftButton = getByTestId('header-editor-logo-position-left');
      fireEvent.press(leftButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('logo size selector', () => {
    const valueWithLogo: HeaderSettings = { ...defaultValue, showLogo: true };

    it('calls onChange when small size is selected', () => {
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueWithLogo} />,
      );

      const smallButton = getByTestId('header-editor-logo-size-small');
      fireEvent.press(smallButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...valueWithLogo,
        logoSize: 'small',
      });
    });

    it('calls onChange when large size is selected', () => {
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueWithLogo} />,
      );

      const largeButton = getByTestId('header-editor-logo-size-large');
      fireEvent.press(largeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...valueWithLogo,
        logoSize: 'large',
      });
    });

    it('does not call onChange when disabled', () => {
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} disabled value={valueWithLogo} />,
      );

      const smallButton = getByTestId('header-editor-logo-size-small');
      fireEvent.press(smallButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('banner height slider', () => {
    it('displays current banner height value', () => {
      const { getByText } = render(<HeaderEditor {...defaultProps} />);

      expect(getByText('200px')).toBeTruthy();
    });

    it('calls onChange when increase button is pressed', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const increaseButton = getByTestId('header-editor-banner-height-slider-increase');
      fireEvent.press(increaseButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        bannerHeight: 220,
      });
    });

    it('calls onChange when decrease button is pressed', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const decreaseButton = getByTestId('header-editor-banner-height-slider-decrease');
      fireEvent.press(decreaseButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        bannerHeight: 180,
      });
    });

    it('does not decrease below minimum (100)', () => {
      const valueAtMin: HeaderSettings = { ...defaultValue, bannerHeight: 100 };
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueAtMin} />,
      );

      const decreaseButton = getByTestId('header-editor-banner-height-slider-decrease');
      fireEvent.press(decreaseButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not increase above maximum (400)', () => {
      const valueAtMax: HeaderSettings = { ...defaultValue, bannerHeight: 400 };
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueAtMax} />,
      );

      const increaseButton = getByTestId('header-editor-banner-height-slider-increase');
      fireEvent.press(increaseButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('show menu name toggle', () => {
    it('displays current show menu name state', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const toggle = getByTestId('header-editor-show-menu-name-toggle');
      expect(toggle.props.value).toBe(true);
    });

    it('calls onChange when toggle is switched off', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const toggle = getByTestId('header-editor-show-menu-name-toggle');
      fireEvent(toggle, 'onValueChange', false);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        showMenuName: false,
      });
    });
  });

  describe('show menu description toggle', () => {
    it('displays current show menu description state', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const toggle = getByTestId('header-editor-show-menu-description-toggle');
      expect(toggle.props.value).toBe(true);
    });

    it('calls onChange when toggle is switched off', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const toggle = getByTestId('header-editor-show-menu-description-toggle');
      fireEvent(toggle, 'onValueChange', false);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        showMenuDescription: false,
      });
    });
  });

  describe('title position selector', () => {
    it('calls onChange when left position is selected', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const leftButton = getByTestId('header-editor-title-position-left');
      fireEvent.press(leftButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        titlePosition: 'left',
      });
    });

    it('calls onChange when right position is selected', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const rightButton = getByTestId('header-editor-title-position-right');
      fireEvent.press(rightButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultValue,
        titlePosition: 'right',
      });
    });

    it('does not call onChange when disabled', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} disabled />);

      const leftButton = getByTestId('header-editor-title-position-left');
      fireEvent.press(leftButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('disables show logo toggle when disabled', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} disabled />);

      const toggle = getByTestId('header-editor-show-logo-toggle');
      expect(toggle.props.disabled).toBe(true);
    });

    it('disables show menu name toggle when disabled', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} disabled />);

      const toggle = getByTestId('header-editor-show-menu-name-toggle');
      expect(toggle.props.disabled).toBe(true);
    });

    it('disables show menu description toggle when disabled', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} disabled />);

      const toggle = getByTestId('header-editor-show-menu-description-toggle');
      expect(toggle.props.disabled).toBe(true);
    });

    it('disables slider buttons when disabled', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} disabled />);

      const increaseButton = getByTestId('header-editor-banner-height-slider-increase');
      expect(increaseButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles empty HeaderSettings value', () => {
      const emptyValue: HeaderSettings = {};
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={emptyValue} />,
      );

      const showLogoToggle = getByTestId('header-editor-show-logo-toggle');
      expect(showLogoToggle.props.value).toBe(false);

      const showMenuNameToggle = getByTestId('header-editor-show-menu-name-toggle');
      expect(showMenuNameToggle.props.value).toBe(true);
    });

    it('handles partial HeaderSettings value', () => {
      const partialValue: HeaderSettings = { showLogo: true, logoSize: LogoSize.Large };
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={partialValue} />,
      );

      const showLogoToggle = getByTestId('header-editor-show-logo-toggle');
      expect(showLogoToggle.props.value).toBe(true);

      expect(getByTestId('header-editor-logo-size-large')).toBeTruthy();
    });

    it('handles undefined values gracefully', () => {
      const undefinedValues: HeaderSettings = {
        showLogo: undefined,
        logoPosition: undefined,
        logoSize: undefined,
        bannerHeight: undefined,
        showMenuName: undefined,
        showMenuDescription: undefined,
        titlePosition: undefined,
      };
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={undefinedValues} />,
      );

      expect(getByTestId('header-editor')).toBeTruthy();
    });
  });

  describe('preview behavior', () => {
    it('shows logo placeholder in preview when showLogo is true', () => {
      const valueWithLogo: HeaderSettings = { ...defaultValue, showLogo: true };
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueWithLogo} />,
      );

      const preview = getByTestId('header-editor-preview');
      expect(preview).toBeTruthy();
    });

    it('shows menu title in preview when showMenuName is true', () => {
      const { getByText } = render(<HeaderEditor {...defaultProps} />);

      expect(getByText('Menu Title Preview')).toBeTruthy();
    });

    it('does not show menu title when showMenuName is false', () => {
      const valueNoTitle: HeaderSettings = { ...defaultValue, showMenuName: false };
      const { queryByText } = render(
        <HeaderEditor {...defaultProps} value={valueNoTitle} />,
      );

      expect(queryByText('Menu Title Preview')).toBeNull();
    });

    it('shows menu description in preview when showMenuDescription is true', () => {
      const { getByText } = render(<HeaderEditor {...defaultProps} />);

      expect(getByText('Menu description preview')).toBeTruthy();
    });

    it('does not show menu description when showMenuDescription is false', () => {
      const valueNoDesc: HeaderSettings = { ...defaultValue, showMenuDescription: false };
      const { queryByText } = render(
        <HeaderEditor {...defaultProps} value={valueNoDesc} />,
      );

      expect(queryByText('Menu description preview')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has accessible labels for show logo toggle', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const toggle = getByTestId('header-editor-show-logo-toggle');
      expect(toggle.props.accessibilityLabel).toBe('Show Logo');
      expect(toggle.props.accessibilityHint).toBe('Toggle logo visibility');
    });

    it('has accessible labels for show menu name toggle', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const toggle = getByTestId('header-editor-show-menu-name-toggle');
      expect(toggle.props.accessibilityLabel).toBe('Show Menu Name');
      expect(toggle.props.accessibilityHint).toBe('Toggle menu name');
    });

    it('has accessible labels for show menu description toggle', () => {
      const { getByTestId } = render(<HeaderEditor {...defaultProps} />);

      const toggle = getByTestId('header-editor-show-menu-description-toggle');
      expect(toggle.props.accessibilityLabel).toBe('Show Description');
      expect(toggle.props.accessibilityHint).toBe('Toggle menu description');
    });

    it('has testIDs on all interactive elements', () => {
      const valueWithLogo: HeaderSettings = { ...defaultValue, showLogo: true };
      const { getByTestId } = render(
        <HeaderEditor {...defaultProps} value={valueWithLogo} />,
      );

      expect(getByTestId('header-editor')).toBeTruthy();
      expect(getByTestId('header-editor-preview')).toBeTruthy();
      expect(getByTestId('header-editor-show-logo-toggle')).toBeTruthy();
      expect(getByTestId('header-editor-logo-position-left')).toBeTruthy();
      expect(getByTestId('header-editor-logo-position-center')).toBeTruthy();
      expect(getByTestId('header-editor-logo-position-right')).toBeTruthy();
      expect(getByTestId('header-editor-logo-size-small')).toBeTruthy();
      expect(getByTestId('header-editor-logo-size-medium')).toBeTruthy();
      expect(getByTestId('header-editor-logo-size-large')).toBeTruthy();
      expect(getByTestId('header-editor-banner-height-slider-slider')).toBeTruthy();
      expect(getByTestId('header-editor-show-menu-name-toggle')).toBeTruthy();
      expect(getByTestId('header-editor-show-menu-description-toggle')).toBeTruthy();
      expect(getByTestId('header-editor-title-position-left')).toBeTruthy();
      expect(getByTestId('header-editor-title-position-center')).toBeTruthy();
      expect(getByTestId('header-editor-title-position-right')).toBeTruthy();
    });
  });
});
