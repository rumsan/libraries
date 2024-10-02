import { Gender } from '../enums';

export type User = {
  id?: number;
  cuid?: string;
  name: string;
  gender?: Gender;
  email?: string;
  phone?: string;
  wallet?: string;
  extras?: Record<string, any>;
  notes?: string;
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
