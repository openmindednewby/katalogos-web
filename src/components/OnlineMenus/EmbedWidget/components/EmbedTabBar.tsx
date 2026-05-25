import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import EmbedTab from '../../../../shared/enums/EmbedTab';
import { TestIds } from '../../../../shared/testIds';

interface Props {
  activeTab: EmbedTab;
  activeColor: string;
  inactiveColor: string;
  textColor: string;
  onTabChange: (tab: EmbedTab) => void;
}

const TAB_PADDING_VERTICAL = 8;
const TAB_PADDING_HORIZONTAL = 16;
const TAB_BORDER_BOTTOM_WIDTH = 2;
const TAB_ROW_MARGIN_BOTTOM = 12;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: TAB_ROW_MARGIN_BOTTOM },
  tab: {
    paddingVertical: TAB_PADDING_VERTICAL,
    paddingHorizontal: TAB_PADDING_HORIZONTAL,
    borderBottomWidth: TAB_BORDER_BOTTOM_WIDTH,
  },
  activeText: { fontWeight: 'bold' },
  inactiveText: { fontWeight: 'normal' },
});

const EmbedTabBar = ({ activeTab, activeColor, inactiveColor, textColor, onTabChange }: Props): React.ReactElement => {
  const isIframeActive = activeTab === EmbedTab.Iframe;
  const isJsActive = activeTab === EmbedTab.Javascript;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.embedWidget.tabIframeHint')}
        accessibilityLabel={FM('onlineMenus.embedWidget.tabIframe')}
        accessibilityRole="tab"
        accessibilityState={{ selected: isIframeActive }}
        style={[styles.tab, { borderBottomColor: isIframeActive ? activeColor : inactiveColor }]}
        testID={TestIds.EMBED_WIDGET_TAB_IFRAME}
        onPress={() => onTabChange(EmbedTab.Iframe)}
      >
        <Text style={[{ color: textColor }, isIframeActive ? styles.activeText : styles.inactiveText]}>
          {FM('onlineMenus.embedWidget.tabIframe')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.embedWidget.tabJavascriptHint')}
        accessibilityLabel={FM('onlineMenus.embedWidget.tabJavascript')}
        accessibilityRole="tab"
        accessibilityState={{ selected: isJsActive }}
        style={[styles.tab, { borderBottomColor: isJsActive ? activeColor : inactiveColor }]}
        testID={TestIds.EMBED_WIDGET_TAB_JS}
        onPress={() => onTabChange(EmbedTab.Javascript)}
      >
        <Text style={[{ color: textColor }, isJsActive ? styles.activeText : styles.inactiveText]}>
          {FM('onlineMenus.embedWidget.tabJavascript')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmbedTabBar;
