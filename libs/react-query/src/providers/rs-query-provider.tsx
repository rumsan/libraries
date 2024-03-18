'use client';

import { RumsanService } from '@rumsan/sdk';
import { QueryClient } from '@tanstack/react-query';
import React, { FC, createContext, useState } from 'react';

export type RSQueryContextType = {
  queryClient: QueryClient;
  rumsanService: RumsanService;
  setQueryClient: (queryClient: QueryClient) => void;
  setRumsanService: (rumsanService:any) => void;
};

const RSQueryContext = createContext<RSQueryContextType>(
  {} as RSQueryContextType,
);

type RSQueryProviderProps = {
  children: React.ReactNode;
};

export const RSQueryProvider:FC<RSQueryProviderProps> = ({ children }) => {
  const [queryClient, setQueryClient] =
    useState<RSQueryContextType['queryClient']>();
  const [rumsanService, setRumsanService] =
    useState<RSQueryContextType['rumsanService']>();

  console.log('queryClient', queryClient);
  console.log('rumsanService', rumsanService);

  return (
    <RSQueryContext.Provider
      value={
        {
          queryClient,
          rumsanService,
          setQueryClient,
          setRumsanService,
        } as RSQueryContextType
      }
    >
      {children}
    </RSQueryContext.Provider>
  );
};

export const useRSQuery = () => {
  const context = React.useContext(RSQueryContext);
  if (context === undefined) {
    throw new Error('useRSQuery must be used within a RSQueryProvider');
  }
  return context;
};
