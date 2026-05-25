

import React from 'react';

import { Text, View } from 'react-native';

import Slider from '@react-native-community/slider';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { BORDER_RADIUS_STEP, MAX_BORDER_RADIUS, MIN_BORDER_RADIUS } from '../utils/mediaPositionConstants';
import { mediaPositionEditorStyles as styles } from '../utils/mediaPositionEditorStyles';

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  textColor: string;
  borderColor: string;
  primaryColor: string;
}

const MediaBorderRadiusSlider: React.FC<Props> = ({
  value,
  onChange,
  disabled,
  textColor,
  borderColor,
  primaryColor,
}) => {

  return (
    <View style={styles.sliderContainer}>
      <Text style={[styles.sectionLabel, { color: borderColor }]}>
        {FM('mediaPosition.borderRadiusLabel')}
      </Text>
      <View style={styles.sliderRow}>
        <Slider
          accessibilityHint={FM('mediaPosition.borderRadiusHint')}
          accessibilityLabel={FM('mediaPosition.borderRadiusLabel')}
          disabled={disabled}
          maximumTrackTintColor={borderColor}
          maximumValue={MAX_BORDER_RADIUS}
          minimumTrackTintColor={primaryColor}
          minimumValue={MIN_BORDER_RADIUS}
          step={BORDER_RADIUS_STEP}
          style={[styles.slider, disabled && styles.disabled]}
          testID={TestIds.MEDIA_BORDER_RADIUS_SLIDER}
          thumbTintColor={primaryColor}
          value={value}
          onValueChange={onChange}
        />
        <Text style={[styles.sliderValue, { color: textColor }]}>{value}</Text>
      </View>
    </View>
  );
};

export default MediaBorderRadiusSlider;
