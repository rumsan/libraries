import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@rumsan/prisma';
import { getSecret } from '../../utils/config.utils';

/**
 * Hybrid JWT Guard - Dynamically switches between User and Service strategies
 *
 * This guard allows the same route to be accessed by:
 * 1. Regular users (with normal JWT)
 * 2. External services (with Service JWT + optional impersonation)
 *
 * How it works:
 * - Decodes the JWT token from Authorization header
 * - If token has `role: "INTERNAL_SERVICE"`, treats it as a service request
 * - For service requests, handles X-Impersonate-Id header to load user context
 * - For regular users, just validates the token and attaches user to request
 */
@Injectable()
export class HybridJwtGuard implements CanActivate {
  private readonly logger = new Logger(HybridJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Decode and verify token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: getSecret(),
      });

      // Check if this is a service token
      if (payload.role === 'INTERNAL_SERVICE') {
        return this.handleServiceAuth(request, payload);
      }

      // Regular user token - attach to request
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Handle service authentication with optional impersonation
   */
  private async handleServiceAuth(
    request: any,
    payload: any,
  ): Promise<boolean> {
    const serviceClient = await this.prisma.serviceClient.findFirst({
      where: {
        clientId: payload.clientId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!serviceClient) {
      throw new UnauthorizedException('Service client not found or inactive');
    }

    const impersonateId = request.headers['x-impersonate-id'];

    if (impersonateId) {
      if (!serviceClient.canImpersonate) {
        // Log failed impersonation attempt
        this.logger.warn(
          `Service impersonation denied: service="${payload.serviceName}" ` +
            `clientId="${payload.clientId}" impersonateId="${impersonateId}" ` +
            `reason="Service not allowed to impersonate" ip="${request.ip || 'unknown'}"`,
        );
        throw new UnauthorizedException(
          'This service is not allowed to impersonate users',
        );
      }

      const user = await this.loadUserById(impersonateId);
      if (!user) {
        // Log failed impersonation attempt
        this.logger.warn(
          `Service impersonation denied: service="${payload.serviceName}" ` +
            `clientId="${payload.clientId}" impersonateId="${impersonateId}" ` +
            `reason="User not found" ip="${request.ip || 'unknown'}"`,
        );
        throw new UnauthorizedException('Impersonated user not found');
      }

      const userRoles = await this.prisma.userRole.findMany({
        where: { userId: user.id },
        include: { Role: true },
      });

      const userRoleNames = userRoles.map((ur: any) => ur.Role.name);
      // Check allowed roles restriction
      if (serviceClient.allowedRoles && serviceClient.allowedRoles.length > 0) {
        const canImpersonate = userRoleNames.some((role: string) =>
          serviceClient.allowedRoles.includes(role),
        );

        if (!canImpersonate) {
          // Log failed impersonation attempt
          this.logger.warn(
            `Service impersonation denied: service="${payload.serviceName}" ` +
              `clientId="${payload.clientId}" impersonateId="${impersonateId}" ` +
              `userId="${user.id}" userRoles="${userRoleNames.join(',')}" ` +
              `reason="User roles not allowed" ip="${request.ip || 'unknown'}"`,
          );
          throw new UnauthorizedException(
            'Service not allowed to impersonate users with these roles',
          );
        }
      }

      // Log successful impersonation
      this.logger.log(
        `Service impersonation granted: service="${payload.serviceName}" ` +
          `clientId="${payload.clientId}" impersonatedUser="${user.uuid}" ` +
          `userId="${user.id}" userName="${user.name}" userEmail="${user.email || 'none'}" ` +
          `userRoles="${userRoleNames.join(',')}" ip="${request.ip || 'unknown'}" ` +
          `userAgent="${request.headers['user-agent'] || 'unknown'}"`,
      );

      request.user = {
        id: user.id,
        userId: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        wallet: user.wallet,
        roles: userRoleNames,
        isServiceRequest: true,
        serviceClientId: payload.clientId,
        serviceName: payload.serviceName,
        impersonatedBy: payload.serviceName,
      };
    } else {
      request.user = {
        isServiceRequest: true,
        role: 'INTERNAL_SERVICE',
        clientId: payload.clientId,
        serviceName: payload.serviceName,
        permissions: [],
      };
    }

    return true;
  }

  /**
   * Extract Bearer token from Authorization header
   */
  private extractToken(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  /**
   * Load user by ID or UUID
   */
  private async loadUserById(id: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ id: isNaN(Number(id)) ? undefined : Number(id) }, { uuid: id }],
        deletedAt: null,
      },
    });
  }
}
