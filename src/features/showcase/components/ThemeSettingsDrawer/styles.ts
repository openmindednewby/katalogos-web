/**
 * CSS styles for the Theme Settings Drawer.
 * Injected into the document head on web platform.
 */

import { isValueDefined } from '../../../../shared/utils/validators';

const DRAWER_WIDTH_PX = 320;
const SWATCH_HEIGHT_PX = 32;
const TOGGLE_SIZE_PX = 40;

export const themeDrawerStyles = `
  .theme-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: ${DRAWER_WIDTH_PX}px;
    height: 100vh;
    background: var(--drawer-bg, #ffffff);
    border-left: 1px solid var(--drawer-border, #e2e8f0);
    z-index: 50;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
  }

  .theme-drawer--collapsed {
    transform: translateX(${DRAWER_WIDTH_PX}px);
  }

  .theme-drawer__toggle {
    position: fixed;
    top: 80px;
    right: 0;
    width: ${TOGGLE_SIZE_PX}px;
    height: ${TOGGLE_SIZE_PX}px;
    border: 1px solid var(--drawer-border, #e2e8f0);
    border-right: none;
    border-radius: 8px 0 0 8px;
    background: var(--drawer-bg, #ffffff);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 51;
    font-size: 18px;
    transition: right 0.3s ease;
  }

  .theme-drawer__toggle--open {
    right: ${DRAWER_WIDTH_PX}px;
  }

  .theme-drawer__tabs {
    display: flex;
    border-bottom: 1px solid var(--drawer-border, #e2e8f0);
  }

  .theme-drawer__tab {
    flex: 1;
    padding: 12px 16px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--drawer-text-muted, #64748b);
    transition: color 0.2s, border-bottom 0.2s;
    border-bottom: 2px solid transparent;
  }

  .theme-drawer__tab--active {
    color: var(--drawer-text, #0f172a);
    border-bottom-color: var(--drawer-accent, #3b82f6);
  }

  .theme-drawer__content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .theme-drawer__preset-card {
    border: 2px solid var(--drawer-border, #e2e8f0);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .theme-drawer__preset-card--active {
    border-color: var(--drawer-accent, #3b82f6);
  }

  .theme-drawer__color-strip {
    display: flex;
    overflow: hidden;
    border-radius: 4px;
    height: ${SWATCH_HEIGHT_PX}px;
    margin-bottom: 8px;
  }

  .theme-drawer__color-strip > div {
    flex: 1;
  }

  .theme-drawer__preset-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--drawer-text, #0f172a);
  }

  .theme-drawer__checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: var(--drawer-text, #0f172a);
  }
`;

/**
 * Injects theme drawer CSS into the document head.
 * Idempotent: only injects once.
 */
export function injectThemeDrawerStyles(): void {
  if (typeof document === 'undefined') return;

  const styleId = 'theme-drawer-styles';
  if (isValueDefined(document.getElementById(styleId))) return;

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = themeDrawerStyles;
  document.head.appendChild(styleElement);
}
