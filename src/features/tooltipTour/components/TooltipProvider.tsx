import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

import { isValueDefined } from '@/utils/is';

import { useTooltipTour } from '../hooks/useTooltipTour';

import type { TooltipTourState } from '../types';

const TooltipTourContext = createContext<TooltipTourState | null>(null);

interface Props {
  children: ReactNode;
}

export const TooltipProvider = ({ children }: Props): ReactElement => {
  const tourState = useTooltipTour();

  return (
    <TooltipTourContext.Provider value={tourState}>
      {children}
    </TooltipTourContext.Provider>
  );
};

export function useTooltipTourContext(): TooltipTourState {
  const context = useContext(TooltipTourContext);
  if (!isValueDefined(context))
    throw new Error('useTooltipTourContext must be used within a TooltipProvider');

  return context;
}
