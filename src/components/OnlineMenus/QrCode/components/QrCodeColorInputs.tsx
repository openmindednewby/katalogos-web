import React from 'react';

import { Text, TextInput, View } from 'react-native';

import { TestIds } from '../../../../shared/testIds';
import { colorInputStyles } from '../utils/qrCodeStyles';

interface Props {
  fgColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  fgLabel: string;
  bgLabel: string;
  fgHint: string;
  bgHint: string;
  onFgColorChange: (color: string) => void;
  onBgColorChange: (color: string) => void;
}

const QrCodeColorInputs = ({
  fgColor,
  bgColor,
  textColor,
  borderColor,
  fgLabel,
  bgLabel,
  fgHint,
  bgHint,
  onFgColorChange,
  onBgColorChange,
}: Props): React.ReactElement => (
  <View style={colorInputStyles.container}>
    <View style={colorInputStyles.row}>
      <View style={colorInputStyles.inputGroup}>
        <Text style={[colorInputStyles.label, { color: textColor }]}>
          {fgLabel}
        </Text>
        <TextInput
          accessibilityHint={fgHint}
          accessibilityLabel={fgLabel}
          style={[colorInputStyles.input, { borderColor, color: textColor }]}
          testID={TestIds.QR_CODE_FG_COLOR_INPUT}
          value={fgColor}
          onChangeText={onFgColorChange}
        />
      </View>
      <View style={colorInputStyles.inputGroup}>
        <Text style={[colorInputStyles.label, { color: textColor }]}>
          {bgLabel}
        </Text>
        <TextInput
          accessibilityHint={bgHint}
          accessibilityLabel={bgLabel}
          style={[colorInputStyles.input, { borderColor, color: textColor }]}
          testID={TestIds.QR_CODE_BG_COLOR_INPUT}
          value={bgColor}
          onChangeText={onBgColorChange}
        />
      </View>
    </View>
  </View>
);

export default QrCodeColorInputs;
