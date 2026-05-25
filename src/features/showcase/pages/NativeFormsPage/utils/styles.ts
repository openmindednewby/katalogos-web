/**
 * CSS styles for native forms.
 * Uses CSS variables for theming.
 * Injected into the page head on web platform.
 *
 * Split into sub-modules for maintainability:
 * - inputStyles.ts: Input, select, textarea, combobox, checkbox, password styles
 * - buttonAndLayoutStyles.ts: Button, card, and page layout styles
 * - animationStyles.ts: Animation keyframes and transitions
 */
import { nativeFormAnimationStyles } from './animationStyles';
import { nativeFormButtonStyles, nativeFormLayoutStyles } from './buttonAndLayoutStyles';
import { nativeFormInputStyles } from './inputStyles';
import { isValueDefined } from '../../../../../shared/utils/validators';

export const nativeFormStyles = nativeFormInputStyles + nativeFormButtonStyles + nativeFormLayoutStyles;

/**
 * Injects the native form styles into the document head.
 * Only executes on web platform.
 */
export function injectNativeFormStyles(): void {
  if (typeof document === 'undefined') return;

  const styleId = 'native-form-styles';
  const existingStyle = document.getElementById(styleId);
  if (isValueDefined(existingStyle)) return;

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = nativeFormStyles + nativeFormAnimationStyles;
  document.head.appendChild(styleElement);
}
