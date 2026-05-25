import React from 'react';

import { Text } from 'react-native';

import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';

interface Props {
  text?: string | React.ReactNode;
}

const FieldLabel = ({ text }: Props): React.ReactElement => {
  const { theme } = useTheme();

  const labelStyle = React.useMemo(
    () => [layoutStyles.inputLabel, { color: theme.colors.text }],
    [theme.colors.text],
  );

  return <Text style={labelStyle}>{text}</Text>;
};

export default FieldLabel;
