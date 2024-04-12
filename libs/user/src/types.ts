export { Permission, Role, Signup, UserRole } from '@prisma/client';

export type Auth = {
  id: number;
  userId: number;
  service: 'EMAIL' | 'PHONE' | 'WALLET';
  serviceId: string;
  details: any | null;
  challenge: string | null;
  falseAttempts: number;
  isLocked: boolean;
  lockedOnAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
};

export type User = {
  id: number;
  uuid: string;
  name: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  email: string | null;
  phone: string | null;
  wallet: string | null;
  extras: any | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdBy: number | null;
  updatedBy: number | null;
};
