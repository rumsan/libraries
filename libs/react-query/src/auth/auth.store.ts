import { localStore } from '../utils/local.store';
import { zustandStore } from '../utils/zustand.store';

type AuthState = {
  token: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  challenge: string;
  service: string;
  address: string;
};

type AuthStateAction = {
  setAuth: (creds: any) => void;
  setChallenge: (challenge: string) => void;
  setService: (service: string) => void;
  setAddress: (address: string) => void;
  setToken: (token: string) => void;
  setInitialization: (d: any) => void;
};

type AuthStore = AuthState & AuthStateAction;

const initialStore = {
  token: '',
  isAuthenticated: false,
  isInitialized: false,
  challenge: '',
  service: 'EMAIL',
  address: '',
};

export const useAuthStore = zustandStore<AuthStore>(
  (set) => ({
    ...initialStore,
    setAuth: (creds) =>
      set({
        token: creds.token, // Fix: Use 'token' instead of 'creds'
      }),
    setChallenge: (challenge) =>
      set({
        challenge,
      }),
    setService: (service) =>
      set({
        service,
      }),
    setAddress: (address) =>
      set({
        address,
      }),
    setToken: (token) =>
      set({
        token,
      }),
    setInitialization(d) {
      set({
        ...d,
      });
    },
  }),
  {
    devtoolsEnabled: true,
    persistOptions: {
      name: 'authStore',
      storage: localStore,
    },
  },
);
