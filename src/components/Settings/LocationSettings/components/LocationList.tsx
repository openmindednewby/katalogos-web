/**
 * LocationList - Renders a list of LocationCards or an empty state message.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import LocationCard from './LocationCard';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { BODY_FONT_SIZE, SECTION_SPACING } from '../../constants';

import type { LocationDto } from '../../../../lib/hooks/location';

interface Props {
  locations: LocationDto[];
  onEdit: (location: LocationDto) => void;
  onDelete: (externalId: string) => void;
  disabled?: boolean;
}

const EMPTY_STATE_PADDING = 32;

const styles = StyleSheet.create({
  container: { marginTop: SECTION_SPACING },
  emptyState: {
    padding: EMPTY_STATE_PADDING,
    alignItems: 'center',
  },
  emptyText: { fontSize: BODY_FONT_SIZE, textAlign: 'center' },
});

const LocationList = ({ locations, onEdit, onDelete, disabled = false }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  if (locations.length === 0)
    return (
      <View style={styles.emptyState} testID={TestIds.LOCATION_EMPTY_STATE}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {FM('settings.locations.emptyState')}
        </Text>
      </View>
    );

  return (
    <View style={styles.container} testID={TestIds.LOCATION_LIST}>
      {locations.map((loc) => (
        <LocationCard
          key={loc.externalId}
          disabled={disabled}
          location={loc}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </View>
  );
};

export default LocationList;
