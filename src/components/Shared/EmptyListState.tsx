import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';

const MESSAGE_FONT_SIZE = 16;
const CTA_MARGIN_TOP = 16;
const CTA_PADDING_VERTICAL = 10;
const CTA_PADDING_HORIZONTAL = 20;
const CTA_BORDER_RADIUS = 8;
const CTA_FONT_SIZE = 14;
const CONTAINER_PADDING = 32;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CONTAINER_PADDING,
  },
  message: {
    fontSize: MESSAGE_FONT_SIZE,
    textAlign: 'center',
  },
  ctaButton: {
    marginTop: CTA_MARGIN_TOP,
    paddingVertical: CTA_PADDING_VERTICAL,
    paddingHorizontal: CTA_PADDING_HORIZONTAL,
    borderRadius: CTA_BORDER_RADIUS,
  },
  ctaText: {
    fontSize: CTA_FONT_SIZE,
    fontWeight: '600',
  },
});

interface Props {
  messageKey: string;
  ctaTextKey?: string;
  ctaHintKey?: string;
  ctaRoute?: string;
  testID: string;
}

const EmptyListState = ({
  messageKey,
  ctaTextKey,
  ctaHintKey,
  ctaRoute,
  testID,
}: Props): React.ReactElement => {
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];

  const handlePress = useCallback((): void => {
    if (isValueDefined(ctaRoute)) router.push(ctaRoute);
  }, [router, ctaRoute]);

  const showCta = isValueDefined(ctaTextKey)
    && isValueDefined(ctaHintKey)
    && isValueDefined(ctaRoute);

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {FM(messageKey)}
      </Text>
      {showCta ? (
        <TouchableOpacity
          accessibilityHint={FM(ctaHintKey)}
          accessibilityLabel={FM(ctaTextKey)}
          accessibilityRole="button"
          style={[styles.ctaButton, { backgroundColor: primary }]}
          testID={TestIds.EMPTY_LIST_CTA}
          onPress={handlePress}
        >
          <Text style={[styles.ctaText, { color: colors.background }]}>
            {FM(ctaTextKey)}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default EmptyListState;
