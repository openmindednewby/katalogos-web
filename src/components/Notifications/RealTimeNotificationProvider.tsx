import React, { useEffect, useRef } from 'react';

import { Platform } from 'react-native';

import { useRouter } from 'expo-router';

import { osNotificationService } from '@dloizides/notification-client/workers';
import { isValueDefined } from '@dloizides/utils';

import TestApiRegistration from './TestApiRegistration';
import { useAuth } from '../../auth/AuthProvider';
import { useAnalytics } from '../../lib/analytics';
import {
  isNotificationClickedMessage,
  onServiceWorkerMessage,
  registerNotificationServiceWorker,
} from '../../lib/notifications';
import AnalyticsEventName from '../../shared/enums/AnalyticsEventName';
import { logger } from '../../utils/logger';

import type { NotificationClickedMessage, ServiceWorkerMessage } from '../../lib/notifications';

interface Props {
  children: React.ReactNode;
}

function navigateToUrl(url: string, routerPush: (path: string) => void): void {
  const isHttpUrl = url.startsWith('http://');
  const isHttpsUrl = url.startsWith('https://');
  const isExternalUrl = isHttpUrl || isHttpsUrl;

  if (isExternalUrl) 
    window.open(url, '_blank');
   else 
    routerPush(url);
  
}

function processClickedMessage(msg: NotificationClickedMessage, routerPush: (path: string) => void): void {
   
  const urlValue: string | null = msg.actionUrl;

  logger.debug('RealTimeNotificationProvider', 'Notification clicked', {
    id: msg.notificationId,
    actionUrl: urlValue,
  });
   

  const hasUrl = isValueDefined(urlValue) && urlValue.length > 0;
  if (hasUrl) 
    navigateToUrl(urlValue, routerPush);
  
}

function createMessageHandler(
  routerPush: (path: string) => void,
  trackFn?: (event: AnalyticsEventName, props?: Record<string, string | number | boolean>) => void,
): (msg: ServiceWorkerMessage) => void {
  return (msg: ServiceWorkerMessage): void => {
    if (!isNotificationClickedMessage(msg))
      return;

    trackFn?.(AnalyticsEventName.NotificationClicked, { notificationId: String(msg.notificationId) });

    processClickedMessage(msg, routerPush);
  };
}

/** Wrapper component for notification integration: service-worker registration */
const RealTimeNotificationProvider = ({ children }: Props): React.ReactElement => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { track } = useAnalytics();
  const serviceWorkerRegisteredRef = useRef(false);
  const osNotificationInitializedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'web')
      return;


    if (serviceWorkerRegisteredRef.current)
      return;


    async function registerSW(): Promise<void> {
      try {

        const registration = await registerNotificationServiceWorker();
        if (isValueDefined(registration)) {
          serviceWorkerRegisteredRef.current = true;
          logger.info('RealTimeNotificationProvider', 'Service worker registered');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error('RealTimeNotificationProvider', 'Failed to register service worker', { error: errorMessage });
      }
    }

    registerSW().catch(() => {
    });
  }, []);

  useEffect(() => {
    const shouldInit = isLoggedIn && Platform.OS === 'web';
    if (!shouldInit)
      return;


    if (osNotificationInitializedRef.current)
      return;


    async function initOsNotifications(): Promise<void> {
      try {
        const initialized = await osNotificationService.initialize();
        if (initialized) {
          osNotificationInitializedRef.current = true;
          logger.info('RealTimeNotificationProvider', 'OS notification service initialized');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error('RealTimeNotificationProvider', 'Failed to initialize OS notifications', { error: errorMessage });
      }
    }

    initOsNotifications().catch(() => {
    });
  }, [isLoggedIn]);

  useEffect(() => {
    if (Platform.OS !== 'web')
      return undefined;


    const messageHandler = createMessageHandler((path) => router.push(path), track);

    const cleanup = onServiceWorkerMessage(messageHandler);

    return cleanup;
  }, [router, track]);

  return (
    <>
      {isLoggedIn ? <TestApiRegistration /> : null}
      {children}
    </>
  );
};

export default RealTimeNotificationProvider;
