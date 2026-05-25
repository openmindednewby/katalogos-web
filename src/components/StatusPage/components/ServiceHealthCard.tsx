/**
 * Individual service health card showing status, response time, and last checked time.
 */

import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '../../../localization/helpers';
import { StatusPageTestIds } from '../../../shared/testIds/statusPageTestIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../utils/is';
import { statusToColor, statusToLabelKey } from '../utils/statusHelpers';

import type { ServiceHealthResult } from '../types';

const STATUS_DOT_SIZE = 12;
const STATUS_DOT_BORDER_RADIUS = STATUS_DOT_SIZE / 2;
const CARD_PADDING = 16;
const CARD_BORDER_RADIUS = 8;
const CARD_MARGIN_BOTTOM = 12;
const NAME_FONT_SIZE = 16;
const STATUS_FONT_SIZE = 14;
const DETAIL_FONT_SIZE = 12;
const DOT_MARGIN_RIGHT = 8;
const BORDER_WIDTH = 1;
const DETAIL_ROW_MARGIN_TOP = 4;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    marginBottom: CARD_MARGIN_BOTTOM,
    borderWidth: BORDER_WIDTH,
  },
  statusDot: {
    width: STATUS_DOT_SIZE,
    height: STATUS_DOT_SIZE,
    borderRadius: STATUS_DOT_BORDER_RADIUS,
    marginRight: DOT_MARGIN_RIGHT,
  },
  infoContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: NAME_FONT_SIZE,
    fontWeight: '600',
  },
  statusLabel: {
    fontSize: STATUS_FONT_SIZE,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: DETAIL_ROW_MARGIN_TOP,
  },
  detailText: {
    fontSize: DETAIL_FONT_SIZE,
  },
});

interface Props {
  result: ServiceHealthResult;
  nameKey: string;
}

const ServiceHealthCard = ({ result, nameKey }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const statusColors = {
    success: theme.semantic.success['500'],
    warning: theme.semantic.warning['500'],
    error: theme.semantic.error['500'],
    muted: colors.textSecondary,
  };
  const dotColor = statusToColor(result.status, statusColors);
  const labelKey = statusToLabelKey(result.status);
  const serviceName = FM(nameKey);

  const lastCheckedDate = new Date(result.lastCheckedAt);
  const timeString = lastCheckedDate.toLocaleTimeString();

  return (
    <View
      accessibilityHint={FM('statusPage.serviceCardHint', serviceName)}
      accessibilityLabel={FM('statusPage.serviceCardLabel', serviceName, FM(labelKey))}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={StatusPageTestIds.SERVICE_CARD}
    >
      <View
        style={[styles.statusDot, { backgroundColor: dotColor }]}
        testID={StatusPageTestIds.SERVICE_STATUS_INDICATOR}
      />
      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          <Text
            style={[styles.serviceName, { color: colors.text }]}
            testID={StatusPageTestIds.SERVICE_NAME}
          >
            {serviceName}
          </Text>
          <Text style={[styles.statusLabel, { color: dotColor }]}>
            {FM(labelKey)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          {isValueDefined(result.responseTimeMs) ? (
            <Text
              style={[styles.detailText, { color: colors.textSecondary }]}
              testID={StatusPageTestIds.SERVICE_RESPONSE_TIME}
            >
              {FM('statusPage.responseTime', String(result.responseTimeMs))}
            </Text>
          ) : null}
          <Text
            style={[styles.detailText, { color: colors.textSecondary }]}
            testID={StatusPageTestIds.SERVICE_LAST_CHECKED}
          >
            {FM('statusPage.lastChecked', timeString)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ServiceHealthCard;
