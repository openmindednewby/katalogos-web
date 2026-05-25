import React from 'react';

import { View, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const Section = ({ children, style }: Props): React.ReactElement => {
  const { theme } = useTheme();

  const containerStyle = React.useMemo(
    () => [layoutStyles.sectionCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }, style],
    [theme.colors.border, theme.colors.surface, style],
  );

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

export default Section;
