/**
 * Compact location dropdown for the public menu.
 * Only renders when the menu is available at multiple locations.
 *
 * WCAG: Escape closes the dropdown, accessibilityState reflects expanded state.
 */
import React, { useCallback, useState } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';

import { useEscapeKey } from '../../../hooks/useEscapeKey';
import { isValueDefined } from '../../../utils/is';

import type { PublicMenuLocation } from '../hooks/usePublicMenuLocation';

const DROPDOWN_SHADOW_OPACITY = 0.15;
const DROPDOWN_SHADOW_RADIUS = 8;
const DROPDOWN_ELEVATION = 4;
const OPTION_PADDING_V = 10;
const OPTION_PADDING_H = 16;
const BACKDROP_EXTEND = 9999;

const styles = StyleSheet.create({
  container: { position: 'relative', zIndex: 1000 },
  backdrop: {
    position: 'absolute',
    top: -BACKDROP_EXTEND,
    left: -BACKDROP_EXTEND,
    right: -BACKDROP_EXTEND,
    bottom: -BACKDROP_EXTEND,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  triggerText: { fontSize: 14, fontWeight: '500' },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    shadowOpacity: DROPDOWN_SHADOW_OPACITY,
    shadowRadius: DROPDOWN_SHADOW_RADIUS,
    elevation: DROPDOWN_ELEVATION,
    zIndex: 1000,
    minWidth: 200,
  },
  option: {
    paddingVertical: OPTION_PADDING_V,
    paddingHorizontal: OPTION_PADDING_H,
  },
  optionText: { fontSize: 14 },
  selectedOption: { fontWeight: '700' },
});

interface Props {
  locations: PublicMenuLocation[];
  selectedLocationId: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  onLocationChange: (locationId: string) => void;
}

function formatLocationDisplay(location: PublicMenuLocation): string {
  if (location.city !== '')
    return FM('publicMenu.location.locationWithCity', location.name, location.city);

  return location.name;
}

export const LocationPicker: React.FC<Props> = ({
  locations,
  selectedLocationId,
  surfaceColor,
  textColor,
  borderColor,
  accentColor,
  onLocationChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => { setIsOpen((prev) => !prev); }, []);
  const handleClose = useCallback(() => { setIsOpen(false); }, []);

  const handleSelect = useCallback((locationId: string) => {
    onLocationChange(locationId);
    setIsOpen(false);
  }, [onLocationChange]);

  useEscapeKey(handleClose, isOpen);

  if (locations.length === 0) return null;

  const currentLocation = locations.find((l) => l.id === selectedLocationId);
  const displayName = isValueDefined(currentLocation)
    ? formatLocationDisplay(currentLocation)
    : FM('publicMenu.location.allLocations');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityHint={FM('publicMenu.location.selectLocationHint')}
        accessibilityLabel={FM('publicMenu.location.locationLabel')}
        accessibilityState={{ expanded: isOpen }}
        style={[styles.trigger, { borderColor, backgroundColor: surfaceColor }]}
        testID={TestIds.PUBLIC_MENU_LOCATION_PICKER}
        onPress={handleToggle}
      >
        <Text style={[styles.triggerText, { color: textColor }]}>{displayName}</Text>
      </TouchableOpacity>

      {isOpen ? (
        <>
        <TouchableOpacity
          accessibilityHint={FM('publicMenu.dropdown.backdropHint')}
          accessibilityLabel={FM('publicMenu.dropdown.backdropLabel')}
          activeOpacity={1}
          style={styles.backdrop}
          testID={TestIds.PUBLIC_MENU_LOCATION_BACKDROP}
          onPress={handleClose}
        />
        <View
          accessibilityRole="menu"
          style={[styles.dropdown, { backgroundColor: surfaceColor, borderColor }]}
        >
          <TouchableOpacity
            accessibilityHint={FM('publicMenu.location.locationOptionHint')}
            accessibilityLabel={FM('publicMenu.location.allLocations')}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: selectedLocationId === '' }}
            style={styles.option}
            testID={`${TestIds.PUBLIC_MENU_LOCATION_OPTION}-all`}
            onPress={() => { handleSelect(''); }}
          >
            <Text style={[
              styles.optionText,
              { color: selectedLocationId === '' ? accentColor : textColor },
              selectedLocationId === '' ? styles.selectedOption : undefined,
            ]}>
              {FM('publicMenu.location.allLocations')}
            </Text>
          </TouchableOpacity>

          {locations.map((location) => {
            const isSelected = selectedLocationId === location.id;
            const label = formatLocationDisplay(location);
            return (
              <TouchableOpacity
                key={location.id}
                accessibilityHint={FM('publicMenu.location.locationOptionHint')}
                accessibilityLabel={label}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected }}
                style={styles.option}
                testID={`${TestIds.PUBLIC_MENU_LOCATION_OPTION}-${location.id}`}
                onPress={() => { handleSelect(location.id); }}
              >
                <Text style={[
                  styles.optionText,
                  { color: isSelected ? accentColor : textColor },
                  isSelected ? styles.selectedOption : undefined,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        </>
      ) : null}
    </View>
  );
};
