/**
 * Unit tests for ContentImage component.
 * Focus on logic: conditional rendering based on contentId, loading states, error handling.
 */
import React from 'react';

import { render } from '@testing-library/react-native';

import { ContentImage } from './ContentImage';

// Mock theme
jest.mock('../../../theme/hooks/useTheme', () => ({
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

// Mock the content URL hooks
const mockUseContentUrl = jest.fn();
const mockUsePublicContentUrl = jest.fn();
jest.mock('../../../lib/hooks/content', () => ({
  useContentUrl: (contentId: string | undefined) => mockUseContentUrl(contentId),
  usePublicContentUrl: (contentId: string | undefined) => mockUsePublicContentUrl(contentId),
}));

describe('ContentImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock returns successful URL data for authenticated hook
    mockUseContentUrl.mockReturnValue({
      data: { url: 'https://example.com/image.jpg' },
      isLoading: false,
      isError: false,
    });
    // Default mock returns successful URL data for public hook
    mockUsePublicContentUrl.mockReturnValue({
      data: { url: 'https://example.com/public-image.jpg' },
      isLoading: false,
      isError: false,
    });
  });

  describe('conditional rendering based on contentId', () => {
    it('returns null when contentId is null', () => {
      const { toJSON } = render(
        <ContentImage contentId={null} testID="test-image" />,
      );

      expect(toJSON()).toBeNull();
      // Hook should not be called with null
      expect(mockUseContentUrl).toHaveBeenCalledWith(undefined);
    });

    it('returns null when contentId is undefined', () => {
      const { toJSON } = render(
        <ContentImage contentId={undefined} testID="test-image" />,
      );

      expect(toJSON()).toBeNull();
      expect(mockUseContentUrl).toHaveBeenCalledWith(undefined);
    });

    it('returns null when contentId is empty string', () => {
      const { toJSON } = render(
        <ContentImage contentId="" testID="test-image" />,
      );

      expect(toJSON()).toBeNull();
      expect(mockUseContentUrl).toHaveBeenCalledWith(undefined);
    });

    it('calls useContentUrl with contentId when valid', () => {
      render(<ContentImage contentId="content-123" testID="test-image" />);

      expect(mockUseContentUrl).toHaveBeenCalledWith('content-123');
    });
  });

  describe('loading state', () => {
    it('renders loading indicator when isLoading is true', () => {
      mockUseContentUrl.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      const { getByTestId } = render(
        <ContentImage contentId="content-123" testID="test-image" />,
      );

      // Should render a container with testID
      const container = getByTestId('test-image');
      expect(container).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('returns null when isError is true', () => {
      mockUseContentUrl.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      const { toJSON } = render(
        <ContentImage contentId="content-123" testID="test-image" />,
      );

      expect(toJSON()).toBeNull();
    });

    it('returns null when url is undefined', () => {
      mockUseContentUrl.mockReturnValue({
        data: { url: undefined },
        isLoading: false,
        isError: false,
      });

      const { toJSON } = render(
        <ContentImage contentId="content-123" testID="test-image" />,
      );

      expect(toJSON()).toBeNull();
    });

    it('returns null when url is empty string', () => {
      mockUseContentUrl.mockReturnValue({
        data: { url: '' },
        isLoading: false,
        isError: false,
      });

      const { toJSON } = render(
        <ContentImage contentId="content-123" testID="test-image" />,
      );

      expect(toJSON()).toBeNull();
    });
  });

  describe('successful render', () => {
    it('renders image container when url data is available', () => {
      mockUseContentUrl.mockReturnValue({
        data: { url: 'https://example.com/image.jpg' },
        isLoading: false,
        isError: false,
      });

      const { getByTestId } = render(
        <ContentImage contentId="content-123" testID="test-image" />,
      );

      const container = getByTestId('test-image');
      expect(container).toBeTruthy();
    });
  });

  describe('hook call behavior', () => {
    it('does not make hook call for invalid contentId', () => {
      render(<ContentImage contentId={null} />);
      render(<ContentImage contentId={undefined} />);
      render(<ContentImage contentId="" />);

      // All three should call with undefined (disabled query)
      expect(mockUseContentUrl).toHaveBeenCalledTimes(3);
      expect(mockUseContentUrl).toHaveBeenNthCalledWith(1, undefined);
      expect(mockUseContentUrl).toHaveBeenNthCalledWith(2, undefined);
      expect(mockUseContentUrl).toHaveBeenNthCalledWith(3, undefined);
    });
  });

  describe('public mode (isPublic prop)', () => {
    it('uses usePublicContentUrl when isPublic is true', () => {
      render(
        <ContentImage isPublic contentId="content-123" testID="test-image" />,
      );

      // Public hook should be called with the contentId
      expect(mockUsePublicContentUrl).toHaveBeenCalledWith('content-123');
      // Authenticated hook should be called with undefined (disabled)
      expect(mockUseContentUrl).toHaveBeenCalledWith(undefined);
    });

    it('uses useContentUrl when isPublic is false (default)', () => {
      render(
        <ContentImage contentId="content-123" testID="test-image" />,
      );

      // Authenticated hook should be called with the contentId
      expect(mockUseContentUrl).toHaveBeenCalledWith('content-123');
      // Public hook should be called with undefined (disabled)
      expect(mockUsePublicContentUrl).toHaveBeenCalledWith(undefined);
    });

    it('renders image from public URL when isPublic is true', () => {
      mockUsePublicContentUrl.mockReturnValue({
        data: { url: 'https://example.com/public-image.jpg' },
        isLoading: false,
        isError: false,
      });

      const { getByTestId } = render(
        <ContentImage isPublic contentId="content-123" testID="test-image" />,
      );

      const container = getByTestId('test-image');
      expect(container).toBeTruthy();
    });

    it('returns null when public URL fetch fails', () => {
      mockUsePublicContentUrl.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      const { toJSON } = render(
        <ContentImage isPublic contentId="content-123" testID="test-image" />,
      );

      expect(toJSON()).toBeNull();
    });
  });
});
