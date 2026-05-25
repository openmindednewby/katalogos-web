/**
 * Layout wrapper for showcase pages.
 * Provides the main content area with the Theme Settings Drawer.
 * Manages the full-width layout state and corresponding CSS classes.
 */
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';

import ThemeSettingsDrawer from '../ThemeSettingsDrawer';
import { injectShowcaseLayoutStyles } from './styles';

const DEFAULT_MAX_WIDTH = '1440px';

interface Props {
  children: ReactNode;
}

const ShowcaseLayout = ({ children }: Props): ReactElement => {
  const [isFullWidth, setIsFullWidth] = useState(false);

  useEffect(() => {
    injectShowcaseLayoutStyles();
    if (typeof document !== 'undefined')
      document.documentElement.style.setProperty('--content-max-width', DEFAULT_MAX_WIDTH);
  }, []);

  const handleFullWidthChange = useCallback((fullWidth: boolean) => {
    setIsFullWidth(fullWidth);
  }, []);

  const mainClassName = isFullWidth
    ? 'showcase-layout__main p-2'
    : 'showcase-layout__main p-6';
  const containerClassName = isFullWidth ? 'max-w-content' : 'max-w-content mx-auto';

  return (
    <div className="showcase-layout">
      <div className={mainClassName} id="main-content">
        <div className={containerClassName}>
          {children}
        </div>
      </div>
      <ThemeSettingsDrawer
        isFullWidth={isFullWidth}
        onFullWidthChange={handleFullWidthChange}
      />
    </div>
  );
};

export default ShowcaseLayout;
