import { createZustandStore } from '../utils/zustand.store';

type RoleState = {
  roles: any[];
};

type RoleStateAction = {
  setRoles: (roles: any) => void;
  clearRoles: () => void;
};

type RoleStore = RoleState & RoleStateAction;

export const useRoleStore = createZustandStore<RoleStore>(
  (set) => ({
    roles: [],
    setRoles: (roles) => set({ roles }),
    clearRoles: () => set({ roles: [] }),
  }),
  {
    devtoolsEnabled: true,
  },
);
