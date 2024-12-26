import { createZustandStore } from '../utils/zustand.store';

type UserState = {
  users: any[];
};

type UserStateAction = {
  setUsers: (users: any) => void;
  clearUsers: () => void;
};

type UserStore = UserState & UserStateAction;

export const useUserStore = createZustandStore<UserStore>(
  (set) => ({
    users: [],
    setUsers: (users) => set({ users }),
    clearUsers: () => set({ users: [] }),
  }),
  {
    devtoolsEnabled: true,
  },
);
