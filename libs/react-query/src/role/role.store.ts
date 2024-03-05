import { localStore } from '../utils/local.store';
import { zustandStore } from '../utils/zustand.store';

type RoleState = {
  role: any;
};

type RoleStateAction = {
  setRole: (role: any) => void;
  clearRole: () => void;
};

type RoleStore = RoleState & RoleStateAction;

export const useRoleStore = zustandStore<RoleStore>(
  (set) => ({
    role: null,
    setRole: (role) => set({ role }),
    clearRole: () => set({ role: null }),
  }),
  {
    devtoolsEnabled: true,
    persistOptions: {
      name: 'roleStore',
      storage: localStore,
    },
  },
);
