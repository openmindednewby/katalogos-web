import React from 'react';

import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { FM } from '../../../localization/helpers';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';

const DOT_SIZE = 10;
const DOT_MARGIN = 6;
const BAR_HEIGHT = 4;
const BAR_MARGIN_TOP = 8;
const LABEL_FONT_SIZE = 13;
const LABEL_MARGIN_BOTTOM = 4;
const TOTAL_STEPS = 3;
const ACTIVE_DOT_OPACITY = 1;
const INACTIVE_DOT_OPACITY = 0.3;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: BAR_MARGIN_TOP,
  },
  label: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '500',
    marginBottom: LABEL_MARGIN_BOTTOM,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginHorizontal: DOT_MARGIN,
  },
  barTrack: {
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    marginTop: BAR_MARGIN_TOP,
    overflow: 'hidden',
  },
  barFill: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
  },
});

interface Props {
  step: number;
}

const PERCENT_MULTIPLIER = 100;

const WizardProgressBar = ({ step }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const displayStepNumber = Math.min(step, TOTAL_STEPS);
  const progressPercent: DimensionValue = `${(displayStepNumber / TOTAL_STEPS) * PERCENT_MULTIPLIER}%`;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: TOTAL_STEPS, now: displayStepNumber }}
      style={styles.container}
      testID={TestIds.WELCOME_WIZARD_PROGRESS}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {FM('dashboard.wizard.progressLabel', String(displayStepNumber), String(TOTAL_STEPS))}
      </Text>
      <View style={styles.dotsRow}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: primary,
                opacity: i < displayStepNumber ? ACTIVE_DOT_OPACITY : INACTIVE_DOT_OPACITY,
              },
            ]}
          />
        ))}
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
        <View
          style={[styles.barFill, { backgroundColor: primary, width: progressPercent }]}
        />
      </View>
    </View>
  );
};

export default WizardProgressBar;
