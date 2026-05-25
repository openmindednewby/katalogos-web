/* eslint-disable react-native/no-raw-text, i18next/no-literal-string, react/jsx-no-literals */
/**
 * Theme Settings Drawer for showcase pages.
 * Provides preset theme selection and layout controls.
 * Web-only component using native HTML elements.
 */
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_ACTIVE_PRESET_INDEX, THEME_PRESETS } from './presets';
import { injectThemeDrawerStyles } from './styles';
import { TestIds } from '../../../../shared/testIds';

const enum DrawerTab {
  Presets = 'presets',
  Layout = 'layout',
}

const DEFAULT_MAX_WIDTH = '1440px';
const FULL_WIDTH_MAX_WIDTH = 'none';

// ---------------------------------------------------------------------------
// Sub-components (defined before main to satisfy no-use-before-define)
// ---------------------------------------------------------------------------

interface PresetsTabProps {
  activePresetIndex: number;
  onSelectPreset: (index: number) => void;
}

/* eslint-disable react/no-array-index-key -- intentional: index keys fix Bug 2 (duplicate color values) */
const PresetsTabContent = ({ activePresetIndex, onSelectPreset }: PresetsTabProps): ReactElement => (
  <>
    {THEME_PRESETS.map((preset, presetIndex) => {
      const isActive = presetIndex === activePresetIndex;
      const cardClassName = isActive
        ? 'theme-drawer__preset-card theme-drawer__preset-card--active'
        : 'theme-drawer__preset-card';

      return (
        <div
          key={presetIndex}
          aria-pressed={isActive}
          className={cardClassName}
          data-testid={TestIds.STUDIO_THEME_PRESET_CARD}
          role="button"
          tabIndex={0}
          onClick={() => onSelectPreset(presetIndex)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelectPreset(presetIndex);
          }}
        >
          <div className="flex overflow-hidden theme-drawer__color-strip">
            {preset.colors.map((color, colorIndex) => (
              <div
                key={`${presetIndex}-${colorIndex}`}
                className="flex-1"
                style={{ backgroundColor: `rgb(${color})` }}
              />
            ))}
          </div>
          <span className="font-medium theme-drawer__preset-name">{preset.name}</span>
        </div>
      );
    })}
  </>
);
/* eslint-enable react/no-array-index-key */

interface LayoutTabProps {
  isFullWidth: boolean;
  onCheckboxChange: () => void;
}

const LayoutTabContent = ({ isFullWidth, onCheckboxChange }: LayoutTabProps): ReactElement => (
  <label
    className="theme-drawer__checkbox-label"
    data-testid={TestIds.STUDIO_LAYOUT_FULL_WIDTH_CHECKBOX}
  >
    <input
      checked={isFullWidth}
      type="checkbox"
      onChange={onCheckboxChange}
    />
    <span>Content Full Width</span>
  </label>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  isFullWidth: boolean;
  onFullWidthChange: (isFullWidth: boolean) => void;
}

const ThemeSettingsDrawer = ({ isFullWidth, onFullWidthChange }: Props): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<DrawerTab>(DrawerTab.Presets);
  const [activePresetIndex, setActivePresetIndex] = useState(DEFAULT_ACTIVE_PRESET_INDEX);

  useEffect(() => {
    injectThemeDrawerStyles();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const maxWidth = isFullWidth ? FULL_WIDTH_MAX_WIDTH : DEFAULT_MAX_WIDTH;
    document.documentElement.style.setProperty('--content-max-width', maxWidth);
  }, [isFullWidth]);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleCheckboxChange = useCallback(() => {
    onFullWidthChange(!isFullWidth);
  }, [isFullWidth, onFullWidthChange]);

  const drawerClassName = isExpanded ? 'theme-drawer' : 'theme-drawer theme-drawer--collapsed';
  const toggleClassName = isExpanded
    ? 'theme-drawer__toggle theme-drawer__toggle--open'
    : 'theme-drawer__toggle';

  return (
    <div data-testid={TestIds.STUDIO_THEME_SETTINGS_DRAWER}>
      <button
        aria-expanded={isExpanded}
        aria-label="Toggle theme settings"
        className={toggleClassName}
        data-testid={TestIds.STUDIO_THEME_CLOSE_BTN}
        onClick={handleToggle}
      >
        {isExpanded ? '\u00BB' : '\u00AB'}
      </button>

      <div className={drawerClassName}>
        <div className="theme-drawer__tabs">
          <button
            aria-selected={activeTab === DrawerTab.Presets}
            className={activeTab === DrawerTab.Presets
              ? 'theme-drawer__tab theme-drawer__tab--active'
              : 'theme-drawer__tab'}
            data-testid={TestIds.STUDIO_THEME_TAB_PRESETS}
            role="tab"
            onClick={() => setActiveTab(DrawerTab.Presets)}
          >
            Presets
          </button>
          <button
            aria-selected={activeTab === DrawerTab.Layout}
            className={activeTab === DrawerTab.Layout
              ? 'theme-drawer__tab theme-drawer__tab--active'
              : 'theme-drawer__tab'}
            data-testid={TestIds.STUDIO_THEME_TAB_LAYOUT}
            role="tab"
            onClick={() => setActiveTab(DrawerTab.Layout)}
          >
            Layout
          </button>
        </div>

        <div className="theme-drawer__content">
          {activeTab === DrawerTab.Presets && (
            <PresetsTabContent
              activePresetIndex={activePresetIndex}
              onSelectPreset={setActivePresetIndex}
            />
          )}
          {activeTab === DrawerTab.Layout && (
            <LayoutTabContent
              isFullWidth={isFullWidth}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsDrawer;
