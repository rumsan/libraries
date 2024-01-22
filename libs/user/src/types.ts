export { Permission, Role, Signup, UserRole } from '@prisma/client';

export enum Service {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  WALLET = 'WALLET',
}

export type Auth = {
  id: number;
  userId: number;
  service: Service;
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

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}

export type User = {
  id: number;
  uuid: string;
  name: string | null;
  gender: Gender;
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
