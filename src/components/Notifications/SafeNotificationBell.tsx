import React, { Suspense, useContext } from 'react';

import { NotificationContext } from '@dloizides/notification-client/react/context';

import { isValueDefined } from '../../utils/is';

/**
 * Lazy-load NotificationBellButton so its import of useUnreadCount
 * (from @dloizides/notification-client/react/hooks) stays in a
 * separate chunk and does not pull SignalR/zustand into __common.
 */
const LazyNotificationBellButton = React.lazy(
  async () => import('./NotificationBellButton'),
);

/**
 * Safely renders the NotificationBellButton only when NotificationProvider is available.
 * Returns null if the notification context is not provided.
 *
 * Uses lightweight context-only import to avoid pulling heavy deps (SignalR, zustand)
 * into the common chunk. The actual bell button is lazy-loaded.
 */
const SafeNotificationBell = (): React.ReactElement | null => {
  const context = useContext(NotificationContext);

  // Only render the bell if we have the notification context
  if (!isValueDefined(context))
    return null;


  return (
    <Suspense fallback={null}>
      <LazyNotificationBellButton />
    </Suspense>
  );
};

export default SafeNotificationBell;
