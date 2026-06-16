import React, { useCallback, useEffect, useState } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { osNotificationService } from '@dloizides/notification-client/workers';

import { FM } from '@/localization/helpers';

import { enableWebPush } from '../../lib/notifications/webPush';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { logger } from '../../utils/logger';

const BANNER_PADDING = 16;
const BANNER_MARGIN = 12;
const BANNER_BORDER_RADIUS = 8;
const TITLE_FONT_SIZE = 15;
const BODY_FONT_SIZE = 13;
const BUTTON_FONT_SIZE = 14;
const BUTTON_PADDING_HORIZONTAL = 16;
const BUTTON_PADDING_VERTICAL = 8;
const BUTTON_BORDER_RADIUS = 4;
const BUTTON_GAP = 12;

const styles = StyleSheet.create({
  container: {
    padding: BANNER_PADDING,
    marginHorizontal: BANNER_MARGIN,
    marginVertical: BANNER_MARGIN,
    borderRadius: BANNER_BORDER_RADIUS,
    flexDirection: 'column',
  },
  textContainer: {
    marginBottom: BANNER_MARGIN,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  body: {
    fontSize: BODY_FONT_SIZE,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: BUTTON_GAP,
  },
  button: {
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    paddingVertical: BUTTON_PADDING_VERTICAL,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  buttonText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '600',
  },
});

/**
 * Permission state for the banner
 */
const enum PermissionState {
  Loading = 'loading',
  Default = 'default',
  Granted = 'granted',
  Denied = 'denied',
  Dismissed = 'dismissed',
  Unsupported = 'unsupported',
}

/**
 * Banner component that prompts user to enable OS notifications.
 * Shows when permission is 'default' and hides when granted, denied, or dismissed.
 */
const NotificationPermissionBanner = (): React.ReactElement | null => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];

  const [permissionState, setPermissionState] = useState<PermissionState>(PermissionState.Loading);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  function checkPermissionStatus(): void {
    if (!osNotificationService.isSupported()) {
      setPermissionState(PermissionState.Unsupported);
      return;
    }

    const status = osNotificationService.getPermissionStatus();

    if (status === 'granted') 
      setPermissionState(PermissionState.Granted);
     else if (status === 'denied') 
      setPermissionState(PermissionState.Denied);
     else 
      setPermissionState(PermissionState.Default);
    
  }

  const handleEnable = useCallback(async (): Promise<void> => {
    try {
      const result = await osNotificationService.requestPermission();
      logger.info('NotificationPermissionBanner', 'Permission request result', { result });

      if (result === 'granted') {
        setPermissionState(PermissionState.Granted);
        // Permission is now granted — also subscribe this browser to server Web Push
        // (no second prompt). enableWebPush is fail-safe (never throws).
        const subscribed = await enableWebPush();
        logger.info('NotificationPermissionBanner', 'web push subscribe', { subscribed });
      } else if (result === 'denied') 
        setPermissionState(PermissionState.Denied);
      

    } catch (error) {
      logger.error('NotificationPermissionBanner', 'Failed to request permission', { error });
      setPermissionState(PermissionState.Denied);
    }
  }, []);

  const handleLater = useCallback((): void => {
    setPermissionState(PermissionState.Dismissed);
  }, []);

  // Only show banner when permission is 'default'
  const shouldShowBanner = permissionState === PermissionState.Default;
  if (!shouldShowBanner) 
    return null;
  

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface }]}
      testID={TestIds.NOTIFICATION_PERMISSION_BANNER}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          {FM('notificationBanner.title')}
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          {FM('notificationBanner.body')}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          accessibilityHint={FM('notificationBanner.laterHint')}
          accessibilityLabel={FM('notificationBanner.laterLabel')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: colors.surface }]}
          testID={TestIds.NOTIFICATION_PERMISSION_LATER_BUTTON}
          onPress={handleLater}
        >
          <Text style={[styles.buttonText, { color: colors.textSecondary }]}>{FM('notificationBanner.later')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityHint={FM('notificationBanner.enableHint')}
          accessibilityLabel={FM('notificationBanner.enableLabel')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: primary }]}
          testID={TestIds.NOTIFICATION_PERMISSION_ENABLE_BUTTON}
          onPress={handleEnable}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>{FM('notificationBanner.enable')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotificationPermissionBanner;
