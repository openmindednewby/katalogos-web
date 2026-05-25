import { Platform } from 'react-native';

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function findTargetElement(testId: string): HTMLElement | null {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
  return document.querySelector(`[data-testid="${testId}"]`);
}

export function getTargetRect(testId: string): TargetRect | null {
  const element = findTargetElement(testId);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

export function scrollTargetIntoView(testId: string): void {
  const element = findTargetElement(testId);
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
