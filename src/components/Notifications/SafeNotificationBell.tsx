import React, { Suspense, useContext } from 'react';

import { NotificationContext } from '@dloizides/notification-client/react/context';

import { isValueDefined } from '../../utils/is';

const LazyNotificationBellButton = React.lazy(
  async () => import('./NotificationBellButton'),
);

/** Safely renders the NotificationBellButton only when NotificationProvider is available. */
const SafeNotificationBell = (): React.ReactElement | null => {
  const context = useContext(NotificationContext);

  if (!isValueDefined(context))
    return null;


  return (
    <Suspense fallback={null}>
      <LazyNotificationBellButton />
    </Suspense>
  );
};

export default SafeNotificationBell;
