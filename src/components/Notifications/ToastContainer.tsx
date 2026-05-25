import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Animated, Text, View, StyleSheet, Platform } from 'react-native';

import { FM } from '@/localization/helpers';

import { addListener } from '../../lib/notifications';
import { TOAST_DURATION_MS, ANIMATION } from '../../shared/constants';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';
import { logger } from '../../utils/logger';
import { sanitizeText } from '../../utils/sanitize';

/** Position offset for web platforms */
const TOAST_TOP_WEB = 10;
/** Position offset for mobile platforms */
const TOAST_TOP_MOBILE = 40;
/** Horizontal margin for toast container */
const TOAST_HORIZONTAL_MARGIN = 10;
/** Z-index for toast container */
const TOAST_Z_INDEX = 9999;
/** Initial translation Y offset for toast animation */
const TOAST_INITIAL_TRANSLATE_Y = -6;
/** Maximum width of toast message */
const TOAST_MAX_WIDTH = 600;
/** Maximum length for sanitized message text */
const TOAST_MESSAGE_MAX_LENGTH = 500;
/** Horizontal padding inside toast */
const TOAST_PADDING_HORIZONTAL = 16;
/** Vertical padding inside toast */
const TOAST_PADDING_VERTICAL = 10;
/** Border radius of toast */
const TOAST_BORDER_RADIUS = 8;
/** Vertical margin between toasts */
const TOAST_MARGIN_VERTICAL = 6;

interface ToastMessage { id: string; text: string; type?: 'success' | 'info' | 'error' }

interface ToastThemeColors {
  primary: string;
  success: string;
  error: string;
  text: string;
}

interface ToastItemComponentProps {
  message: ToastMessage;
  onDone: (id: string) => void;
  colors: ToastThemeColors;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? TOAST_TOP_WEB : TOAST_TOP_MOBILE,
    left: TOAST_HORIZONTAL_MARGIN,
    right: TOAST_HORIZONTAL_MARGIN,
    alignItems: 'center',
    zIndex: TOAST_Z_INDEX,
    pointerEvents: 'box-none',
  },
  toast: {
    paddingHorizontal: TOAST_PADDING_HORIZONTAL,
    paddingVertical: TOAST_PADDING_VERTICAL,
    borderRadius: TOAST_BORDER_RADIUS,
    marginVertical: TOAST_MARGIN_VERTICAL,
    minWidth: '40%',
    maxWidth: TOAST_MAX_WIDTH,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  text: {},
});

const ToastItem = ({ message, onDone, colors }: ToastItemComponentProps): React.ReactElement => {
  const opacityRef = useRef(new Animated.Value(0));
  const translateYRef = useRef(new Animated.Value(TOAST_INITIAL_TRANSLATE_Y));

  const opacity = opacityRef.current;
  const translateY = translateYRef.current;

  const backgroundColor = useMemo((): string => {
    if (message.type === 'success') return colors.success;
    if (message.type === 'error') return colors.error;
    return colors.primary;
  }, [colors.error, colors.primary, colors.success, message.type]);

  const handleDone = useCallback((): void => {
    onDone(message.id);
  }, [message.id, onDone]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: ANIMATION.TOAST_FADE_IN_MS, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(translateY, { toValue: 0, duration: ANIMATION.TOAST_FADE_IN_MS, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: ANIMATION.TOAST_FADE_IN_MS, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(translateY, { toValue: TOAST_INITIAL_TRANSLATE_Y, duration: ANIMATION.TOAST_FADE_IN_MS, useNativeDriver: Platform.OS !== 'web' }),
      ]).start(handleDone);
    }, TOAST_DURATION_MS);

    return () => clearTimeout(hideTimer);
  }, [handleDone, opacity, translateY]);

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor, transform: [{ translateY }], opacity }]}
      testID={TestIds.NOTIFICATION_TOAST}
    >
      <Text style={[styles.text, { color: colors.text }]}>{message.text}</Text>
    </Animated.View>
  );
};

interface PayloadWithMessage {
  message?: unknown;
}

function isPayloadWithMessage(payload: unknown): payload is PayloadWithMessage {
  if (typeof payload !== 'object' || !isValueDefined(payload)) return false;
  return 'message' in payload;
}

function extractMessage(payload: unknown): string | undefined {
  if (!isPayloadWithMessage(payload)) return undefined;
  return typeof payload.message === 'string' ? payload.message : undefined;
}

const ToastContainer = (): React.ReactElement | null => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const { theme } = useTheme();

  const toastColors = useMemo((): ToastThemeColors => ({
    primary: theme.palette.primary['500'],
    success: theme.semantic.success['500'],
    error: theme.semantic.error['500'],
    text: theme.colors.surfaceElevated,
  }), [theme]);

  const push = useCallback((message: ToastMessage): void => {
    setMessages((s) => [...s, message]);
  }, []);

  const remove = useCallback((id: string): void => {
    setMessages((s) => s.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    const off = addListener((event, payload) => {
      try {
        if (event === 'signout') {
          const message = extractMessage(payload) ?? FM('notifications.sessionExpired');
          push({ id: String(Date.now()), text: sanitizeText(message, TOAST_MESSAGE_MAX_LENGTH), type: 'error' });
        }
        if (event === 'success') {
          const message = extractMessage(payload) ?? FM('notifications.savedSuccessfully');
          push({ id: String(Date.now()), text: sanitizeText(message, TOAST_MESSAGE_MAX_LENGTH), type: 'success' });
        }
        if (event === 'error') {
          const message = extractMessage(payload) ?? FM('notifications.errorOccurred');
          push({ id: String(Date.now()), text: sanitizeText(message, TOAST_MESSAGE_MAX_LENGTH), type: 'error' });
        }
      } catch (listenerError) {
        logger.error('ToastContainer', 'Error handling notification event', listenerError);
      }
    });

    return () => {
      try {
        off();
      } catch (cleanupError) {
        logger.warn('ToastContainer', 'Error during listener cleanup', cleanupError);
      }
    };
  }, [push]);

  if (messages.length === 0) return null;

  return (
    <View style={styles.container}>
      {messages.map((m) => (
        <ToastItem key={m.id} colors={toastColors} message={m} onDone={remove} />
      ))}
    </View>
  );
};

export default ToastContainer;
