import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, type DimensionValue } from 'react-native';

import { useRouter } from 'expo-router';

import AttributionFooter from './AttributionFooter';
import { FM } from '../../../localization/helpers';
import { Routes } from '../../../navigation/routes';
import { TABLET_BREAKPOINT_PX, DESKTOP_BREAKPOINT_PX } from '../../../shared/constants';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { LANDING_MAX_WIDTH, LANDING_SECTION_PADDING_HORIZONTAL } from '../constants';

const FOOTER_PADDING_VERTICAL = 48;
const FOOTER_LINK_FONT_SIZE = 14;
const FOOTER_HEADING_FONT_SIZE = 14;
const COPYRIGHT_FONT_SIZE = 13;
const COLUMN_GAP = 48;
const LINK_SPACING = 12;
const DEFAULT_BORDER_WIDTH = 1;
const PRICING_ROUTE = '/pricing';

const styles = StyleSheet.create({
  outer: { width: '100%', alignItems: 'center', borderTopWidth: DEFAULT_BORDER_WIDTH },
  inner: {
    width: '100%', maxWidth: LANDING_MAX_WIDTH,
    paddingHorizontal: LANDING_SECTION_PADDING_HORIZONTAL, paddingVertical: FOOTER_PADDING_VERTICAL,
  },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: COLUMN_GAP },
  column: { minWidth: 140 },
  columnHeading: { fontSize: FOOTER_HEADING_FONT_SIZE, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  link: { paddingVertical: LINK_SPACING / 2 },
  linkText: { fontSize: FOOTER_LINK_FONT_SIZE },
  divider: { height: 1, marginVertical: 32 },
  copyright: { fontSize: COPYRIGHT_FONT_SIZE, textAlign: 'center' },
});

function resolveColumnWidth(isMobile: boolean, isDesktop: boolean): DimensionValue {
  if (isMobile) return '100%';
  if (isDesktop) return 'auto';
  return '45%';
}

const LandingFooter = (): React.ReactElement => {
  const { theme } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const colors = theme.colors;
  const isMobile = width <= TABLET_BREAKPOINT_PX;
  const isDesktop = width > DESKTOP_BREAKPOINT_PX;
  const columnWidth = resolveColumnWidth(isMobile, isDesktop);

  function handleNavigate(route: string): void {
    router.push(route);
  }

  return (
    <View style={[styles.outer, { backgroundColor: colors.surface, borderTopColor: colors.border }]} testID={TestIds.LANDING_FOOTER}>
      <View style={styles.inner}>
        <View style={styles.columns}>
          <View style={[styles.column, { width: columnWidth }]}>
            <Text style={[styles.columnHeading, { color: colors.textSecondary }]}>{FM('landing.footer.products')}</Text>
            <TouchableOpacity accessibilityHint={FM('landing.footer.pricingLinkHint')} accessibilityLabel={FM('landing.footer.pricingLink')} accessibilityRole="link" style={styles.link} testID={TestIds.LANDING_FOOTER_PRICING_LINK} onPress={() => handleNavigate(PRICING_ROUTE)}>
              <Text style={[styles.linkText, { color: colors.text }]}>{FM('landing.footer.pricingLink')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.column, { width: columnWidth }]}>
            <Text style={[styles.columnHeading, { color: colors.textSecondary }]}>{FM('landing.footer.legal')}</Text>
            <TouchableOpacity accessibilityHint={FM('landing.footer.privacyPolicyHint')} accessibilityLabel={FM('landing.footer.privacyPolicy')} accessibilityRole="link" style={styles.link} testID={TestIds.LANDING_FOOTER_PRIVACY_LINK} onPress={() => handleNavigate(Routes.PRIVACY_POLICY)}>
              <Text style={[styles.linkText, { color: colors.text }]}>{FM('landing.footer.privacyPolicy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityHint={FM('landing.footer.termsOfServiceHint')} accessibilityLabel={FM('landing.footer.termsOfService')} accessibilityRole="link" style={styles.link} testID={TestIds.LANDING_FOOTER_TERMS_LINK} onPress={() => handleNavigate(Routes.TERMS_OF_SERVICE)}>
              <Text style={[styles.linkText, { color: colors.text }]}>{FM('landing.footer.termsOfService')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.copyright, { color: colors.textSecondary }]}>{FM('landing.footer.copyright')}</Text>
        <AttributionFooter />
      </View>
    </View>
  );
};

export default LandingFooter;
