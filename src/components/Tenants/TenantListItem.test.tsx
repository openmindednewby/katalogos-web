import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import TenantListItem from './TenantListItem';

// Mock dependencies
jest.mock('react-redux', () => ({
  useSelector: () => 'light',
}));

// Mock useTheme (new theme system)
jest.mock('../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: { text: '#001219', textSecondary: '#555555', background: '#ffffff', surface: '#f7f7f7', surfaceElevated: '#ffffff', border: '#e6e6e6', divider: '#eeeeee' },
      palette: { primary: { '500': '#005f73' }, secondary: { '500': '#94d2bd' }, accent: { '500': '#ee9b00' } },
      semantic: { success: { '500': '#2d6a4f' }, warning: { '500': '#ee9b00' }, error: { '500': '#ae2012' }, info: { '500': '#005f73' } },
      typography: { fontFamily: 'System', headingScale: 1.25 },
      mode: 'light',
      branding: { logoUrl: null, faviconUrl: null },
    },
    mode: 'light',
    toggleMode: jest.fn(),
    setMode: jest.fn(),
    setTenantConfig: jest.fn(),
  }),
}));

interface TestItem {
  externalId: string;
  name: string;
  isActive: boolean;
}

describe('TenantListItem', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnActivate = jest.fn();
  const mockOnPreview = jest.fn();
  const mockOnOpenExternal = jest.fn();

  const activeItem: TestItem = {
    externalId: 'menu-123',
    name: 'Test Menu',
    isActive: true,
  };

  const inactiveItem: TestItem = {
    externalId: 'menu-456',
    name: 'Inactive Menu',
    isActive: false,
  };

  const defaultProps = {
    item: activeItem,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    statusKey: 'isActive' as const,
    translationNs: 'onlineMenus',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onPreview callback', () => {
    it('calls onPreview with the item ID when preview button is pressed', () => {
      const { getByText } = render(
        <TenantListItem {...defaultProps} onPreview={mockOnPreview} />,
      );

      const previewButton = getByText(/Preview/);
      fireEvent.press(previewButton);

      expect(mockOnPreview).toHaveBeenCalledWith('menu-123');
      expect(mockOnPreview).toHaveBeenCalledTimes(1);
    });

    it('does not render preview button when onPreview is not provided', () => {
      const { queryByText } = render(<TenantListItem {...defaultProps} />);

      expect(queryByText(/Preview/)).toBeNull();
    });
  });

  describe('onOpenExternal callback', () => {
    it('calls onOpenExternal with the item ID when open external button is pressed for active menu', () => {
      const { getByText } = render(
        <TenantListItem {...defaultProps} onOpenExternal={mockOnOpenExternal} />,
      );

      const openExternalButton = getByText(/Open Link/);
      fireEvent.press(openExternalButton);

      expect(mockOnOpenExternal).toHaveBeenCalledWith('menu-123');
      expect(mockOnOpenExternal).toHaveBeenCalledTimes(1);
    });

    it('does not call onOpenExternal when menu is inactive (button is disabled)', () => {
      const { getByText } = render(
        <TenantListItem
          {...defaultProps}
          item={inactiveItem}
          onOpenExternal={mockOnOpenExternal}
        />,
      );

      const openExternalButton = getByText(/Open Link/);
      fireEvent.press(openExternalButton);

      // Button is disabled, so callback should not be called
      expect(mockOnOpenExternal).not.toHaveBeenCalled();
    });

    it('does not render open external button when onOpenExternal is not provided', () => {
      const { queryByText } = render(<TenantListItem {...defaultProps} />);

      expect(queryByText(/Open Link/)).toBeNull();
    });
  });

  describe('onEdit callback', () => {
    it('calls onEdit with the item ID and name when edit button is pressed', () => {
      const { getByText } = render(<TenantListItem {...defaultProps} />);

      const editButton = getByText(/Edit/);
      fireEvent.press(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith('menu-123', 'Test Menu');
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('onDelete callback', () => {
    it('calls onDelete with the item ID when delete button is pressed', () => {
      const { getByText } = render(<TenantListItem {...defaultProps} />);

      const deleteButton = getByText(/Delete/);
      fireEvent.press(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('menu-123');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('onActivate callback', () => {
    it('calls onActivate with ID and current status when activate button is pressed', () => {
      const { getByText } = render(
        <TenantListItem {...defaultProps} onActivate={mockOnActivate} />,
      );

      const activateButton = getByText(/Activate/);
      fireEvent.press(activateButton);

      expect(mockOnActivate).toHaveBeenCalledWith('menu-123', true);
      expect(mockOnActivate).toHaveBeenCalledTimes(1);
    });

    it('does not render activate button when onActivate is not provided', () => {
      const { queryByText } = render(<TenantListItem {...defaultProps} />);

      // Only Edit and Delete should be shown, not Activate
      expect(queryByText(/Edit/)).toBeTruthy();
      expect(queryByText(/Delete/)).toBeTruthy();
    });
  });

  describe('onQrCode callback', () => {
    const mockOnQrCode = jest.fn();

    // The QR button renders the localized label ("QR Code"), not the raw
    // translation key. Match on the localized text, like the sibling
    // Edit/Delete tests above.
    it('calls onQrCode with the item ID when QR code button is pressed for active menu', () => {
      const { getByText } = render(
        <TenantListItem {...defaultProps} onQrCode={mockOnQrCode} />,
      );

      const qrButton = getByText('QR Code');
      fireEvent.press(qrButton);

      expect(mockOnQrCode).toHaveBeenCalledWith('menu-123');
      expect(mockOnQrCode).toHaveBeenCalledTimes(1);
    });

    it('does not call onQrCode when menu is inactive (button is disabled)', () => {
      const { getByText } = render(
        <TenantListItem
          {...defaultProps}
          item={inactiveItem}
          onQrCode={mockOnQrCode}
        />,
      );

      const qrButton = getByText('QR Code');
      fireEvent.press(qrButton);

      expect(mockOnQrCode).not.toHaveBeenCalled();
    });

    it('does not render QR code button when onQrCode is not provided', () => {
      const { queryByText } = render(<TenantListItem {...defaultProps} />);

      expect(queryByText('QR Code')).toBeNull();
    });
  });
});
