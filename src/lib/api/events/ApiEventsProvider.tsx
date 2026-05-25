/**
 * Provider component that mounts the useApiEvents hook and renders
 * the ApiErrorModal for modal-type events.
 *
 * Place this inside the Router and Redux Provider so that navigation
 * and dispatch are available.
 *
 * @example
 * <Provider store={reduxStore}>
 *   <Router>
 *     <ApiEventsProvider>
 *       <App />
 *     </ApiEventsProvider>
 *   </Router>
 * </Provider>
 */

import React from 'react';

import { useApiEvents } from './useApiEvents';
import ApiErrorModal from '../../../components/feedback/ApiErrorModal';

interface Props {
  children: React.ReactNode;
}

const ApiEventsProvider = ({ children }: Props): React.ReactElement => {
  const { activeModal, dismissModal } = useApiEvents();

  return (
    <>
      {children}
      <ApiErrorModal event={activeModal} onDismiss={dismissModal} />
    </>
  );
};

export default ApiEventsProvider;
