/**
 * Shared types for native form field components.
 */
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export type NativeInputProps = InputHTMLAttributes<HTMLInputElement>;
export type NativeSelectProps = SelectHTMLAttributes<HTMLSelectElement>;
export type NativeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface SelectOption {
  value: string;
  label: string;
}
