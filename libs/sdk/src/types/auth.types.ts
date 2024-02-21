import { Service } from '../enums';

export type Auth = {
  id?: number;
  userId: number;
  service: Service;
  serviceId: string;
  details?: Record<string, any>;
  challenge?: string;
  falseAttempts?: number;
  isLocked?: boolean;
  lockedOnAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type AuthSession = {
  id: number;
  clientId: string;
  sessionId: string;
  authId: number;
  ip?: string;
  details?: Record<string, any>;
  userAgent?: string;
  createdAt: Date;
};

