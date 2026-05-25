/**
 * StatusPage: displays live health status for all backend services.
 *
 * Polls each service's /health/ready endpoint via useServiceHealth and
 * renders an overall status banner plus individual ServiceHealthCard entries.
 */

import React from 'react';

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ServiceHealthCard from './components/ServiceHealthCard';
import { useServiceHealth } from './hooks/useServiceHealth';
import {
  SERVICE_CONFIGS,
  overallStatusToMessageKey,
  statusToColor,
} from './utils/statusHelpers';
import { FM } from '../../localization/helpers';
import { StatusPageTestIds } from '../../shared/testIds/statusPageTestIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';

const PAGE_PADDING = 20;
const TITLE_FONT_SIZE = 24;
const TITLE_MARGIN_BOTTOM = 20;
const BANNER_PADDING = 16;
const BANNER_BORDER_RADIUS = 12;
const BANNER_MARGIN_BOTTOM = 24;
const BANNER_FONT_SIZE = 16;
const BUTTON_PADDING_VERTICAL = 10;
const BUTTON_PADDING_HORIZONTAL = 20;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_FONT_SIZE = 14;
const BUTTON_MARGIN_TOP = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: PAGE_PADDING,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  banner: {
    padding: BANNER_PADDING,
    borderRadius: BANNER_BORDER_RADIUS,
    marginBottom: BANNER_MARGIN_BOTTOM,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: BANNER_FONT_SIZE,
    fontWeight: '600',
  },
  refreshButton: {
    paddingVertical: BUTTON_PADDING_VERTICAL,
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignSelf: 'center',
    marginTop: BUTTON_MARGIN_TOP,
    marginBottom: BUTTON_MARGIN_TOP,
  },
  refreshText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '600',
  },
});

const BANNER_OPACITY = 0.15;

const StatusPage = (): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const statusColors = {
    success: theme.semantic.success['500'],
    warning: theme.semantic.warning['500'],
    error: theme.semantic.error['500'],
    muted: colors.textSecondary,
  };
  const { status, services, isRefreshing, refresh } = useServiceHealth();

  const bannerColor = statusToColor(status, statusColors);
  const bannerMessageKey = overallStatusToMessageKey(status);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      testID={StatusPageTestIds.STATUS_PAGE}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {FM('statusPage.title')}
      </Text>

      <View
        accessibilityHint={FM('statusPage.overallStatusHint')}
        accessibilityLabel={FM('statusPage.overallStatusLabel')}
        style={[styles.banner, { backgroundColor: bannerColor + toHexAlpha(BANNER_OPACITY) }]}
        testID={StatusPageTestIds.OVERALL_STATUS_BANNER}
      >
        <Text style={[styles.bannerText, { color: bannerColor }]}>
          {FM(bannerMessageKey)}
        </Text>
      </View>

      {SERVICE_CONFIGS.flatMap((config) => {
        const match = services.find((s) => s.serviceKey === config.key);
        return isValueDefined(match)
          ? [<ServiceHealthCard key={config.key} nameKey={config.nameKey} result={match} />]
          : [];
      })}

      <TouchableOpacity
        accessibilityHint={FM('statusPage.refreshHint')}
        accessibilityLabel={FM('statusPage.refresh')}
        accessibilityRole="button"
        disabled={isRefreshing}
        style={[styles.refreshButton, { backgroundColor: primary }]}
        testID={StatusPageTestIds.REFRESH_BUTTON}
        onPress={refresh}
      >
        <Text style={[styles.refreshText, { color: colors.background }]}>
          {isRefreshing ? FM('statusPage.refreshing') : FM('statusPage.refresh')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

/**
 * Convert a 0-1 opacity value to a 2-character hex alpha suffix.
 * For example, 0.15 => '26'.
 */
function toHexAlpha(opacity: number): string {
  const HEX_MAX = 255;
  const HEX_RADIX = 16;
  const PAD_LENGTH = 2;
  return Math.round(opacity * HEX_MAX).toString(HEX_RADIX).padStart(PAD_LENGTH, '0');
}

export default StatusPage;
