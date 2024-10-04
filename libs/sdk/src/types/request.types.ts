import { User } from '@rumsan/sdk/types';

export interface RequestContext<T = Record<string, unknown>> {
  ip: string;
  userAgent: string;
  origin: string;
  currentUserId?: string;
  currentUser?: User;
  sessionId?: string;
  appId?: string;
  meta?: T;
}

export interface tRC<T = Record<string, unknown>> extends RequestContext<T> {}
