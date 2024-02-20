export type Role = {
  id?: number;
  name: string;
  permissions: Permission[];
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  createdBy?: number;
  updatedBy?: number;
};

export type Permission = {
  id?: number;
  roleId: number;
  action: string;
  subject: string;
  inverted: boolean;
  conditions: Record<string, any>;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
