import { createId } from '@paralleldrive/cuid2';
import { User } from '@rumsan/sdk';
import { JwtUtils } from '@rumsan/sdk/utils';
import { localStore } from '../utils/local.store';
import { createZustandStore } from '../utils/zustand.store';

type RumsanAppState = {
  accessToken: string | null;
  clientId: string;
  appId: string | null;
  isInitialized: boolean;
  challenge: string | null;
  currentUser: User | null;
  roles: Record<string, any> | null;
};

type RumsanAppStateFunctions = {
  isAuthenticated: () => boolean;
  setClientId: (clientId: string) => void;
  setChallenge: (challenge: string) => void;
  setAppId: (appId: string) => void;
  setAccessToken: (accessToken: string) => void;
  setInitialization: (d: any) => void;
  setCurrentUser: (user: User) => void;
  clearCurrentUser: () => void;
  clearAuth: () => void;
};

type RumsanAppStore = RumsanAppState & RumsanAppStateFunctions;

const initialStore = {
  clientId: createId(),
  accessToken: null,
  appId: null,
  isInitialized: false,
  challenge: null,
  currentUser: null,
  roles: [],
};

export const useRumsanAppStore = createZustandStore<RumsanAppStore>(
  (set, get) => ({
    ...initialStore,
    isAuthenticated: () => {
      const accessToken = get().accessToken;
      if (!accessToken) return false;
      if (accessToken.length < 2) return false;
      return JwtUtils.isJwtTokenExpired(accessToken as string);
    },
    setClientId: (clientId: string) => {
      set({
        clientId,
      });
    },
    setCurrentUser: (user) => {
      set({
        currentUser: user,
      });
    },
    clearCurrentUser: () => {
      set({
        currentUser: null,
      });
    },
    setChallenge: (challenge) =>
      set({
        challenge,
      }),
    setAppId: (appId) => {
      set({
        appId,
      });
    },
    setAccessToken: (accessToken) =>
      set({
        accessToken,
      }),
    setInitialization(d) {
      set({
        ...d,
      });
    },
    clearAuth: () => {
      set(initialStore);
      if (window && window.localStorage) window.localStorage.clear();
    },
  }),
  {
    devtoolsEnabled: true,
    persistOptions: {
      name: 'RumsanAppStore',
      storage: localStore,
    },
  },
);
