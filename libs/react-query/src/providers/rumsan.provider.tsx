'use client';

import { QueryClient } from '@tanstack/react-query';
import React, { FC, createContext, useEffect } from 'react';

import { RumsanClient } from '@rumsan/sdk';
import { useRumsanAppStore } from '../stores';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export const RsClient = new RumsanClient({
  baseURL: process.env['NEXT_PUBLIC_API_URL'],
});

export type RumsanContextType = {
  RsClient: RumsanClient;
  queryClient?: QueryClient;
};
type RumsanProviderProps = {
  children: React.ReactNode;
};

const RumsanContext = createContext<RumsanContextType>({} as RumsanContextType);

export const RumsanProvider: FC<RumsanProviderProps> = ({ children }) => {
  const { accessToken, appId } = useRumsanAppStore();
  useEffect(() => {
    if (!RsClient) return;
    if (accessToken) {
      RsClient.setAccessToken(accessToken);
    }
    if (appId) {
      RsClient.appId = appId;
    }
  }, [appId, accessToken]);

  return (
    <RumsanContext.Provider
      value={{
        RsClient,
        queryClient,
      }}
    >
      {children}
    </RumsanContext.Provider>
  );
};

export function useRumsan() {
  const context = React.useContext(RumsanContext);
  if (!context) {
    throw new Error('useRumsan must be used within a RumsanProvider');
  }
  return { ...context };
}

// const isAppReady = useMemo(() => {
//   return rumsanService && queryClient;
// }, [rumsanService, queryClient]);

// if (!isAppReady)
//   return (
//     <div className="h-screen flex items-center justify-center bg-customloader bg-auto bg-no-repeat bg-center animate-ping"></div>
//   );
// return children;
