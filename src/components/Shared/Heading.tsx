import React from 'react';

import { Text } from 'react-native';

import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';

interface Props {
  text?: string;
  children?: React.ReactNode;
}

const Heading = ({ text, children }: Props): React.ReactElement => {
  const { theme } = useTheme();

  const headingStyle = React.useMemo(
    () => [layoutStyles.sectionHeading, { color: theme.colors.text }],
    [theme.colors.text],
  );

  return (
    <Text accessibilityRole="header" style={headingStyle} testID={TestIds.HEADING_TEXT}>
      {text ?? children}
    </Text>
  );
};

export default Heading;
