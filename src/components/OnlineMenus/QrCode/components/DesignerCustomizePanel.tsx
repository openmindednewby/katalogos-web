import React from 'react';

import { Text, TextInput, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { customizePanelStyles as styles } from '../utils/qrDesignerStyles';

import type { DesignerDispatchers, DesignerState } from '../hooks/useDesignerState';

interface Props {
  state: DesignerState;
  dispatchers: DesignerDispatchers;
}

const DesignerCustomizePanel = ({ state, dispatchers }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const inputStyle = [styles.input, { borderColor: colors.border, color: colors.text }];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {FM('onlineMenus.qrCode.designer.customize')}
      </Text>
      <TextInput
        accessibilityHint={FM('onlineMenus.qrCode.designer.restaurantNameHint')}
        accessibilityLabel={FM('onlineMenus.qrCode.designer.restaurantName')}
        style={inputStyle}
        testID={TestIds.QR_DESIGNER_NAME_INPUT}
        value={state.restaurantName}
        onChangeText={dispatchers.setRestaurantName}
      />
      <TextInput
        accessibilityHint={FM('onlineMenus.qrCode.designer.taglineHint')}
        accessibilityLabel={FM('onlineMenus.qrCode.designer.tagline')}
        style={inputStyle}
        testID={TestIds.QR_DESIGNER_TAGLINE_INPUT}
        value={state.tagline}
        onChangeText={dispatchers.setTagline}
      />
      <TextInput
        accessibilityHint={FM('onlineMenus.qrCode.designer.callToActionHint')}
        accessibilityLabel={FM('onlineMenus.qrCode.designer.callToAction')}
        style={inputStyle}
        testID={TestIds.QR_DESIGNER_CTA_INPUT}
        value={state.callToAction}
        onChangeText={dispatchers.setCallToAction}
      />
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            {FM('onlineMenus.qrCode.designer.qrForeground')}
          </Text>
          <TextInput
            accessibilityHint={FM('onlineMenus.qrCode.designer.qrForegroundHint')}
            accessibilityLabel={FM('onlineMenus.qrCode.designer.qrForeground')}
            style={inputStyle}
            testID={TestIds.QR_DESIGNER_FG_COLOR_INPUT}
            value={state.qrFgColor}
            onChangeText={dispatchers.setQrFgColor}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            {FM('onlineMenus.qrCode.designer.qrBackground')}
          </Text>
          <TextInput
            accessibilityHint={FM('onlineMenus.qrCode.designer.qrBackgroundHint')}
            accessibilityLabel={FM('onlineMenus.qrCode.designer.qrBackground')}
            style={inputStyle}
            testID={TestIds.QR_DESIGNER_BG_COLOR_INPUT}
            value={state.qrBgColor}
            onChangeText={dispatchers.setQrBgColor}
          />
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {FM('onlineMenus.qrCode.designer.accentColor')}
        </Text>
        <TextInput
          accessibilityHint={FM('onlineMenus.qrCode.designer.accentColorHint')}
          accessibilityLabel={FM('onlineMenus.qrCode.designer.accentColor')}
          style={inputStyle}
          testID={TestIds.QR_DESIGNER_ACCENT_INPUT}
          value={state.accentColor}
          onChangeText={dispatchers.setAccentColor}
        />
      </View>
    </View>
  );
};

export default DesignerCustomizePanel;
