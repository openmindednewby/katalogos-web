/**
 * ThankYouOverlay - Animated thank you message displayed after quiz submission.
 */
import React, { useCallback, useEffect, useRef, useMemo } from 'react';

import type { ImageSourcePropType, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Animated, StyleSheet, Text, View } from 'react-native';

/** Animation duration for thank you fade in/out */
const THANK_YOU_FADE_DURATION_MS = 220;
/** Delay before fading out the thank you message */
const THANK_YOU_DISPLAY_DELAY_MS = 1000;
/** Initial scale for thank you animation */
const THANK_YOU_INITIAL_SCALE = 0.85;
/** Pulse animation scale up value */
const THANK_YOU_SCALE_UP = 1.05;
/** Pulse animation scale down value */
const THANK_YOU_SCALE_DOWN = 0.95;
/** Number of pulse iterations */
const PULSE_ITERATIONS = 2;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const thankYouGraphic: ImageSourcePropType = require('../../../assets/tick.gif');

const styles = StyleSheet.create({
  thankYouOverlayLayout: { justifyContent: 'center', alignItems: 'center', pointerEvents: 'auto' },
  thankYouCard: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  thankYouImageLayout: { width: 96, height: 96, marginBottom: 16 },
  thankYouTextLayout: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
});

function createFadeAnimation(opacity: Animated.Value): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.timing(opacity, { toValue: 1, duration: THANK_YOU_FADE_DURATION_MS, useNativeDriver: true }),
    Animated.delay(THANK_YOU_DISPLAY_DELAY_MS),
    Animated.timing(opacity, { toValue: 0, duration: THANK_YOU_FADE_DURATION_MS, useNativeDriver: true }),
  ]);
}

function createPulseAnimation(scale: Animated.Value): Animated.CompositeAnimation {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(scale, { toValue: THANK_YOU_SCALE_UP, duration: THANK_YOU_FADE_DURATION_MS, useNativeDriver: true }),
      Animated.timing(scale, { toValue: THANK_YOU_SCALE_DOWN, duration: THANK_YOU_FADE_DURATION_MS, useNativeDriver: true }),
    ]),
    { iterations: PULSE_ITERATIONS },
  );
}

interface ThankYouOverlayProps {
  visible: boolean;
  backgroundColor: string;
  textColor: string;
  thankYouText: string;
  onAnimationComplete: () => void;
}

const ThankYouOverlay: React.FC<ThankYouOverlayProps> = ({
  visible,
  backgroundColor,
  textColor,
  thankYouText,
  onAnimationComplete,
}) => {
  const thankYouOpacity = useRef(new Animated.Value(0)).current;
  const thankYouScale = useRef(new Animated.Value(1)).current;

  const runAnimation = useCallback((): void => {
    thankYouOpacity.stopAnimation();
    thankYouScale.stopAnimation();
    thankYouOpacity.setValue(0);
    thankYouScale.setValue(THANK_YOU_INITIAL_SCALE);
    const fade = createFadeAnimation(thankYouOpacity);
    const pulse = createPulseAnimation(thankYouScale);
    Animated.parallel([fade, pulse]).start(() => { onAnimationComplete(); });
  }, [onAnimationComplete, thankYouOpacity, thankYouScale]);

  useEffect(() => { if (visible) runAnimation(); }, [visible, runAnimation]);

  const thankYouOverlayStyle = useMemo<StyleProp<ViewStyle>>(
    () => [StyleSheet.absoluteFillObject, styles.thankYouOverlayLayout, { backgroundColor, opacity: thankYouOpacity }],
    [backgroundColor, thankYouOpacity],
  );

  const thankYouCardStyle = useMemo<StyleProp<ViewStyle>>(() => [styles.thankYouCard, { backgroundColor }], [backgroundColor]);
  const thankYouImageStyle = useMemo<StyleProp<ImageStyle>>(() => [styles.thankYouImageLayout, { transform: [{ scale: thankYouScale }] }], [thankYouScale]);
  const thankYouTextStyle = useMemo<StyleProp<TextStyle>>(() => [styles.thankYouTextLayout, { color: textColor }], [textColor]);

  if (!visible) return null;

  return (
    <Animated.View style={thankYouOverlayStyle}>
      <View style={thankYouCardStyle}>
        <Animated.Image resizeMode="contain" source={thankYouGraphic} style={thankYouImageStyle} />
        <Text style={thankYouTextStyle}>{thankYouText}</Text>
      </View>
    </Animated.View>
  );
};

export default ThankYouOverlay;
