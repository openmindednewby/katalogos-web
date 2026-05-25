import React, { useCallback, useEffect, useRef } from 'react';

import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useNotifications } from '@dloizides/notification-client/react/hooks';

import { FM } from '../../localization/helpers';
import { ANIMATION } from '../../shared/constants';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';
import { SvgIcon } from '../Icons';

/**
 * Local notification type matching the notification-client package
 */
interface ToastNotification {
  id: string;
  title: string;
  body?: string;
  actionUrl?: string;
}

/**
 * Type for the useNotifications hook result
 */
interface UseNotificationsResult {
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
}

const TOAST_DURATION_MS = 5000;
const TOAST_WIDTH = 320;
const TOAST_PADDING = 16;
const TOAST_MARGIN = 12;
const TOAST_BORDER_RADIUS = 8;
const TOAST_TOP_WEB = 60;
const TOAST_TOP_MOBILE = 80;
const TOAST_RIGHT_OFFSET = 20;
const TOAST_Z_INDEX = 9999;
const TOAST_INITIAL_TRANSLATE_X = 100;
const TITLE_FONT_SIZE = 14;
const BODY_FONT_SIZE = 13;
const CLOSE_BUTTON_SIZE = 24;
const CLOSE_ICON_FONT_SIZE = 16;
const TOAST_SHADOW_OPACITY = 0.15;
const TOAST_ELEVATION = 4;
const TOAST_SHADOW_OFFSET_Y = 4;
const TOAST_SHADOW_RADIUS = 4;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? TOAST_TOP_WEB : TOAST_TOP_MOBILE,
    right: TOAST_RIGHT_OFFSET,
    zIndex: TOAST_Z_INDEX,
    pointerEvents: 'box-none',
  },
  toast: {
    width: TOAST_WIDTH,
    padding: TOAST_PADDING,
    marginBottom: TOAST_MARGIN,
    borderRadius: TOAST_BORDER_RADIUS,
    boxShadow: `0px ${TOAST_SHADOW_OFFSET_Y}px ${TOAST_SHADOW_RADIUS}px rgba(0, 0, 0, ${TOAST_SHADOW_OPACITY})`,
    elevation: TOAST_ELEVATION,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingRight: TOAST_PADDING,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  body: {
    fontSize: BODY_FONT_SIZE,
  },
  closeButton: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface ToastItemProps {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
  onNavigate: (url: string) => void;
  backgroundColor: string;
  textColor: string;
  subtextColor: string;
}

const ToastItem = ({ notification, onDismiss, onNavigate, backgroundColor, textColor, subtextColor }: ToastItemProps): React.ReactElement => {
  const translateXRef = useRef(new Animated.Value(TOAST_INITIAL_TRANSLATE_X));
  const opacityRef = useRef(new Animated.Value(0));

  const translateX = translateXRef.current;
  const opacity = opacityRef.current;

  const handleDismiss = useCallback((): void => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: TOAST_INITIAL_TRANSLATE_X, duration: ANIMATION.TOAST_FADE_IN_MS, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(opacity, { toValue: 0, duration: ANIMATION.TOAST_FADE_IN_MS, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => {
      onDismiss(notification.id);
    });
  }, [notification.id, onDismiss, opacity, translateX]);

  const handlePress = useCallback((): void => {
    if (isValueDefined(notification.actionUrl)) {
      onDismiss(notification.id);
      onNavigate(notification.actionUrl);
    }
  }, [notification.actionUrl, notification.id, onDismiss, onNavigate]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: ANIMATION.TOAST_FADE_IN_MS, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(opacity, { toValue: 1, duration: ANIMATION.TOAST_FADE_IN_MS, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    const timer = setTimeout(() => {
      handleDismiss();
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [handleDismiss, opacity, translateX]);

  const contentArea = (
    <View style={styles.content}>
      <Text numberOfLines={1} style={[styles.title, { color: textColor }]}>{notification.title}</Text>
      {isValueDefined(notification.body) ? <Text numberOfLines={2} style={[styles.body, { color: subtextColor }]}>{notification.body}</Text> : null}
    </View>
  );

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor, opacity, transform: [{ translateX }] }]}
      testID={`${TestIds.NOTIFICATION_TOAST}-${notification.id}`}
    >
      {isValueDefined(notification.actionUrl) ? (
        <TouchableOpacity
          accessibilityHint={FM('notifications.openDetailsHint')}
          accessibilityLabel={notification.title}
          accessibilityRole="link"
          style={styles.content}
          testID={`${TestIds.NOTIFICATION_TOAST}-${notification.id}-action`}
          onPress={handlePress}
        >
          <Text numberOfLines={1} style={[styles.title, { color: textColor }]}>{notification.title}</Text>
          {isValueDefined(notification.body) ? <Text numberOfLines={2} style={[styles.body, { color: subtextColor }]}>{notification.body}</Text> : null}
        </TouchableOpacity>
      ) : contentArea}
      <TouchableOpacity
        accessibilityHint={FM('notifications.dismissHint')}
        accessibilityLabel={FM('notifications.dismiss')}
        accessibilityRole="button"
        style={styles.closeButton}
        testID={`${TestIds.NOTIFICATION_TOAST_DISMISS}-${notification.id}`}
        onPress={handleDismiss}
      >
        <SvgIcon color={subtextColor} name="close" size={CLOSE_ICON_FONT_SIZE} />
      </TouchableOpacity>
    </Animated.View>
  );
};

function isUseNotificationsResult(value: unknown): value is UseNotificationsResult {
  if (typeof value !== 'object' || !isValueDefined(value)) return false;
  return 'toasts' in value && 'dismissToast' in value;
}

/**
 * Container for displaying real-time notification toasts.
 * Automatically shows and dismisses toast notifications.
 */
const RealTimeToastContainer = (): React.ReactElement | null => {
  const { theme } = useTheme();
  const router = useRouter();

  const notificationsHookResult: unknown = useNotifications();
  const { toasts, dismissToast } = isUseNotificationsResult(notificationsHookResult)
    ? notificationsHookResult
    : { toasts: [], dismissToast: () => {} };

  const toastsList = Array.isArray(toasts) ? toasts : [];

  const handleNavigate = useCallback((url: string): void => {
    router.push({ pathname: url });
  }, [router]);

  if (toastsList.length === 0)
    return null;


  return (
    <View style={styles.container} testID={TestIds.NOTIFICATION_TOAST_CONTAINER}>
      {toastsList.map((notification) => (
        <ToastItem
          key={notification.id}
          backgroundColor={theme.colors.surfaceElevated}
          notification={notification}
          subtextColor={theme.colors.textSecondary}
          textColor={theme.colors.text}
          onDismiss={dismissToast}
          onNavigate={handleNavigate}
        />
      ))}
    </View>
  );
};

export default RealTimeToastContainer;
