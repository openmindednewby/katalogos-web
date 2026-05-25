/**
 * LocationCard - Displays a single location with name, city, badges, and edit/delete actions.
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../../utils/is';
import {
  SECTION_SPACING,
  TITLE_FONT_SIZE,
  DESCRIPTION_FONT_SIZE,
  SMALL_SPACING,
  MEDIUM_SPACING,
} from '../../constants';

import type { LocationDto } from '../../../../lib/hooks/location';

interface Props {
  location: LocationDto;
  onEdit: (location: LocationDto) => void;
  onDelete: (externalId: string) => void;
  disabled?: boolean;
}

const CARD_BORDER_WIDTH = 1;
const CARD_BORDER_RADIUS = 8;
const BADGE_PADDING_H = 8;
const BADGE_PADDING_V = 2;
const BADGE_BORDER_RADIUS = 4;
const BADGE_FONT_SIZE = 11;
const BADGE_FONT_WEIGHT = '600' as const;
const TITLE_FONT_WEIGHT = '600' as const;
const ACTION_FONT_SIZE = 13;
const ACTION_FONT_WEIGHT = '600' as const;

const styles = StyleSheet.create({
  card: {
    padding: SECTION_SPACING,
    borderWidth: CARD_BORDER_WIDTH,
    borderRadius: CARD_BORDER_RADIUS,
    marginBottom: MEDIUM_SPACING,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: { flex: 1 },
  name: { fontSize: TITLE_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT },
  city: { fontSize: DESCRIPTION_FONT_SIZE, marginTop: SMALL_SPACING },
  badgeRow: { flexDirection: 'row', gap: SMALL_SPACING, marginTop: SMALL_SPACING },
  badge: {
    paddingHorizontal: BADGE_PADDING_H,
    paddingVertical: BADGE_PADDING_V,
    borderRadius: BADGE_BORDER_RADIUS,
  },
  badgeText: { fontSize: BADGE_FONT_SIZE, fontWeight: BADGE_FONT_WEIGHT },
  actionsRow: {
    flexDirection: 'row',
    gap: MEDIUM_SPACING,
    marginTop: MEDIUM_SPACING,
  },
  actionText: { fontSize: ACTION_FONT_SIZE, fontWeight: ACTION_FONT_WEIGHT },
});

const LocationCard = ({ location, onEdit, onDelete, disabled = false }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];
  const successColor = theme.semantic.success['500'];

  const handleEdit = useCallback(() => onEdit(location), [onEdit, location]);

  const handleDelete = useCallback(() => {
    if (isValueDefined(location.externalId)) onDelete(location.externalId);
  }, [onDelete, location.externalId]);

  const cityDisplay = [location.city, location.state].filter(Boolean).join(', ');
  const isHQ = location.isHeadquarters === true;
  const isActive = location.isActive === true;
  const statusBadgeColor = isActive ? successColor : errorColor;

  return (
    <View
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}
      testID={TestIds.LOCATION_CARD}
    >
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} testID={TestIds.LOCATION_CARD_NAME}>
            {location.name ?? ''}
          </Text>
          {cityDisplay !== '' ? (
            <Text style={[styles.city, { color: colors.textSecondary }]} testID={TestIds.LOCATION_CARD_CITY}>
              {cityDisplay}
            </Text>
          ) : null}
          <View style={styles.badgeRow}>
            {isHQ ? (
              <View
                style={[styles.badge, { backgroundColor: primary }]}
                testID={TestIds.LOCATION_CARD_HQ_BADGE}
              >
                <Text style={[styles.badgeText, { color: colors.surface }]}>
                  {FM('settings.locations.headquartersBadge')}
                </Text>
              </View>
            ) : null}
            <View
              style={[styles.badge, { backgroundColor: statusBadgeColor }]}
              testID={TestIds.LOCATION_CARD_STATUS_BADGE}
            >
              <Text style={[styles.badgeText, { color: colors.surface }]}>
                {isActive
                  ? FM('settings.locations.activeBadge')
                  : FM('settings.locations.inactiveBadge')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          accessibilityHint={FM('settings.locations.editLocationHint')}
          accessibilityLabel={FM('settings.locations.editLocation')}
          accessibilityRole="button"
          disabled={disabled}
          testID={TestIds.LOCATION_CARD_EDIT_BUTTON}
          onPress={handleEdit}
        >
          <Text style={[styles.actionText, { color: primary }]}>
            {FM('common.edit')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityHint={FM('settings.locations.deleteLocationHint')}
          accessibilityLabel={FM('settings.locations.deleteLocation')}
          accessibilityRole="button"
          disabled={disabled}
          testID={TestIds.LOCATION_CARD_DELETE_BUTTON}
          onPress={handleDelete}
        >
          <Text style={[styles.actionText, { color: errorColor }]}>
            {FM('common.delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationCard;
