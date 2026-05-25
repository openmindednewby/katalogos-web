import React from 'react';

import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const PHONE_TAB_PADDING_H = 12;
const PHONE_TAB_PADDING_V = 8;
const PHONE_FONT_SIZE = 14;
const TRANSPARENT_COLOR = 'transparent';

const styles = StyleSheet.create({
  tab: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 2 },
  tabPhone: { paddingVertical: PHONE_TAB_PADDING_V, paddingHorizontal: PHONE_TAB_PADDING_H, flex: 1, alignItems: 'center' },
  tabText: { fontSize: 16, fontWeight: '600' },
  tabTextPhone: { fontSize: PHONE_FONT_SIZE },
});

interface Props {
  testID: string;
  label: string;
  hint: string;
  isActive: boolean;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  inactiveTabBg: string;
  isPhone: boolean;
  onPress: () => void;
}

const EditorTabButton: React.FC<Props> = ({
  testID, label, hint, isActive, primaryColor, textColor, backgroundColor, inactiveTabBg, isPhone, onPress,
}) => (
  <TouchableOpacity
    accessibilityHint={hint}
    accessibilityLabel={label}
    accessibilityRole="tab"
    style={[
      styles.tab,
      isPhone ? styles.tabPhone : undefined,
      {
        borderBottomColor: isActive ? primaryColor : TRANSPARENT_COLOR,
        backgroundColor: isActive ? backgroundColor : inactiveTabBg,
      },
    ]}
    testID={testID}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isPhone ? styles.tabTextPhone : undefined, { color: isActive ? primaryColor : textColor }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default EditorTabButton;
