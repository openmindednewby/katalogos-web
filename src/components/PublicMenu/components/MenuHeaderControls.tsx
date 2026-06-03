/** Header row controls: location picker and language switcher for the public menu. */
import React from 'react';

import { LanguageSwitcher } from './LanguageSwitcher';
import { LocationPicker } from './LocationPicker';
import { isValueDefined } from '../../../utils/is';

import type { PublicMenuLocation } from '../hooks/usePublicMenuLocation';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';

export interface MenuHeaderControlsProps {
  theme: PublicMenuTheme;
  hasLocationPicker: boolean;
  hasLanguageSwitcher: boolean;
  locations?: PublicMenuLocation[];
  selectedLocationId?: string;
  onLocationChange?: (locationId: string) => void;
  availableLanguages?: Array<{ code: string; name: string }>;
  currentLanguage?: string;
  onLanguageChange?: (code: string) => void;
}

export const MenuHeaderControls = ({
  theme, hasLocationPicker, hasLanguageSwitcher,
  locations, selectedLocationId, onLocationChange,
  availableLanguages, currentLanguage, onLanguageChange,
}: MenuHeaderControlsProps): React.ReactElement | null => {
  if (!hasLocationPicker && !hasLanguageSwitcher) return null;
  // The has* flags imply the corresponding data props are defined (caller invariant);
  // the explicit checks below let TypeScript narrow the optional props to non-undefined.
  const showLocationPicker = hasLocationPicker && isValueDefined(locations) && isValueDefined(onLocationChange);
  const showLanguageSwitcher = hasLanguageSwitcher && isValueDefined(availableLanguages) && isValueDefined(onLanguageChange);
  return (
    <>
      {showLocationPicker ? (
        <LocationPicker
          accentColor={theme.colors.accent}
          borderColor={theme.colors.divider}
          locations={locations}
          selectedLocationId={selectedLocationId ?? ''}
          surfaceColor={theme.colors.surface}
          textColor={theme.colors.text}
          onLocationChange={onLocationChange}
        />
      ) : null}
      {showLanguageSwitcher ? (
        <LanguageSwitcher
          accentColor={theme.colors.accent}
          availableLanguages={availableLanguages}
          borderColor={theme.colors.divider}
          currentLanguage={currentLanguage ?? ''}
          surfaceColor={theme.colors.surface}
          textColor={theme.colors.text}
          onLanguageChange={onLanguageChange}
        />
      ) : null}
    </>
  );
};
