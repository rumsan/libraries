import { User } from './user.types';

export type LoginResponse = {
  accessToken: string;
  user?: User;
};
