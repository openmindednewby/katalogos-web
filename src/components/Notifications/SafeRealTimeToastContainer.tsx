import React, { useContext } from 'react';

import { NotificationContext } from '@dloizides/notification-client/react/context';

import RealTimeToastContainer from './RealTimeToastContainer';
import { isValueDefined } from '../../utils/is';

/**
 * Safely renders the RealTimeToastContainer only when NotificationProvider is available.
 * Returns null if the notification context is not provided.
 */
const SafeRealTimeToastContainer = (): React.ReactElement | null => {
  const context = useContext(NotificationContext);

  // Only render toasts if we have the notification context
  if (!isValueDefined(context)) 
    return null;
  

  return <RealTimeToastContainer />;
};

export default SafeRealTimeToastContainer;
