import { Gender } from '../enums';

export type User<T = Record<string, any>> = {
  id?: number;
  cuid?: string;
  name: string;
  gender?: Gender;
  email?: string;
  phone?: string;
  wallet?: string;
  notes?: string;
  sessionId?: string;
  details?: T;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  permissions?: string[];
  roles?: string[];
};

export type UserRole = {
  id: number;
  userId: number;
  roleId: number;
  expiry: Date | null;
  createdAt: Date;
  createdBy: number | null;
  name: string;
};
