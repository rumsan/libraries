export interface Request {
  ip: string;
  userAgent: string;
  origin: string;
  currentUser?: string;
  sessionId?: string;
  appId?: string;
  meta?: Record<string, any>;
}
