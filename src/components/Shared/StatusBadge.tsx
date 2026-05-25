/**
 * StatusBadge - unified status badge component.
 *
 * Accepts explicit label, color, and backgroundColor.
 * Domain-specific adapters (TenantStatusBadge, BillingStatusBadge, etc.)
 * map their enums to these props.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PADDING_H = 10;
const DEFAULT_PADDING_V = 4;
const DEFAULT_BORDER_RADIUS = 12;
const DEFAULT_FONT_SIZE = 12;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: DEFAULT_PADDING_H,
    paddingVertical: DEFAULT_PADDING_V,
    borderRadius: DEFAULT_BORDER_RADIUS,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: '600',
  },
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  label: string;
  color: string;
  backgroundColor: string;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const StatusBadge = ({
  label,
  color,
  backgroundColor,
  testID = TestIds.STATUS_LABEL,
  accessibilityLabel,
  accessibilityHint,
}: Props): React.ReactElement => {
  const dynamicBadge = useMemo(
    () => ({ backgroundColor }),
    [backgroundColor],
  );
  const dynamicText = useMemo(
    () => ({ color }),
    [color],
  );

  return (
    <View
      accessibilityHint={accessibilityHint ?? FM('common.statusBadgeHint')}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.badge, dynamicBadge]}
      testID={testID}
    >
      <Text style={[styles.text, dynamicText]}>{label}</Text>
    </View>
  );
};

export default StatusBadge;
