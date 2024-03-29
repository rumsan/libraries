'use client';

import { CommunicationService } from '@rumsan/communication';
import { QueryClient } from '@tanstack/react-query';
import React, { FC, createContext, useState } from 'react';

export type CommunicationQueryContextType = {
  queryClient: QueryClient;
  communicationService: CommunicationService;

  setQueryClient: (queryClient: QueryClient) => void;
  setCommunicationService: (communicationService: any) => void;
};

const CommunicationQueryContext = createContext<CommunicationQueryContextType>(
  {} as CommunicationQueryContextType,
);

type CommunicationQueryProviderProps = {
  children: React.ReactNode;
};

export const CommunicationQueryProvider: FC<
  CommunicationQueryProviderProps
> = ({ children }) => {
  const [queryClient, setQueryClient] =
    useState<CommunicationQueryContextType['queryClient']>();
  const [communicationService, setCommunicationService] =
    useState<CommunicationQueryContextType['communicationService']>();

  return (
    <CommunicationQueryContext.Provider
      value={
        {
          queryClient,
          communicationService,
          setQueryClient,
          setCommunicationService,
        } as CommunicationQueryContextType
      }
    >
      {children}
    </CommunicationQueryContext.Provider>
  );
};

export const useCommunicationQuery = () => {
  const context = React.useContext(CommunicationQueryContext);
  if (context === undefined) {
    throw new Error(
      'useCommunicationQuery must be used within a CommunicationQueryProvider',
    );
  }
  return context;
};
