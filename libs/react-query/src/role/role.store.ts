import { localStore } from '../utils/local.store';
import { zustandStore } from '../utils/zustand.store';

type RoleState = {
  role: any;
  roles: any[];
};

type RoleStateAction = {
  setRole: (role: any) => void;
  setRoleList: (role: any) => void;
  clearRole: () => void;
};

type RoleStore = RoleState & RoleStateAction;

export const useRoleStore = zustandStore<RoleStore>(
  (set) => ({
    role: null,
    roles: [],
    setRoleList: (role) => set(role),
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
