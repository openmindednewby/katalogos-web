/**
 * useInlineEdit - Manages inline edit state for text fields.
 *
 * Handles toggling between display and edit modes,
 * tracking draft text, committing changes, and canceling edits.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import type { TextInput } from 'react-native';

interface UseInlineEditOptions {
  value: string;
  onCommit: (newValue: string) => void;
  validate?: (newValue: string) => boolean;
}

export interface UseInlineEditResult {
  isEditing: boolean;
  draftValue: string;
  startEditing: () => void;
  commitEdit: () => void;
  cancelEdit: () => void;
  handleChange: (text: string) => void;
  handleKeyPress: (key: string) => void;
  inputRef: React.RefObject<TextInput | null>;
}

const DEFAULT_VALIDATE = (v: string): boolean => v.trim() !== '';

export function useInlineEdit({ value, onCommit, validate }: UseInlineEditOptions): UseInlineEditResult {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const inputRef = useRef<TextInput | null>(null);
  const validateFn = validate ?? DEFAULT_VALIDATE;

  useEffect(() => {
    if (!isEditing) setDraftValue(value);
  }, [value, isEditing]);

  const startEditing = useCallback(() => {
    setDraftValue(value);
    setIsEditing(true);
  }, [value]);

  const commitEdit = useCallback(() => {
    const trimmed = draftValue.trim();
    if (!validateFn(trimmed)) return;
    setIsEditing(false);
    if (trimmed !== value) onCommit(trimmed);
  }, [draftValue, validateFn, value, onCommit]);

  const cancelEdit = useCallback(() => {
    setDraftValue(value);
    setIsEditing(false);
  }, [value]);

  const handleChange = useCallback((text: string) => { setDraftValue(text); }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'Enter') commitEdit();
    if (key === 'Escape') cancelEdit();
  }, [commitEdit, cancelEdit]);

  return { isEditing, draftValue, startEditing, commitEdit, cancelEdit, handleChange, handleKeyPress, inputRef };
}
