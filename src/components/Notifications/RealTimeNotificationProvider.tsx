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

/**
 * Navigate to URL - either internal route or external
 */
function navigateToUrl(url: string, routerPush: (path: string) => void): void {
  const isHttpUrl = url.startsWith('http://');
  const isHttpsUrl = url.startsWith('https://');
  const isExternalUrl = isHttpUrl || isHttpsUrl;

  if (isExternalUrl) 
    window.open(url, '_blank');
   else 
    routerPush(url);
  
}

/**
 * Process a clicked notification message
 */
function processClickedMessage(msg: NotificationClickedMessage, routerPush: (path: string) => void): void {
   
  const urlValue: string | null = msg.actionUrl;

  logger.debug('RealTimeNotificationProvider', 'Notification clicked', {
    id: msg.notificationId,
    actionUrl: urlValue,
  });
   

  // Navigate if URL exists and is not empty
  const hasUrl = isValueDefined(urlValue) && urlValue.length > 0;
  if (hasUrl) 
    navigateToUrl(urlValue, routerPush);
  
}

/**
 * Handle service worker message callback
 */
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

/**
 * Wrapper component for notification integration: service-worker registration
 * and OS notification setup, gated on an authenticated BFF session.
 *
 * Post-BFF-cutover the SPA holds no access token. The SignalR
 * `NotificationProvider` authenticates the hub WebSocket with a Bearer token,
 * which the SPA can no longer supply — real-time SignalR notifications are a
 * documented follow-up (they need a BFF WebSocket proxy). Until then this
 * provider still wires the service worker + OS notifications; in-app
 * notifications continue to work via REST through `/bff/api/notifications`.
 */
const RealTimeNotificationProvider = ({ children }: Props): React.ReactElement => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { track } = useAnalytics();
  const serviceWorkerRegisteredRef = useRef(false);
  const osNotificationInitializedRef = useRef(false);

  // Register service worker on mount (web only)
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
      // Error already logged in registerSW
    });
  }, []);

  // Initialize OS notification service when authenticated
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
      // Error already logged in initOsNotifications
    });
  }, [isLoggedIn]);

  // Handle service worker messages (notification clicks)
  useEffect(() => {
    if (Platform.OS !== 'web')
      return undefined;


    const messageHandler = createMessageHandler((path) => router.push(path), track);

    const cleanup = onServiceWorkerMessage(messageHandler);

    return cleanup;
  }, [router, track]);

  // No SignalR hub: post-BFF-cutover the SPA holds no access token to
  // authenticate the hub WebSocket. The service worker + OS notifications
  // above stay wired; in-app notifications use REST via `/bff/api/notifications`.
  return (
    <>
      {isLoggedIn ? <TestApiRegistration /> : null}
      {children}
    </>
  );
};

export default RealTimeNotificationProvider;
