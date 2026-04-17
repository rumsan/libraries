import { CurrentUserInterface } from './current-user.interface';

/**
 * Payload structure for Service JWT tokens
 * Used by external services authenticating via OAuth2 Client Credentials
 */
export interface ServiceTokenPayload {
  clientId: string;
  serviceName: string;
  role: 'INTERNAL_SERVICE';
  iat?: number;
  exp?: number;
}

/**
 * Extended user interface when request comes from a service
 * Includes metadata about the service making the request
 */
export interface ServiceUserContext extends Partial<CurrentUserInterface> {
  isServiceRequest: true;
  serviceClientId: string;
  serviceName: string;
  impersonatedBy?: string;
}

/**
 * Context when service makes request without impersonation
 */
export interface ServiceOnlyContext {
  isServiceRequest: true;
  role: 'INTERNAL_SERVICE';
  clientId: string;
  serviceName: string;
}
