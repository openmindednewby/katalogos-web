


/**
 * Live mini-preview card showing how the current theme config looks.
 * Displays a header bar, buttons, text sample, and card surface.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import Heading from '../../Shared/Heading';
import Section from '../../Shared/Section';

import type { TenantThemeConfig } from '../../../theme/types';

interface Props {
  config: TenantThemeConfig;
}

const HEADER_HEIGHT = 48;
const HEADER_BORDER_RADIUS = 8;
const BUTTON_PADDING_H = 16;
const BUTTON_PADDING_V = 8;
const BUTTON_BORDER_RADIUS = 6;
const CARD_PADDING = 12;
const CARD_BORDER_RADIUS = 8;
const CARD_BORDER_WIDTH = 1;
const WHITE_COLOR = '#ffffff';

const styles = StyleSheet.create({
  previewContainer: { marginTop: 8, gap: 12 },
  header: {
    height: HEADER_HEIGHT,
    borderRadius: HEADER_BORDER_RADIUS,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerText: { color: WHITE_COLOR, fontWeight: '700', fontSize: 16 },
  buttonRow: { flexDirection: 'row', gap: 8 },
  button: {
    paddingHorizontal: BUTTON_PADDING_H,
    paddingVertical: BUTTON_PADDING_V,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
  },
  buttonText: { color: WHITE_COLOR, fontWeight: '600', fontSize: 14 },
  textSample: { fontSize: 14, lineHeight: 20 },
  card: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
  },
  cardLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
});

const ThemePreviewCard = ({ config }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const modeColors = theme.colors;

  const headerStyle = useMemo(
    () => [styles.header, { backgroundColor: config.primary }],
    [config.primary],
  );

  const primaryButtonStyle = useMemo(
    () => [styles.button, { backgroundColor: config.primary }],
    [config.primary],
  );

  const secondaryButtonStyle = useMemo(
    () => [styles.button, { backgroundColor: config.secondary }],
    [config.secondary],
  );

  const cardStyle = useMemo(
    () => [
      styles.card,
      { backgroundColor: modeColors.surface, borderColor: modeColors.border },
    ],
    [modeColors.surface, modeColors.border],
  );

  return (
    <Section>
      <Heading>{FM('tenantThemes.preview')}</Heading>
      <View style={styles.previewContainer} testID={TestIds.TENANT_THEME_PREVIEW}>
        <View style={headerStyle}>
          <Text style={styles.headerText}>{FM('tenantThemes.previewHeader')}</Text>
        </View>

        <View style={styles.buttonRow}>
          <View style={primaryButtonStyle}>
            <Text style={styles.buttonText}>{FM('tenantThemes.previewButton')}</Text>
          </View>
          <View style={secondaryButtonStyle}>
            <Text style={styles.buttonText}>{FM('tenantThemes.previewButton')}</Text>
          </View>
        </View>

        <Text style={[styles.textSample, { color: modeColors.text }]}>
          {FM('tenantThemes.previewText')}
        </Text>

        <View style={cardStyle}>
          <Text style={[styles.cardLabel, { color: modeColors.textSecondary }]}>
            {FM('tenantThemes.previewCard')}
          </Text>
          <Text style={{ color: modeColors.text }}>
            {FM('tenantThemes.previewText')}
          </Text>
        </View>
      </View>
    </Section>
  );
};

export default ThemePreviewCard;
