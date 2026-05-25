/**
 * Unit tests for ContentPreview component.
 * Focus on logic: callbacks, conditional rendering logic, error states.
 */
import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { ContentPreview } from './ContentPreview';
import ContentCategory from '../../../shared/enums/ContentCategory';
import ContentStatus from '../../../shared/enums/ContentStatus';
import { TestIds } from '../../../shared/testIds';

import type { ContentDto } from '../../../lib/hooks/content/types';

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

describe('ContentPreview', () => {
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('delete callback behavior', () => {
    it('calls onDelete when delete button is pressed', () => {
      const { getByTestId } = render(
        <ContentPreview
          category={ContentCategory.Image}
          fileName="test.jpg"
          url="https://example.com/test.jpg"
          onDelete={mockOnDelete}
        />,
      );

      const deleteButton = getByTestId(TestIds.CONTENT_PREVIEW_DELETE_BUTTON);
      fireEvent.press(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('does not call onDelete when disabled', () => {
      const { getByTestId } = render(
        <ContentPreview
          disabled
          category={ContentCategory.Image}
          fileName="test.jpg"
          url="https://example.com/test.jpg"
          onDelete={mockOnDelete}
        />,
      );

      const deleteButton = getByTestId(TestIds.CONTENT_PREVIEW_DELETE_BUTTON);
      fireEvent.press(deleteButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('does not call onDelete when loading', () => {
      const { getByTestId } = render(
        <ContentPreview
          isLoading
          category={ContentCategory.Image}
          fileName="test.jpg"
          onDelete={mockOnDelete}
        />,
      );

      const deleteButton = getByTestId(TestIds.CONTENT_PREVIEW_DELETE_BUTTON);
      fireEvent.press(deleteButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('does not render delete button when onDelete is not provided', () => {
      const { queryByTestId } = render(
        <ContentPreview
          category={ContentCategory.Image}
          fileName="test.jpg"
          url="https://example.com/test.jpg"
        />,
      );

      const deleteButton = queryByTestId(TestIds.CONTENT_PREVIEW_DELETE_BUTTON);
      expect(deleteButton).toBeNull();
    });
  });

  describe('content data handling', () => {
    it('uses content data when provided', () => {
      const content: ContentDto = {
        id: 'content-123',
        fileName: 'from-content.jpg',
        contentType: 'image/jpeg',
        category: ContentCategory.Image,
        status: ContentStatus.Ready,
        url: 'https://example.com/from-content.jpg',
      };

      const { getByTestId } = render(
        <ContentPreview content={content} onDelete={mockOnDelete} />,
      );

      // The component should use content data
      const preview = getByTestId(TestIds.CONTENT_PREVIEW);
      expect(preview).toBeTruthy();
    });

    it('prefers explicit props over content data', () => {
      const content: ContentDto = {
        id: 'content-123',
        fileName: 'from-content.jpg',
        contentType: 'image/jpeg',
        category: ContentCategory.Image,
        status: ContentStatus.Ready,
      };

      const { getByTestId } = render(
        <ContentPreview
          category={ContentCategory.Document}
          content={content}
          fileName="explicit-name.jpg"
          onDelete={mockOnDelete}
        />,
      );

      // Should use explicit category, showing document preview
      const docPreview = getByTestId(TestIds.CONTENT_PREVIEW_DOCUMENT);
      expect(docPreview).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('displays error message when error is provided', () => {
      const { getByText } = render(
        <ContentPreview
          category={ContentCategory.Image}
          error="Failed to load content"
          fileName="test.jpg"
          onDelete={mockOnDelete}
        />,
      );

      expect(getByText('Failed to load content')).toBeTruthy();
    });

    it('does not display error when error is empty string', () => {
      const { queryByText } = render(
        <ContentPreview
          category={ContentCategory.Image}
          error=""
          fileName="test.jpg"
          url="https://example.com/test.jpg"
          onDelete={mockOnDelete}
        />,
      );

      // Should render image preview, not error
      expect(queryByText('Failed to load content')).toBeNull();
    });

    it('renders error state when isError is true even without error string', () => {
      const { getByTestId } = render(
        <ContentPreview
          isError
          category={ContentCategory.Image}
          fileName="test.jpg"
          onDelete={mockOnDelete}
        />,
      );

      expect(getByTestId(TestIds.ERROR_STATE)).toBeTruthy();
    });

    it('does not render retry button when onRetry is not provided', () => {
      const { queryByTestId } = render(
        <ContentPreview
          isError
          category={ContentCategory.Image}
          error="Boom"
          fileName="test.jpg"
          onDelete={mockOnDelete}
        />,
      );

      expect(queryByTestId(TestIds.ERROR_STATE_RETRY)).toBeNull();
    });

    it('renders retry button when onRetry is provided and calls it on press', () => {
      const mockOnRetry = jest.fn();
      const { getByTestId } = render(
        <ContentPreview
          isError
          category={ContentCategory.Image}
          error="Boom"
          fileName="test.jpg"
          onDelete={mockOnDelete}
          onRetry={mockOnRetry}
        />,
      );

      const retryButton = getByTestId(TestIds.ERROR_STATE_RETRY);
      fireEvent.press(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('prefers the explicit error string over the default fallback', () => {
      const { getByText, queryByText } = render(
        <ContentPreview
          isError
          category={ContentCategory.Image}
          error="Custom failure"
          fileName="test.jpg"
          onDelete={mockOnDelete}
          onRetry={jest.fn()}
        />,
      );

      expect(getByText('Custom failure')).toBeTruthy();
      expect(queryByText('Failed to load preview')).toBeNull();
    });

    it('falls back to the default preview load error when no error string is provided', () => {
      const { getByText } = render(
        <ContentPreview
          isError
          category={ContentCategory.Image}
          fileName="test.jpg"
          onDelete={mockOnDelete}
          onRetry={jest.fn()}
        />,
      );

      expect(getByText('Failed to load preview')).toBeTruthy();
    });
  });

  describe('category-specific rendering', () => {
    it('renders image preview for Image category with URL', () => {
      const { getByTestId } = render(
        <ContentPreview
          category={ContentCategory.Image}
          fileName="test.jpg"
          url="https://example.com/test.jpg"
          onDelete={mockOnDelete}
        />,
      );

      const imagePreview = getByTestId(TestIds.CONTENT_PREVIEW_IMAGE);
      expect(imagePreview).toBeTruthy();
    });

    it('renders video thumbnail for Video category with URL', () => {
      const { getByTestId } = render(
        <ContentPreview
          category={ContentCategory.Video}
          fileName="test.mp4"
          url="https://example.com/thumbnail.jpg"
          onDelete={mockOnDelete}
        />,
      );

      const videoThumbnail = getByTestId(TestIds.CONTENT_PREVIEW_VIDEO_THUMBNAIL);
      expect(videoThumbnail).toBeTruthy();
    });

    it('renders document icon for Document category', () => {
      const { getByTestId } = render(
        <ContentPreview
          category={ContentCategory.Document}
          fileName="test.pdf"
          onDelete={mockOnDelete}
        />,
      );

      const docPreview = getByTestId(TestIds.CONTENT_PREVIEW_DOCUMENT);
      expect(docPreview).toBeTruthy();
    });
  });
});
