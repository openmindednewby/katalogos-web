import React from 'react';

import ToastContainer from './ToastContainer';

// Notifier now renders the toast container which subscribes to events and
// shows user-facing toasts for signout and success notifications.
const Notifier = (): React.ReactElement => {
  return <ToastContainer />;
};

export default Notifier;
