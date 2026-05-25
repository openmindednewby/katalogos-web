/**
 * Layout wrapper for arranging multiple buttons in a horizontal row.
 * Pure layout -- no theme concerns. Uses a fixed gap between children.
 */
import React from 'react';
import type { ReactNode, ReactElement } from 'react';

import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BUTTON_GAP = 12;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BUTTON_GAP,
  },
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ActionRow = ({ children, style, testID }: Props): ReactElement => (
  <View style={[styles.row, style]} testID={testID}>
    {children}
  </View>
);

export default ActionRow;
