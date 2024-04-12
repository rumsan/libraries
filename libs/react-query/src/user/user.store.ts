import { localStore } from '../utils/local.store';
import { zustandStore } from '../utils/zustand.store';

type UserState = {
  user: any;
  currentUser: any;
  totalUser: number;
  users: any;
};

type UserStateAction = {
  setUser: (user: any) => void;
  clearUser: () => void;
  setTotalUser: (totalUser: number) => void;
  setUsers: (users: any) => void;
  setCurrentUser: (user: any) => void;
};

type UserStore = UserState & UserStateAction;

export const useUserStore = zustandStore<UserStore>(
  (set) => ({
    user: null,
    currentUser: null,
    totalUser: 0,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
    setTotalUser: (totalUser) =>
      set({
        totalUser,
      }),
    users: [],
    setCurrentUser: (user) => set({ user }),
    setUsers: (users) => set({ users }),
  }),
  {
    devtoolsEnabled: true,
    persistOptions: {
      name: 'userStore',
      storage: localStore,
    },
  },
);
