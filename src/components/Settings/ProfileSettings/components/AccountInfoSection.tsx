/**
 * Account Info Section.
 * Displays read-only role and tenant badges in the profile settings.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Section from '../../../Shared/Section';
import {
  SECTION_SPACING,
  TITLE_FONT_SIZE,
  TITLE_GAP,
  DESCRIPTION_FONT_SIZE,
  SMALL_SPACING,
} from '../constants';

const TITLE_FONT_WEIGHT = '600' as const;
const BADGE_PADDING_HORIZONTAL = 12;
const BADGE_PADDING_VERTICAL = 6;
const BADGE_BORDER_RADIUS = 4;
const BADGE_SPACING = 8;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: TITLE_FONT_WEIGHT,
    marginBottom: TITLE_GAP,
  },
  fieldLabel: {
    fontSize: DESCRIPTION_FONT_SIZE,
    marginBottom: TITLE_GAP,
  },
  badge: {
    paddingHorizontal: BADGE_PADDING_HORIZONTAL,
    paddingVertical: BADGE_PADDING_VERTICAL,
    borderRadius: BADGE_BORDER_RADIUS,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: DESCRIPTION_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT },
  badgeRow: { flexDirection: 'row', gap: BADGE_SPACING, marginTop: SMALL_SPACING },
  sectionGap: { marginTop: SECTION_SPACING },
});

interface Props {
  readonly roleName: string;
  readonly tenantId: string;
}

const AccountInfoSection = ({
  roleName,
  tenantId,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={styles.sectionGap}>
      <Section>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {FM('settings.profile.accountInfo')}
        </Text>

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
          {FM('settings.profile.role')}
        </Text>
        <View style={styles.badgeRow}>
          <View
            style={[styles.badge, { backgroundColor: colors.surfaceElevated }]}
            testID={TestIds.PROFILE_ROLE_BADGE}
          >
            <Text style={[styles.badgeText, { color: colors.text }]}>{roleName}</Text>
          </View>
        </View>

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
          {FM('settings.profile.tenant')}
        </Text>
        <View style={styles.badgeRow}>
          <View
            style={[styles.badge, { backgroundColor: colors.surfaceElevated }]}
            testID={TestIds.PROFILE_TENANT_BADGE}
          >
            <Text style={[styles.badgeText, { color: colors.text }]}>{tenantId}</Text>
          </View>
        </View>
      </Section>
    </View>
  );
};

export default AccountInfoSection;
