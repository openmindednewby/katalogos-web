import type { ReactElement } from 'react';

import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import FeatureItem from './FeatureItem';
import { FM } from '../../../localization/helpers';
import { TABLET_BREAKPOINT_PX, DESKTOP_BREAKPOINT_PX } from '../../../shared/constants';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import {
  FEATURE_GRID_GAP,
  LANDING_MAX_WIDTH,
  LANDING_SECTION_PADDING_HORIZONTAL,
  LANDING_SECTION_PADDING_VERTICAL,
} from '../constants';

import type { LandingFeature } from '../types';

interface Props {
  sectionTitleKey: string;
  features: readonly LandingFeature[];
}

const SECTION_TITLE_FONT_SIZE = 32;
const SECTION_TITLE_MOBILE = 26;
const SECTION_TITLE_MARGIN_BOTTOM = 40;
const COLUMNS_DESKTOP = 3;
const COLUMNS_TABLET = 2;

const styles = StyleSheet.create({
  outer: { width: '100%', alignItems: 'center' },
  inner: {
    width: '100%',
    maxWidth: LANDING_MAX_WIDTH,
    paddingHorizontal: LANDING_SECTION_PADDING_HORIZONTAL,
    paddingVertical: LANDING_SECTION_PADDING_VERTICAL,
  },
  sectionTitle: { fontWeight: '800', textAlign: 'center', marginBottom: SECTION_TITLE_MARGIN_BOTTOM, letterSpacing: -0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: FEATURE_GRID_GAP },
});

/**
 * Responsive grid of FeatureItem components.
 * 3 columns on desktop, 2 on tablet, 1 on mobile.
 */
const FeatureGrid = ({ sectionTitleKey, features }: Props): ReactElement => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width <= TABLET_BREAKPOINT_PX;
  const isDesktop = width > DESKTOP_BREAKPOINT_PX;

  function getItemWidth(): string {
    if (isMobile) return '100%';
    const columns = isDesktop ? COLUMNS_DESKTOP : COLUMNS_TABLET;
    const columnsMinusOne = columns - 1;
    const totalGap = FEATURE_GRID_GAP * columnsMinusOne;
    const containerWidth = width > LANDING_MAX_WIDTH ? LANDING_MAX_WIDTH : width;
    return `${(containerWidth - LANDING_SECTION_PADDING_HORIZONTAL * 2 - totalGap) / columns}px`;
  }

  return (
    <View style={styles.outer} testID={TestIds.LANDING_FEATURE_GRID}>
      <View style={styles.inner}>
        <Text
          style={[
            styles.sectionTitle,
            {
              fontSize: isMobile ? SECTION_TITLE_MOBILE : SECTION_TITLE_FONT_SIZE,
              color: theme.colors.text,
            },
          ]}
        >
          {FM(sectionTitleKey)}
        </Text>
        <View style={styles.grid}>
          {features.map((feature) => (
            <View key={feature.titleKey} style={{ width: getItemWidth() }}>
              <FeatureItem descriptionKey={feature.descriptionKey} titleKey={feature.titleKey} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default FeatureGrid;
