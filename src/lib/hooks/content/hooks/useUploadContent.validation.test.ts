/**
 * Unit tests for useUploadContent hook - File validation.
 */
import { validateFile } from '..';
import ContentCategory from '../../../../shared/enums/ContentCategory';

import type { FileInfo } from '..';

describe('validateFile', () => {
  describe('file size validation', () => {
    it('accepts files within size limit for images', () => {
      const file: FileInfo = {
        uri: 'file://test.jpg',
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 5 * 1024 * 1024, // 5MB
      };

      const result = validateFile(file, ContentCategory.Image);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects files exceeding size limit for images', () => {
      const file: FileInfo = {
        uri: 'file://large.jpg',
        name: 'large.jpg',
        type: 'image/jpeg',
        size: 15 * 1024 * 1024, // 15MB - exceeds 10MB limit
      };

      const result = validateFile(file, ContentCategory.Image);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum');
    });

    it('accepts videos up to 500MB', () => {
      const file: FileInfo = {
        uri: 'file://video.mp4',
        name: 'video.mp4',
        type: 'video/mp4',
        size: 400 * 1024 * 1024, // 400MB
      };

      const result = validateFile(file, ContentCategory.Video);
      expect(result.valid).toBe(true);
    });

    it('rejects videos exceeding 500MB', () => {
      const file: FileInfo = {
        uri: 'file://large-video.mp4',
        name: 'large-video.mp4',
        type: 'video/mp4',
        size: 600 * 1024 * 1024, // 600MB
      };

      const result = validateFile(file, ContentCategory.Video);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum');
    });

    it('accepts documents up to 50MB', () => {
      const file: FileInfo = {
        uri: 'file://doc.pdf',
        name: 'doc.pdf',
        type: 'application/pdf',
        size: 40 * 1024 * 1024, // 40MB
      };

      const result = validateFile(file, ContentCategory.Document);
      expect(result.valid).toBe(true);
    });
  });

  describe('MIME type validation', () => {
    it.each([
      ['image/jpeg', ContentCategory.Image],
      ['image/png', ContentCategory.Image],
      ['image/gif', ContentCategory.Image],
      ['image/webp', ContentCategory.Image],
    ] as const)('accepts %s for %s category', (mimeType, category) => {
      const file: FileInfo = {
        uri: 'file://test',
        name: 'test',
        type: mimeType,
        size: 1024,
      };

      const result = validateFile(file, category);
      expect(result.valid).toBe(true);
    });

    it.each([
      ['video/mp4', ContentCategory.Video],
      ['video/quicktime', ContentCategory.Video],
      ['video/x-msvideo', ContentCategory.Video],
      ['video/webm', ContentCategory.Video],
    ] as const)('accepts %s for %s category', (mimeType, category) => {
      const file: FileInfo = {
        uri: 'file://test',
        name: 'test',
        type: mimeType,
        size: 1024,
      };

      const result = validateFile(file, category);
      expect(result.valid).toBe(true);
    });

    it.each([
      ['application/pdf', ContentCategory.Document],
      ['application/msword', ContentCategory.Document],
      ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', ContentCategory.Document],
    ] as const)('accepts %s for %s category', (mimeType, category) => {
      const file: FileInfo = {
        uri: 'file://test',
        name: 'test',
        type: mimeType,
        size: 1024,
      };

      const result = validateFile(file, category);
      expect(result.valid).toBe(true);
    });

    it('rejects image MIME type for Video category', () => {
      const file: FileInfo = {
        uri: 'file://test.jpg',
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
      };

      const result = validateFile(file, ContentCategory.Video);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('rejects video MIME type for Image category', () => {
      const file: FileInfo = {
        uri: 'file://test.mp4',
        name: 'test.mp4',
        type: 'video/mp4',
        size: 1024,
      };

      const result = validateFile(file, ContentCategory.Image);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('rejects unsupported MIME types', () => {
      const file: FileInfo = {
        uri: 'file://test.exe',
        name: 'test.exe',
        type: 'application/x-msdownload',
        size: 1024,
      };

      const result = validateFile(file, ContentCategory.Document);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });
  });
});
