/**
 * LocationSelector - Dropdown for selecting which location's overrides to view/edit.
 * Shows "Base Menu" as default plus all tenant locations.
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { isValueDefined } from '@/utils/is';

import type { LocationDto } from '../types';

const SELECTED_BORDER_WIDTH = 2;

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  option: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, borderWidth: 1 },
  optionSelected: { borderWidth: SELECTED_BORDER_WIDTH },
  optionText: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
});

interface LocationOptionProps {
  location: LocationDto;
  isSelected: boolean;
  onSelect: (id: string) => void;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
}

const LocationOption: React.FC<LocationOptionProps> = ({
  location, isSelected, onSelect, borderColor, textColor, backgroundColor,
}) => {
  const handlePress = useCallback(() => { onSelect(location.externalId); }, [onSelect, location.externalId]);

  return (
    <TouchableOpacity
      accessibilityHint={FM('onlineMenus.locationOverrides.selectLocationHint')}
      accessibilityLabel={location.name}
      accessibilityRole="button"
      style={[
        styles.option,
        isSelected ? styles.optionSelected : undefined,
        { borderColor, backgroundColor },
      ]}
      testID={`${TestIds.LOCATION_SELECTOR_OPTION}-${location.externalId}`}
      onPress={handlePress}
    >
      <Text style={[styles.optionText, { color: textColor }]}>
        {location.name}
      </Text>
    </TouchableOpacity>
  );
};

interface LocationSelectorProps {
  locations: LocationDto[];
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string | null) => void;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  locations, selectedLocationId, onSelectLocation,
  borderColor, textColor, backgroundColor, primaryColor, textOnPrimary,
}) => {
  const handleBasePress = useCallback(() => { onSelectLocation(null); }, [onSelectLocation]);

  const isBaseSelected = !isValueDefined(selectedLocationId);

  return (
    <View testID={TestIds.LOCATION_SELECTOR}>
      <Text style={[styles.label, { color: textColor }]}>
        {FM('onlineMenus.locationOverrides.selectLocation')}
      </Text>
      <View style={styles.container}>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.locationOverrides.selectLocationHint')}
          accessibilityLabel={FM('onlineMenus.locationOverrides.baseMenu')}
          accessibilityRole="button"
          style={[
            styles.option,
            isBaseSelected ? styles.optionSelected : undefined,
            {
              borderColor: isBaseSelected ? primaryColor : borderColor,
              backgroundColor: isBaseSelected ? primaryColor : backgroundColor,
            },
          ]}
          testID={`${TestIds.LOCATION_SELECTOR_OPTION}-base`}
          onPress={handleBasePress}
        >
          <Text style={[styles.optionText, { color: isBaseSelected ? textOnPrimary : textColor }]}>
            {FM('onlineMenus.locationOverrides.baseMenu')}
          </Text>
        </TouchableOpacity>

        {locations.map((location) => {
          const isSelected = selectedLocationId === location.externalId;
          return (
            <LocationOption
              key={location.externalId}
              backgroundColor={isSelected ? primaryColor : backgroundColor}
              borderColor={isSelected ? primaryColor : borderColor}
              isSelected={isSelected}
              location={location}
              textColor={isSelected ? textOnPrimary : textColor}
              onSelect={onSelectLocation}
            />
          );
        })}
      </View>
    </View>
  );
};

export default LocationSelector;
