import { Permission, PermissionSet } from '.';

export type Role = {
  id?: number;
  name: string;
  isSystem?: boolean;
  permissions?: Permission[];
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  createdBy?: number;
  updatedBy?: number;
};

export type RoleWithPermission = {
  role: Role;
  permissions: PermissionSet;
};
