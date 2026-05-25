


/**
 * HeaderEditor Component
 *
 * A component for editing HeaderSettings for menu customization.
 * Allows configuration of logo display, positioning, and title settings.
 */
import React, { useCallback } from 'react';

import { Switch, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import HeaderEditorPreview from './HeaderEditorPreview';
import HeaderLogoSizeSelector from './HeaderLogoSizeSelector';
import HeaderPositionSelector from './HeaderPositionSelector';
import SliderRow from './SliderRow';
import ThemeMode from '../../../../shared/enums/ThemeMode';
import { TestIds } from '../../../../shared/testIds';
import { themePalette } from '../../../../theme/utils/styles';
import HorizontalPosition from '../../../../types/enums/HorizontalPosition';
import LogoSize from '../../../../types/enums/LogoSize';
import { headerEditorStyles as styles } from '../utils/headerEditorStyles';

import type { RootState } from '../../../../store/reduxStore';
import type { HeaderSettings } from '../../../../types/menuStyleTypes';

// =============================================================================
// Types
// =============================================================================

interface Props {
  value: HeaderSettings;
  onChange: (value: HeaderSettings) => void;
  disabled?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const MIN_BANNER_HEIGHT = 100;
const MAX_BANNER_HEIGHT = 400;
const BANNER_HEIGHT_STEP = 20;
const DEFAULT_BANNER_HEIGHT = 200;

// =============================================================================
// Main Component
// =============================================================================

const HeaderEditor: React.FC<Props> = ({ value, onChange, disabled = false }) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const textColor = String(colors.text);
  const textSecondary = String(colors.subtext);
  const borderColor = String(colors.border);
  const bgColor = String(colors.surface);
  const accentColor = String(colors.primary);

  // Current values with defaults
  const showLogo = value.showLogo ?? false;
  const logoPosition = value.logoPosition ?? HorizontalPosition.Center;
  const logoSize = value.logoSize ?? LogoSize.Medium;
  const bannerHeight = value.bannerHeight ?? DEFAULT_BANNER_HEIGHT;
  const showMenuName = value.showMenuName ?? true;
  const showMenuDescription = value.showMenuDescription ?? true;
  const titlePosition = value.titlePosition ?? HorizontalPosition.Center;

  // Handlers
  const handleShowLogoChange = useCallback(
    (enabled: boolean) => onChange({ ...value, showLogo: enabled }),
    [onChange, value],
  );

  const handleLogoPositionChange = useCallback(
    (position: HorizontalPosition) => {
      if (!disabled) onChange({ ...value, logoPosition: position });
    },
    [onChange, value, disabled],
  );

  const handleLogoSizeChange = useCallback(
    (size: LogoSize) => {
      if (!disabled) onChange({ ...value, logoSize: size });
    },
    [onChange, value, disabled],
  );

  const handleBannerHeightChange = useCallback(
    (height: number) => onChange({ ...value, bannerHeight: height }),
    [onChange, value],
  );

  const handleShowMenuNameChange = useCallback(
    (enabled: boolean) => onChange({ ...value, showMenuName: enabled }),
    [onChange, value],
  );

  const handleShowMenuDescriptionChange = useCallback(
    (enabled: boolean) => onChange({ ...value, showMenuDescription: enabled }),
    [onChange, value],
  );

  const handleTitlePositionChange = useCallback(
    (position: HorizontalPosition) => {
      if (!disabled) onChange({ ...value, titlePosition: position });
    },
    [onChange, value, disabled],
  );

  const labelStyle: TextStyle = { color: textColor };

  return (
    <View style={styles.container} testID={TestIds.HEADER_EDITOR}>
      <Text style={[styles.sectionTitle, labelStyle]}>
        {FM('headerEditor.title')}
      </Text>

      <HeaderEditorPreview
        logoPosition={logoPosition}
        logoSize={logoSize}
        showLogo={showLogo}
        showMenuDescription={showMenuDescription}
        showMenuName={showMenuName}
        textColor={textColor}
        textSecondary={textSecondary}
        titlePosition={titlePosition}
      />

      <View style={styles.controlsContainer}>
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, labelStyle]}>
            {FM('headerEditor.showLogo')}
          </Text>
          <Switch
            accessibilityHint={FM('headerEditor.showLogoHint')}
            accessibilityLabel={FM('headerEditor.showLogoLabel')}
            disabled={disabled}
            testID={TestIds.HEADER_EDITOR_SHOW_LOGO_TOGGLE}
            value={showLogo}
            onValueChange={handleShowLogoChange}
          />
        </View>

        {showLogo ? (
          <HeaderPositionSelector
            accentColor={accentColor}
            activeValue={logoPosition}
            bgColor={bgColor}
            borderColor={borderColor}
            disabled={disabled}
            label={FM('headerEditor.logoPosition')}
            testIdPrefix="logo-position"
            textColor={textColor}
            onChange={handleLogoPositionChange}
          />
        ) : null}

        {showLogo ? (
          <HeaderLogoSizeSelector
            accentColor={accentColor}
            activeValue={logoSize}
            bgColor={bgColor}
            borderColor={borderColor}
            disabled={disabled}
            label={FM('headerEditor.logoSize')}
            textColor={textColor}
            onChange={handleLogoSizeChange}
          />
        ) : null}

        <SliderRow
          accessibilityHint={FM('headerEditor.bannerHeightHint')}
          accessibilityLabel={FM('headerEditor.bannerHeight')}
          bgColor={bgColor}
          borderColor={borderColor}
          disabled={disabled}
          label={FM('headerEditor.bannerHeight')}
          max={MAX_BANNER_HEIGHT}
          min={MIN_BANNER_HEIGHT}
          step={BANNER_HEIGHT_STEP}
          testIdPrefix={TestIds.HEADER_EDITOR_BANNER_HEIGHT_SLIDER}
          textColor={textColor}
          value={bannerHeight}
          onChange={handleBannerHeightChange}
        />

        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, labelStyle]}>
            {FM('headerEditor.showMenuName')}
          </Text>
          <Switch
            accessibilityHint={FM('headerEditor.showMenuNameHint')}
            accessibilityLabel={FM('headerEditor.showMenuNameLabel')}
            disabled={disabled}
            testID={TestIds.HEADER_EDITOR_SHOW_MENU_NAME_TOGGLE}
            value={showMenuName}
            onValueChange={handleShowMenuNameChange}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, labelStyle]}>
            {FM('headerEditor.showMenuDescription')}
          </Text>
          <Switch
            accessibilityHint={FM('headerEditor.showMenuDescriptionHint')}
            accessibilityLabel={FM('headerEditor.showMenuDescriptionLabel')}
            disabled={disabled}
            testID={TestIds.HEADER_EDITOR_SHOW_MENU_DESCRIPTION_TOGGLE}
            value={showMenuDescription}
            onValueChange={handleShowMenuDescriptionChange}
          />
        </View>

        <HeaderPositionSelector
          accentColor={accentColor}
          activeValue={titlePosition}
          bgColor={bgColor}
          borderColor={borderColor}
          disabled={disabled}
          label={FM('headerEditor.titlePosition')}
          testIdPrefix="title-position"
          textColor={textColor}
          onChange={handleTitlePositionChange}
        />
      </View>
    </View>
  );
};

export default HeaderEditor;
