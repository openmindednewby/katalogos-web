/**
 * TestApiRegistration Component
 *
 * This component registers the notification store with the test API
 * when mounted inside a NotificationProvider. It enables E2E tests
 * to inject mock notifications.
 *
 * SECURITY: Only active in non-production environments.
 */

import { useContext, useEffect } from 'react';

import { NotificationContext } from '@dloizides/notification-client/react';
import { isValueDefined } from '@dloizides/utils';

import {
  registerNotificationStore,
  unregisterNotificationStore,
} from '../../lib/notifications';

/**
 * Check if we are in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Component that registers the notification store with the test API.
 * Must be rendered inside a NotificationProvider.
 *
 * This component renders nothing and only performs side effects.
 */
const TestApiRegistration = (): null => {
  const context = useContext(NotificationContext);

  useEffect(() => {
    // Skip registration in production
    if (isProduction())
      return undefined;


    // Skip if context is not available
    if (!isValueDefined(context))
      return undefined;


    // Register the store with the test API

    registerNotificationStore(context.store);

    // Cleanup on unmount
    return () => {

      unregisterNotificationStore();
    };
  }, [context]);

  return null;
}

export default TestApiRegistration;
