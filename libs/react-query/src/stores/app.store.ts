import { createId } from '@paralleldrive/cuid2';
import { User } from '@rumsan/sdk';
import { JwtUtils } from '@rumsan/sdk/utils';
import { localStore } from '../utils/local.store';
import { createZustandStore } from '../utils/zustand.store';

type RumsanAppState = {
  accessToken: string | null;
  clientId: string | null;
  appId: string | null;
  challenge: string | null;
  currentUser: User | null;
  roles: Record<string, any> | null;

  isInitialized: boolean;
  isAuthenticated: boolean;
};

type RumsanAppStateFunctions = {
  initialize: (data: {
    clientId?: string;
    log?: string;
    callback?: () => void;
  }) => void;
  setClientId: (clientId: string | null) => void;
  setChallenge: (challenge: string | null | null) => void;
  setAppId: (appId: string | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setCurrentUser: (user: User | null) => void;
  clearCurrentUser: () => void;
  clearStore: () => void;
  logout: () => void;
};

type RumsanAppStore = RumsanAppState & RumsanAppStateFunctions;

const initialStore = {
  clientId: null,
  accessToken: null,
  appId: null,
  challenge: null,
  currentUser: null,
  roles: [],

  isInitialized: false,
  isAuthenticated: false,
};

export const useRumsanAppStore = createZustandStore<RumsanAppStore>(
  (set, get) => ({
    ...initialStore,

    // isAuthenticated: () => {
    //   const accessToken = get().accessToken;
    //   if (!accessToken) return false;
    //   if (accessToken.length < 2) return false;
    //   return JwtUtils.isJwtTokenExpired(accessToken as string);
    // },

    initialize: (data: {
      clientId?: string;
      log?: string;
      callback?: () => void;
    }) => {
      set({
        isInitialized: true,
        clientId: get().clientId || data.clientId || createId(),
      });

      const acToken = get().accessToken;
      if (acToken && !JwtUtils.isJwtTokenExpired(acToken as string)) {
        set({
          isAuthenticated: true,
        });
      }

      if (data.log) console.log(`RumsanAppStore: ${data.log}`);
      if (data.callback) data.callback();
    },
    setClientId: (clientId: string | null) => {
      set({
        clientId,
      });
    },
    setCurrentUser: (user: User | null) => {
      set({
        currentUser: user,
      });
    },
    clearCurrentUser: () => {
      set({
        currentUser: null,
      });
    },
    setChallenge: (challenge: string | null) =>
      set({
        challenge,
      }),
    setAppId: (appId: string | null) => {
      set({
        appId,
      });
    },

    setAccessToken: (accessToken: string | null) => {
      set({
        accessToken,
      });
      if (accessToken && !JwtUtils.isJwtTokenExpired(accessToken as string)) {
        set({
          isAuthenticated: true,
        });
      } else {
        set({
          isAuthenticated: false,
        });
      }
    },

    logout: () => {
      set({
        accessToken: null,
        currentUser: null,
        challenge: null,
        isAuthenticated: false,
      });
    },
    clearStore: () => {
      set(initialStore);
      if (window && window.localStorage) window.localStorage.clear();
      set({
        isAuthenticated: false,
      });
    },
  }),
  {
    devtoolsEnabled: true,
    persistOptions: {
      name: 'RumsanAppStore',
      storage: localStore,
      partialize: (state) => ({
        currentUser: state.currentUser,
        accessToken: state.accessToken,
        clientId: state.clientId,
        appId: state.appId,
      }),
    },
  },
);
