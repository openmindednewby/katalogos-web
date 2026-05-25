/**
 * Live preview panel showing how the current theme config looks.
 * Renders a sample header, buttons, text, and card surface.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Heading from '../../../Shared/Heading';
import Section from '../../../Shared/Section';

import type { TenantThemeConfig } from '../../../../theme/types';

interface Props {
  config: TenantThemeConfig;
}

const HEADER_HEIGHT = 44;
const HEADER_BORDER_RADIUS = 8;
const BUTTON_PADDING_H = 14;
const BUTTON_PADDING_V = 8;
const BUTTON_BORDER_RADIUS = 6;
const CARD_PADDING = 12;
const CARD_BORDER_RADIUS = 8;
const CARD_BORDER_WIDTH = 1;
const WHITE_COLOR = '#ffffff';

const styles = StyleSheet.create({
  previewBox: { marginTop: 8, gap: 10 },
  header: {
    height: HEADER_HEIGHT,
    borderRadius: HEADER_BORDER_RADIUS,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  headerText: { color: WHITE_COLOR, fontWeight: '700', fontSize: 15 },
  buttonRow: { flexDirection: 'row', gap: 8 },
  button: {
    paddingHorizontal: BUTTON_PADDING_H,
    paddingVertical: BUTTON_PADDING_V,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
  },
  buttonText: { color: WHITE_COLOR, fontWeight: '600', fontSize: 13 },
  sampleText: { fontSize: 14, lineHeight: 20 },
  card: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
  },
  cardLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
});

const ThemePreview = ({ config }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const modeColors = theme.colors;

  const headerStyle = useMemo(
    () => [styles.header, { backgroundColor: config.primary }],
    [config.primary],
  );
  const primaryBtnStyle = useMemo(
    () => [styles.button, { backgroundColor: config.primary }],
    [config.primary],
  );
  const secondaryBtnStyle = useMemo(
    () => [styles.button, { backgroundColor: config.secondary }],
    [config.secondary],
  );
  const accentBtnStyle = useMemo(
    () => [styles.button, { backgroundColor: config.accent }],
    [config.accent],
  );
  const cardStyle = useMemo(
    () => [styles.card, { backgroundColor: modeColors.surface, borderColor: modeColors.border }],
    [modeColors.surface, modeColors.border],
  );

  return (
    <Section>
      <Heading>{FM('settings.themeSettings.livePreview')}</Heading>
      <View style={styles.previewBox} testID={TestIds.THEME_LIVE_PREVIEW}>
        <View
          accessibilityHint={FM('settings.themeSettings.previewHeader')}
          accessibilityLabel={FM('settings.themeSettings.previewHeader')}
          style={headerStyle}
        >
          <Text style={styles.headerText}>{FM('settings.themeSettings.previewHeader')}</Text>
        </View>

        <View style={styles.buttonRow}>
          <View style={primaryBtnStyle}>
            <Text style={styles.buttonText}>{FM('settings.themeSettings.previewButton')}</Text>
          </View>
          <View style={secondaryBtnStyle}>
            <Text style={styles.buttonText}>{FM('settings.themeSettings.previewButton')}</Text>
          </View>
          <View style={accentBtnStyle}>
            <Text style={styles.buttonText}>{FM('settings.themeSettings.previewButton')}</Text>
          </View>
        </View>

        <Text style={[styles.sampleText, { color: modeColors.text }]}>
          {FM('settings.themeSettings.previewText')}
        </Text>

        <View style={cardStyle}>
          <Text style={[styles.cardLabel, { color: modeColors.textSecondary }]}>
            {FM('settings.themeSettings.previewCard')}
          </Text>
          <Text style={{ color: modeColors.text }}>
            {FM('settings.themeSettings.previewText')}
          </Text>
        </View>
      </View>
    </Section>
  );
};

export default ThemePreview;
