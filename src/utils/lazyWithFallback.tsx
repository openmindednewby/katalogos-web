/**
 * Lazy loading utility with built-in Suspense and error boundary.
 *
 * Simplifies lazy loading of components by wrapping them with
 * Suspense and providing a consistent loading fallback.
 */
import React, { Suspense, type ComponentType, type ReactElement } from 'react';

import LoadingFallback from '../components/Shared/Fallbacks/LoadingFallback';

interface LazyWrapperProps {
  children: ReactElement;
  fullScreen?: boolean;
}

/**
 * Wrapper component that provides Suspense with a loading fallback.
 */
const LazyWrapper: React.FC<LazyWrapperProps> = ({ children, fullScreen = false }) => {
  return <Suspense fallback={<LoadingFallback fullScreen={fullScreen} />}>{children}</Suspense>;
};

/**
 * Creates a lazy-loaded component with built-in Suspense boundary.
 *
 * @example
 * const LazyMenuEditor = createLazyComponent(
 *   () => import('./MenuEditor'),
 *   { fullScreen: true }
 * );
 *
 * // Usage
 * <LazyMenuEditor visible={true} />
 */
function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: { fullScreen?: boolean } = {},
): React.FC<P> {
  const LazyComponent = React.lazy(importFn);

  const WrappedComponent: React.FC<P> = (props) => (
    <LazyWrapper fullScreen={options.fullScreen}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );

  return WrappedComponent;
}

export { LazyWrapper, createLazyComponent };
export default LazyWrapper;
