/**
 * Lazy exports for Styling components.
 *
 * These components are heavy (use react-native-paper, color pickers, etc.)
 * and should be lazy loaded to reduce initial bundle size.
 *
 * Usage:
 * ```
 * import { lazy } from 'react';
 * const GlobalStylingTab = lazy(() => import('./Styling').then(m => ({ default: m.GlobalStylingTab })));
 * ```
 *
 * Or use the pre-configured lazy exports:
 * ```
 * import { LazyGlobalStylingTab } from './Styling';
 * ```
 */
import { lazy } from 'react';

// Direct exports for synchronous imports (use sparingly)
export { default as GlobalStylingTab } from './components/GlobalStylingTab';
export { default as ImportExportButtons } from './components/ImportExportButtons';
export { default as LayoutTemplateSelector } from './components/LayoutTemplateSelector';
export { default as ColorSchemeEditor } from './components/ColorSchemeEditor';
export { default as TypographyEditor } from './components/TypographyEditor';
export { default as MediaPositionEditor } from './components/MediaPositionEditor';
export { default as HeaderEditor } from './components/HeaderEditor';
export { default as SpacingEditor } from './components/SpacingEditor';
export { default as CollapsibleSection } from './components/CollapsibleSection';

// Lazy exports for code splitting
export const LazyGlobalStylingTab = lazy(async () => import('./components/GlobalStylingTab'));
export const LazyColorSchemeEditor = lazy(async () => import('./components/ColorSchemeEditor'));
export const LazyTypographyEditor = lazy(async () => import('./components/TypographyEditor'));
export const LazyMediaPositionEditor = lazy(async () => import('./components/MediaPositionEditor'));
export const LazyHeaderEditor = lazy(async () => import('./components/HeaderEditor'));
export const LazySpacingEditor = lazy(async () => import('./components/SpacingEditor'));
export const LazyLayoutTemplateSelector = lazy(async () => import('./components/LayoutTemplateSelector'));
