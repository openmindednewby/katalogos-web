

import React from 'react';

import { Switch, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { SWITCH_THUMB_INACTIVE_COLOR, SWITCH_TRACK_INACTIVE_COLOR } from '../utils/mediaPositionConstants';
import { mediaPositionEditorStyles as styles } from '../utils/mediaPositionEditorStyles';

interface Props {
  isVisible: boolean;
  onChange: (visible: boolean) => void;
  disabled: boolean;
  textColor: string;
  primaryColor: string;
}

const MediaShowToggle: React.FC<Props> = ({ isVisible, onChange, disabled, textColor, primaryColor }) => {

  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: textColor }]}>{FM('mediaPosition.showImage')}</Text>
      <Switch
        accessibilityHint={FM('mediaPosition.showImageHint')}
        accessibilityLabel={FM('mediaPosition.showImage')}
        disabled={disabled}
        testID={TestIds.MEDIA_SHOW_TOGGLE}
        thumbColor={isVisible ? primaryColor : SWITCH_THUMB_INACTIVE_COLOR}
        trackColor={{ false: SWITCH_TRACK_INACTIVE_COLOR, true: primaryColor }}
        value={isVisible}
        onValueChange={onChange}
      />
    </View>
  );
};

export default MediaShowToggle;
