

/**
 * Document picker component for selecting and uploading documents.
 *
 * Uses expo-document-picker for document selection and ContentUploader for upload handling.
 * Supports PDF and Word documents.
 */
import React, { useCallback } from 'react';

import * as ExpoDocumentPicker from 'expo-document-picker';

import { ContentUploader } from './ContentUploader';
import { ALLOWED_MIME_TYPES, useContent, useContentUrl } from '../../../lib/hooks/content';
import ContentCategory from '../../../shared/enums/ContentCategory';
import { isValueDefined } from '../../../utils/is';

import type { FileInfo } from '../../../lib/hooks/content/types';

export const DocumentPicker = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  isPublic = false,
  hint,
  multiple = false,
}: Props): React.ReactElement => {
  // Fetch content data if we have a value
  const { data: content } = useContent(value);
  const { data: urlData } = useContentUrl(value);

  const handlePickFile = useCallback(async (): Promise<FileInfo | null> => {
    // Launch document picker
    const result = await ExpoDocumentPicker.getDocumentAsync({
      type: ALLOWED_MIME_TYPES.Document,
      copyToCacheDirectory: true,
      multiple,
    });

    if (result.canceled === true || result.assets.length === 0) 
      return null;
    

    const asset = result.assets[0];
    const fileName = getFileName(asset.uri, asset.name);
    const mimeType = asset.mimeType ?? getMimeType(fileName);
    const fileSize = asset.size ?? 0;

    return {
      uri: asset.uri,
      name: fileName,
      type: mimeType,
      size: fileSize,
    };
  }, [multiple]);

  const displayHint = hint ?? 'PDF or Word documents (max 50MB)';

  return (
    <ContentUploader
      category={ContentCategory.Document}
      content={content}
      disabled={disabled}
      hint={displayHint}
      isPublic={isPublic}
      label={label}
      previewUrl={urlData?.url}
      required={required}
      value={value}
      onChange={onChange}
      onPickFile={handlePickFile}
    />
  );
}

interface Props {
  /** Current content ID value (if already uploaded) */
  value?: string;
  /** Callback when document is uploaded or removed */
  onChange?: (contentId: string | null) => void;
  /** Optional label text */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether uploads should be public */
  isPublic?: boolean;
  /** Hint text to display in the upload area */
  hint?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
}

/**
 * Extracts file name from URI or uses provided name.
 */
function getFileName(uri: string, providedName?: string): string {
  if (isValueDefined(providedName) && providedName !== '') 
    return providedName;
  
  const parts = uri.split('/');
  const fileName = parts[parts.length - 1];
  const nameWithoutQuery = fileName.split('?')[0];
  return nameWithoutQuery !== '' ? nameWithoutQuery : 'document.pdf';
}

/**
 * Gets MIME type from file name.
 */
function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (extension === 'pdf') return 'application/pdf';
  if (extension === 'doc') return 'application/msword';
  if (extension === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return 'application/octet-stream';
}
