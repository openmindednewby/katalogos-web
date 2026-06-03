/**
 * CSS styles for the ShowcaseLayout wrapper.
 * Injected into the document head on web platform.
 */

import { isValueDefined } from '../../../../shared/utils/validators';

const showcaseLayoutStyles = `
  .showcase-layout {
    display: flex;
    flex-direction: row;
    width: 100%;
    min-height: 100%;
  }

  .showcase-layout__main {
    flex: 1;
    min-width: 0;
  }

  .p-6 {
    padding: 24px;
  }

  .p-2 {
    padding: 8px;
  }

  .max-w-content {
    max-width: var(--content-max-width, 1440px);
  }

  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
`;

/**
 * Injects showcase layout CSS into the document head.
 * Idempotent: only injects once.
 */
export function injectShowcaseLayoutStyles(): void {
  if (typeof document === 'undefined') return;

  const styleId = 'showcase-layout-styles';
  if (isValueDefined(document.getElementById(styleId))) return;

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = showcaseLayoutStyles;
  document.head.appendChild(styleElement);
}
