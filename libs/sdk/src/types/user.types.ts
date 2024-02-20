import { Gender } from '../enums';

export type TUser = {
  id?: number;
  uuid?: string;
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
  createdBy?: number;
  updatedBy?: number;
  permissions?: string[];
  roles?: string[];
};
