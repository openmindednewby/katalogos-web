/**
 * Shared types for native form field components.
 */
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export type NativeInputProps = InputHTMLAttributes<HTMLInputElement>;
export type NativeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface SelectOption {
  value: string;
  label: string;
}
