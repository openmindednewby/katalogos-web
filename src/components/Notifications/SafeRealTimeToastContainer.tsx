import React, { useContext } from 'react';

import { NotificationContext } from '@dloizides/notification-client/react/context';

import RealTimeToastContainer from './RealTimeToastContainer';
import { isValueDefined } from '../../utils/is';

/** Safely renders the RealTimeToastContainer only when NotificationProvider is available. */
const SafeRealTimeToastContainer = (): React.ReactElement | null => {
  const context = useContext(NotificationContext);

  if (!isValueDefined(context)) 
    return null;
  

  return <RealTimeToastContainer />;
};

export default SafeRealTimeToastContainer;
