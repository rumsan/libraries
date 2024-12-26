import { Gender } from '../enums';
import { CommonFields } from './commonFields.type';

export type UserBase<T> = {
  id?: number;
  cuid?: string;
  gender?: Gender;
  email?: string;
  phone?: string;
  wallet?: string;
  notes?: string;
  sessionId?: string;
  details?: T;
  permissions?: string[];
  roles?: string[];
};

export type User<T = Record<string, unknown>> = UserBase<T> &
  CommonFields & { cuid: string };

export type UserRole = {
  id: number;
  userId: string;
  roleId: string;
  expiry: Date | null;
  createdAt: Date;
  createdBy: number | null;
  name: string;
};
