
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
