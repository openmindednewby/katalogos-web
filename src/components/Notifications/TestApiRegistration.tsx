
import { useContext, useEffect } from 'react';

import { NotificationContext } from '@dloizides/notification-client/react';
import { isValueDefined } from '@dloizides/utils';

import {
  registerNotificationStore,
  unregisterNotificationStore,
} from '../../lib/notifications';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** Component that registers the notification store with the test API. */
const TestApiRegistration = (): null => {
  const context = useContext(NotificationContext);

  useEffect(() => {
    if (isProduction())
      return undefined;


    if (!isValueDefined(context))
      return undefined;



    registerNotificationStore(context.store);

    return () => {

      unregisterNotificationStore();
    };
  }, [context]);

  return null;
}

export default TestApiRegistration;
