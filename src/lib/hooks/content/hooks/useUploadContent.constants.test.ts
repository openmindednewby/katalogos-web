/**
 * Unit tests for useUploadContent hook - Constants and query keys.
 */
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
  getContentListQueryKey,
  getContentQueryKey,
} from '..';
import ContentCategory from '../../../../shared/enums/ContentCategory';

describe('MAX_FILE_SIZES', () => {
  it('defines correct limits for Image', () => {
    expect(MAX_FILE_SIZES.Image).toBe(10 * 1024 * 1024); // 10MB
  });

  it('defines correct limits for Video', () => {
    expect(MAX_FILE_SIZES.Video).toBe(500 * 1024 * 1024); // 500MB
  });

  it('defines correct limits for Document', () => {
    expect(MAX_FILE_SIZES.Document).toBe(50 * 1024 * 1024); // 50MB
  });
});

describe('ALLOWED_MIME_TYPES', () => {
  it('includes standard image types', () => {
    expect(ALLOWED_MIME_TYPES.Image).toContain('image/jpeg');
    expect(ALLOWED_MIME_TYPES.Image).toContain('image/png');
    expect(ALLOWED_MIME_TYPES.Image).toContain('image/gif');
    expect(ALLOWED_MIME_TYPES.Image).toContain('image/webp');
  });

  it('includes standard video types', () => {
    expect(ALLOWED_MIME_TYPES.Video).toContain('video/mp4');
    expect(ALLOWED_MIME_TYPES.Video).toContain('video/quicktime');
    expect(ALLOWED_MIME_TYPES.Video).toContain('video/webm');
  });

  it('includes standard document types', () => {
    expect(ALLOWED_MIME_TYPES.Document).toContain('application/pdf');
    expect(ALLOWED_MIME_TYPES.Document).toContain('application/msword');
  });
});

describe('query key generators', () => {
  describe('getContentListQueryKey', () => {
    it('returns base key without category', () => {
      const key = getContentListQueryKey();
      expect(key).toEqual(['content', 'list']);
    });

    it('includes category when provided', () => {
      const key = getContentListQueryKey(ContentCategory.Image);
      expect(key).toEqual(['content', 'list', 'Image']);
    });

    it('works with all category types', () => {
      const categories: ContentCategory[] = [ContentCategory.Image, ContentCategory.Video, ContentCategory.Document];
      categories.forEach((category) => {
        const key = getContentListQueryKey(category);
        expect(key).toContain(category);
      });
    });
  });

  describe('getContentQueryKey', () => {
    it('returns key with content ID', () => {
      const key = getContentQueryKey('content-123');
      expect(key).toEqual(['content', 'content-123']);
    });

    it('handles different content IDs', () => {
      const id1 = getContentQueryKey('abc');
      const id2 = getContentQueryKey('xyz');
      expect(id1).not.toEqual(id2);
      expect(id1[1]).toBe('abc');
      expect(id2[1]).toBe('xyz');
    });
  });
});
