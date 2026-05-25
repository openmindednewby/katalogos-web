/**
 * LivePreviewHeader - Viewport toggle controls for menu live preview.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import Viewport from '../../shared/enums/Viewport';
import { TestIds } from '../../shared/testIds';

interface LivePreviewHeaderProps {
  viewport: Viewport;
  setViewport: (v: Viewport) => void;
  borderColor: string;
  primaryColor: string;
  surfaceColor: string;
  textOnPrimary: string;
  textColor: string;
}

const styles = StyleSheet.create({
  viewportControls: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  viewportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  viewportButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

interface ViewportButtonProps {
  label: string;
  hint: string;
  testID: string;
  isActive: boolean;
  borderColor: string;
  primaryColor: string;
  surfaceColor: string;
  textOnPrimary: string;
  textColor: string;
  onPress: () => void;
}

const ViewportButton: React.FC<ViewportButtonProps> = ({
  label,
  hint,
  testID,
  isActive,
  borderColor,
  primaryColor,
  surfaceColor,
  textOnPrimary,
  textColor,
  onPress,
}) => (
  <TouchableOpacity
    accessibilityHint={hint}
    accessibilityLabel={label}
    accessibilityRole="button"
    style={[
      styles.viewportButton,
      {
        borderColor,
        backgroundColor: isActive ? primaryColor : surfaceColor,
      },
    ]}
    testID={testID}
    onPress={onPress}
  >
    <Text
      style={[
        styles.viewportButtonText,
        { color: isActive ? textOnPrimary : textColor },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const LivePreviewHeader: React.FC<LivePreviewHeaderProps> = ({
  viewport,
  setViewport,
  borderColor,
  primaryColor,
  surfaceColor,
  textOnPrimary,
  textColor,
}) => {
  return (
    <View style={[styles.viewportControls, { borderBottomColor: borderColor }]}>
      <ViewportButton
        borderColor={borderColor}
        hint="Preview menu in mobile view"
        isActive={viewport === Viewport.Mobile}
        label={FM('onlineMenus.viewportMobile')}
        primaryColor={primaryColor}
        surfaceColor={surfaceColor}
        testID={TestIds.LIVE_PREVIEW_MOBILE}
        textColor={textColor}
        textOnPrimary={textOnPrimary}
        onPress={() => {
          setViewport(Viewport.Mobile);
        }}
      />
      <ViewportButton
        borderColor={borderColor}
        hint="Preview menu in tablet view"
        isActive={viewport === Viewport.Tablet}
        label={FM('onlineMenus.viewportTablet')}
        primaryColor={primaryColor}
        surfaceColor={surfaceColor}
        testID={TestIds.LIVE_PREVIEW_TABLET}
        textColor={textColor}
        textOnPrimary={textOnPrimary}
        onPress={() => {
          setViewport(Viewport.Tablet);
        }}
      />
      <ViewportButton
        borderColor={borderColor}
        hint="Preview menu in desktop view"
        isActive={viewport === Viewport.Desktop}
        label={FM('onlineMenus.viewportDesktop')}
        primaryColor={primaryColor}
        surfaceColor={surfaceColor}
        testID={TestIds.LIVE_PREVIEW_DESKTOP}
        textColor={textColor}
        textOnPrimary={textOnPrimary}
        onPress={() => {
          setViewport(Viewport.Desktop);
        }}
      />
    </View>
  );
};

export default LivePreviewHeader;
