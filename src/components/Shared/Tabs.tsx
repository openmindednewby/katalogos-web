import React from 'react';

import { View, TouchableOpacity, Text, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';

interface Tab { key: string; label: string }

interface Props {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: ViewStyle;
}

const TRANSPARENT_BACKGROUND = 'transparent';

const Tabs = ({ tabs, activeKey, onChange, style }: Props): React.ReactElement => {
  const { theme } = useTheme();

  const tabActiveBackgroundStyle = React.useMemo(
    () => ({ backgroundColor: theme.palette.primary['500'] }),
    [theme.palette.primary],
  );
  const tabInactiveBackgroundStyle = React.useMemo(
    () => ({ backgroundColor: TRANSPARENT_BACKGROUND }),
    [],
  );

  return (
    <View accessibilityRole="tablist" style={[layoutStyles.tabsWrapper, style]} testID="tab-container">
      {tabs.map((t) => {
        const isActive = activeKey === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            accessibilityHint={`Switches to ${t.label} tab`}
            accessibilityLabel={t.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[
              layoutStyles.tabButton,
              isActive ? tabActiveBackgroundStyle : tabInactiveBackgroundStyle,
            ]}
            testID={`tab-button-${t.key}`}
            onPress={() => onChange(t.key)}
          >
            <Text style={isActive ? layoutStyles.tabButtonActiveText : layoutStyles.tabButtonInactiveText}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default Tabs;
