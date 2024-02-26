import { Enums } from '../enums';

export type User = {
  id?: number;
  uuid?: string;
  name: string;
  gender?: Enums.Gender;
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
