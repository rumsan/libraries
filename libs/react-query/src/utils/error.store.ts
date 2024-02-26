import { zustandStore } from './zustand.store';

export interface ErrorRes extends Error {
  status?: number;
  response: any;
}

type ErrorState = {
  error: ErrorRes | null;
};

type ErrorActions = {
  setError: (error: ErrorRes) => void;
};

export type ErrorStore = ErrorState & ErrorActions;

export const useErrorStore = zustandStore<ErrorStore>(
  (set) => ({
    error: null,
    setError(error) {
      console.log('error', error);
      set({ error });
    },
  }),
  {
    devtoolsEnabled: true,
  },
);
