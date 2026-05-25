/**
 * CSS styles for the component showcase page.
 * Injected into the document head on web platform.
 */
import { isValueDefined } from '../../../../utils/is';

const STYLE_ID = 'component-showcase-styles';

const showcaseStyles = `
  .showcase-card {
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 8px;
    background: var(--color-surface, #fff);
  }
  .showcase-card__title {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 600;
  }
  .showcase-card__desc {
    margin: 0 0 8px;
    opacity: 0.7;
    font-size: 14px;
  }
  .showcase-card__import {
    display: block;
    font-size: 12px;
    opacity: 0.5;
    margin-bottom: 12px;
  }
  .showcase-card__demo {
    padding: 12px;
    border: 1px dashed var(--color-border, #e0e0e0);
    border-radius: 6px;
  }
  .showcase-page__desc {
    opacity: 0.7;
    margin-bottom: 24px;
  }
  .showcase-skeleton-clip {
    max-height: 200px;
    overflow: hidden;
  }
`;

/** Inject showcase styles into the document head. Web-only. */
export function injectShowcaseComponentStyles(): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(STYLE_ID);
  if (isValueDefined(existing)) return;

  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = showcaseStyles;
  document.head.appendChild(el);
}
