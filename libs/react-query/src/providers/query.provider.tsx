'use client';

import { useRumsanAppStore } from '@rumsan/react-query';
import { IRumsanClient } from '@rumsan/sdk/types/rumsanClient.types';
import { QueryClient } from '@tanstack/react-query';
import React, { FC, createContext, useEffect } from 'react';

export type RumsanProviderContextType = {
  queryClient?: QueryClient;
  rumsanClient: any;
};

const RumsanProviderContext = createContext<RumsanProviderContextType>(
  {} as RumsanProviderContextType,
);

type RumsanProviderProps = {
  children: React.ReactNode;
  rumsanClient: any;
  queryClient?: QueryClient;
  appId?: string;
};

export const RumsanProvider: FC<RumsanProviderProps> = ({
  children,
  rumsanClient,
  queryClient,
}) => {
  const { accessToken, appId, clientId } = useRumsanAppStore();
  const rsClient: IRumsanClient = rumsanClient as IRumsanClient;
  useEffect(() => {
    if (!rsClient) return;
    if (accessToken) {
      rsClient.setAccessToken(accessToken);
    }
    if (appId) {
      rsClient.setAppId(appId);
    }

    if (clientId) {
      rsClient.setClientId(clientId);
    }
  }, [appId, accessToken, clientId, rsClient]);

  return (
    <RumsanProviderContext.Provider
      value={{
        queryClient,
        rumsanClient,
      }}
    >
      {children}
    </RumsanProviderContext.Provider>
  );
};

export function useRumsan<T>() {
  const context = React.useContext(RumsanProviderContext);
  if (!context) {
    throw new Error('useRumsan must be used within a RumsanProvider');
  }
  return { ...context, RsClient: context.rumsanClient as T };
}

// const isAppReady = useMemo(() => {
//   return rumsanService && queryClient;
// }, [rumsanService, queryClient]);

// if (!isAppReady)
//   return (
//     <div className="h-screen flex items-center justify-center bg-customloader bg-auto bg-no-repeat bg-center animate-ping"></div>
//   );
// return children;
