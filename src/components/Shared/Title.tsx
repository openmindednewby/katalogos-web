import React from 'react';

import { Text } from 'react-native';

import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';

interface Props {
  children?: React.ReactNode;
  text?: string;
}

const Title = ({ children, text }: Props): React.ReactElement => {
  const { theme } = useTheme();

  const titleStyle = React.useMemo(() => [layoutStyles.pageTitle, { color: theme.colors.text }], [theme.colors.text]);

  return <Text style={titleStyle}>{text ?? children}</Text>;
};

export default Title;
