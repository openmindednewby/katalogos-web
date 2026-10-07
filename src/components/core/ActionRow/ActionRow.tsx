import React from 'react';
import type { ReactNode, ReactElement } from 'react';

import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';


const BUTTON_GAP = 12;


const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BUTTON_GAP,
  },
});


interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}


const ActionRow = ({ children, style, testID }: Props): ReactElement => (
  <View style={[styles.row, style]} testID={testID}>
    {children}
  </View>
);

export default ActionRow;
