/**
 * Color scale preview showing generated 50-900 shade strip.
 * Uses palette-generator to produce the full shade scale from a base hex color.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { generateColorScale, isValidHex } from '../../../../theme/utils/palette-generator';

import type { ColorScale } from '../../../../theme/types';

interface Props {
  label: string;
  baseColor: string;
}

const SHADE_KEYS: ReadonlyArray<keyof ColorScale> = [
  '50', '100', '200', '300', '400', '500', '600', '700', '800', '900',
];
const SWATCH_HEIGHT = 32;
const SWATCH_BORDER_RADIUS = 4;
const SHADE_LABEL_SIZE = 10;

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  scaleRow: { flexDirection: 'row', gap: 2 },
  shadeCell: {
    flex: 1,
    height: SWATCH_HEIGHT,
    borderRadius: SWATCH_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadeLabel: { fontSize: SHADE_LABEL_SIZE, fontWeight: '600' },
});

/** Pick a readable text color (black or white) for a given shade key. */
function shadeTextColor(shadeKey: keyof ColorScale): string {
  const DARK_TEXT_THRESHOLD = 400;
  const numericShade = parseInt(String(shadeKey), 10);
  return numericShade >= DARK_TEXT_THRESHOLD ? '#ffffff' : '#000000';
}

const ColorScalePreview = ({ label, baseColor }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const scale = useMemo(
    () => (isValidHex(baseColor) ? generateColorScale(baseColor) : null),
    [baseColor],
  );

  if (!scale)
    return (
      <View style={styles.container} testID={TestIds.THEME_COLOR_SCALE}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
    );

  return (
    <View style={styles.container} testID={TestIds.THEME_COLOR_SCALE}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        accessibilityHint={FM('settings.themeSettings.colorScaleHint')}
        accessibilityLabel={`${label} ${FM('settings.themeSettings.colorScale')}`}
        style={styles.scaleRow}
      >
        {SHADE_KEYS.map((shade) => (
          <View
            key={shade}
            style={[styles.shadeCell, { backgroundColor: scale[shade] }]}
          >
            <Text style={[styles.shadeLabel, { color: shadeTextColor(shade) }]}>
              {shade}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ColorScalePreview;

export { shadeTextColor };
