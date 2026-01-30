import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { AuthSession, User } from '@prisma/client';
import {
  ChallengeDto,
  CreateServiceClientDto,
  OtpDto,
  OtpLoginDto,
  ResetPasswordDto,
  ServiceAuthDto,
  SetPasswordDto,
  WalletLoginDto,
} from '@rumsan/extensions/dtos';
import { ERRORS as EXT_ERRORS } from '@rumsan/extensions/exceptions';
import { PrismaService } from '@rumsan/prisma';
import { CONSTANTS } from '@rumsan/sdk/constants';
import { Service } from '@rumsan/sdk/enums';
import { Request } from '@rumsan/sdk/types';
import { randomBytes } from 'crypto';
import { hashMessage, recoverAddress } from 'viem';
import { ERRORS, EVENTS } from '../constants';
import { createChallenge, decryptChallenge } from '../utils/challenge.utils';
import { getSecret } from '../utils/config.utils';
import {
  hashPassword,
  validatePasswordStrength,
  verifyPassword,
} from '../utils/password.utils';
import { getServiceTypeByAddress } from '../utils/service.utils';
import { TokenDataInterface } from './interfaces/auth.interface';
import { ServiceTokenPayload } from './interfaces/service-auth.interface';
import { RateLimitService } from './services/rate-limit.service';

@Injectable()
export class AuthsService {
  private readonly logger = new Logger(AuthsService.name);
  public request?: any; // Request context injected by LocalStrategy

  constructor(
    protected prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
    private rateLimitService: RateLimitService,
  ) {}

  getUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  }

  async getOtp(dto: OtpDto, requestInfo: Request) {
    if (!dto.service) {
      dto.service = getServiceTypeByAddress(dto.address) as Service;
    }
    const auth = await this.prisma.auth.findUnique({
      where: {
        authIdentifier: {
          service: dto.service as Service,
          serviceId: dto.address,
        },
      },
    });
    if (!auth) throw new ForbiddenException(`Invalid ${dto.service}!`);
    const otp = Math.floor(100000 + Math.random() * 900000);
    await this.prisma.auth.update({
      where: {
        id: auth.id,
      },
      data: {
        challenge: otp.toString(),
      },
    });
    const user = await this.getUserById(auth.userId);
    if (!user) throw new ForbiddenException('User does not exist!');
    const challenge = createChallenge(getSecret(), {
      address: dto.address,
      clientId: dto.clientId,
      ip: requestInfo.ip,
    });
    this.eventEmitter.emit(EVENTS.OTP_CREATED, {
      ...dto,
      requestInfo,
      name: user?.name,
      otp,
    });
    this.eventEmitter.emit(EVENTS.CHALLENGE_CREATED, {
      ...dto,
      requestInfo,
      challenge,
    });
    this.logger.log('OTP created: ' + otp);
    const { ip, ...response } = challenge;

    return response;
  }

  async loginByOtp(dto: OtpLoginDto, requestInfo: Request) {
    const { challenge, otp } = dto;
    const challengeData = decryptChallenge(
      getSecret(),
      challenge,
      CONSTANTS.CLIENT_TOKEN_LIFETIME,
    );
    if (!challengeData.address)
      throw new ForbiddenException('Invalid credentials in challenge!');
    if (!dto.service) {
      dto.service = getServiceTypeByAddress(challengeData.address) as Service;
    }

    const auth = await this.getByServiceId(
      challengeData.address,
      dto.service as Service,
    );

    if (!auth) throw new ForbiddenException('Invalid credentials!');
    if (otp.toString() !== auth.challenge)
      throw new ForbiddenException('OTP did not match!');
    // Get user by authAddress
    const user = await this.getUserById(auth.userId);
    if (!user) throw new ForbiddenException('User does not exist!');
    const authority = await this.getPermissionsByUserId(auth.userId);
    await this.updateLastLogin(auth.id);

    // Add authLog
    const session = await this.prisma.authSession
      .create({
        data: {
          clientId: challengeData.clientId,
          authId: auth.id,
          ip: requestInfo.ip,
          userAgent: requestInfo.userAgent,
        },
      })
      .then();
    return this.signToken(user, authority, session);
  }

  getChallengeForWallet(dto: ChallengeDto, requestInfo: Request) {
    return createChallenge(getSecret(), {
      clientId: dto.clientId,
      ip: requestInfo.ip,
    });
  }

  async loginByWallet(dto: WalletLoginDto, requestInfo: Request) {
    const challengeData = decryptChallenge(
      getSecret(),
      dto.challenge,
      CONSTANTS.CLIENT_TOKEN_LIFETIME,
    );
    if (requestInfo.ip !== challengeData.ip) throw EXT_ERRORS.NO_MATCH_IP;

    const hash = hashMessage(dto.challenge);
    const walletAddress = await recoverAddress({
      hash,
      signature: dto.signature,
    });

    const auth = await this.getByServiceId(walletAddress, Service.WALLET);
    if (!auth) throw new ForbiddenException('Invalid credentials!');
    const user = await this.getUserById(auth.userId);
    if (!user) throw new ForbiddenException('User does not exist!');
    const authority = await this.getPermissionsByUserId(auth.userId);
    await this.updateLastLogin(auth.id);

    // Add authLog
    const session = await this.prisma.authSession.create({
      data: {
        clientId: challengeData.clientId,
        authId: auth.id,
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
      },
    });

    return this.signToken(user, authority, session);
  }

  async getRolesByUserId(userId: number) {
    const user = await this.getUserById(userId);
    if (!user) throw new ForbiddenException('User does not exist!');
    const roles = await this.prisma.userRole.findMany({
      where: {
        userId, //TODO get rid of expired roles (from userRoles and roles tables)
      },

      select: {
        roleId: true,
        Role: {
          select: {
            name: true,
          },
        },
      },
    });
    return roles.map(({ roleId, Role }) => ({
      roleId,
      roleName: Role?.name,
    }));
  }

  async getPermissionsByUserId(userId: number) {
    const roles = await this.getRolesByUserId(userId);
    const rolesIdArray = roles.map((role) => role.roleId);
    const permissions = await this.prisma.permission.findMany({
      where: {
        roleId: {
          in: rolesIdArray,
        },
      },
      select: {
        action: true,
        subject: true,
        inverted: true,
        conditions: true,
      },
    });
    return { roles, permissions };
  }

  getByServiceId(serviceId: string, service: Service) {
    return this.prisma.auth.findUnique({
      where: {
        authIdentifier: {
          serviceId,
          service,
        },
      },
    });
  }

  updateLastLogin(id: number) {
    return this.prisma.auth.update({
      where: {
        id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  create(userId: number, serviceId: string, service: Service) {
    return this.prisma.auth.create({
      data: {
        userId,
        service,
        serviceId,
      },
    });
  }

  createEmail(userId: number, email: string) {
    console.log('createEmail', userId, email);
    return this.create(userId, email, Service.EMAIL);
  }

  createPhone(userId: number, phone: string) {
    return this.create(userId, phone, Service.PHONE);
  }

  createWallet(userId: number, wallet: string) {
    return this.create(userId, wallet, Service.WALLET);
  }

  async signToken(
    user: User,
    authority: any,
    session: AuthSession,
  ): Promise<{ accessToken: string }> {
    const { sessionId } = session;
    const { id, uuid, name, email, phone, wallet } = user;
    const payload: TokenDataInterface = {
      id: id,
      userId: id,
      uuid,
      name,
      email,
      phone,
      wallet,
      roles: authority.roles.map((role: any) => role.roleName),
      permissions: authority.permissions,
      sessionId,
    };

    const expiryTime = this.config.get('JWT_EXPIRATION_TIME');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: expiryTime,
      secret: getSecret(),
    });

    return {
      accessToken: token,
    };
  }

  validateToken(token: string) {
    return this.jwt.verify(token, {
      secret: getSecret(),
    });
  }

  // ================== Password Authentication Methods ==================

  /**
   * Validate user credentials with constant-time response
   * CRITICAL: Always takes ~100ms regardless of username validity
   * Used by LocalStrategy
   */
  async validateUser(
    identifier: string,
    passwordInput: string,
    service?: Service,
  ): Promise<any> {
    const startTime = Date.now();
    let user = null;
    let authId: number | undefined;
    let failReason: string | undefined;

    // Extract IP and userAgent from request context
    const ip =
      this.request?.ip || this.request?.connection?.remoteAddress || 'unknown';
    const userAgent =
      this.request?.headers?.['user-agent'] ||
      this.request?.get?.('user-agent');

    try {
      // LAYER 1: Check IP rate limit (before any processing)
      await this.rateLimitService.checkIpRateLimit(ip);

      // Auto-detect service type if not provided
      if (!service) {
        try {
          service = getServiceTypeByAddress(identifier) as Service;
        } catch (error) {
          service = Service.USERNAME; // Default to USERNAME if detection fails
        }
      }

      // Only EMAIL, PHONE, and USERNAME support password auth
      if (
        service !== Service.EMAIL &&
        service !== Service.PHONE &&
        service !== Service.USERNAME
      ) {
        this.logger.warn(`Password auth not supported for service: ${service}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Normalize identifier for USERNAME service (case-insensitive)
      const lookupIdentifier =
        service === Service.USERNAME ? identifier.toLowerCase() : identifier;

      // LAYER 2: Check identifier rate limit
      await this.rateLimitService.checkIdentifierRateLimit(
        lookupIdentifier,
        service,
      );

      // LAYER 3: Find auth record
      const auth = await this.findAuthRecord(service, lookupIdentifier);
      authId = auth?.id;

      // LAYER 4: Check account lockout
      if (auth?.isLocked) {
        const wasUnlocked = await this.checkAndUnlockAccount(auth);
        if (!wasUnlocked) {
          failReason = 'Account is locked';
          throw ERRORS.ACCOUNT_LOCKED;
        }
      }

      // LAYER 5: Verify password (ALWAYS verify, even with dummy hash)
      // This ensures constant timing regardless of username existence
      const passwordHash = (auth as any)?.passwordHash;
      const hashToCheck =
        passwordHash ||
        '$2b$10$dummyHashToMaintainConstantTimingForSecurity1234567890';

      const isPasswordValid = await verifyPassword(passwordInput, hashToCheck);

      // LAYER 6: Validate all conditions
      if (!auth || !passwordHash) {
        failReason = 'Invalid credentials - no auth record';
        user = null;
      } else if (!isPasswordValid) {
        failReason = 'Invalid credentials - wrong password';
        user = null;
      } else {
        // Success!
        user = await this.getUserById(auth.userId);
        failReason = undefined;
      }
    } catch (error) {
      if (
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.TOO_MANY_REQUESTS
      ) {
        throw error; // Re-throw rate limit errors
      }
      if (error === ERRORS.ACCOUNT_LOCKED) {
        failReason = 'Account is locked';
        throw error;
      }
      failReason = error instanceof Error ? error.message : 'Unknown error';
      user = null;
    }

    // LAYER 7: Log attempt (for audit and rate limiting)
    await this.rateLimitService
      .logAttempt({
        authId,
        identifier:
          service === Service.USERNAME ? identifier.toLowerCase() : identifier,
        service: service || Service.USERNAME,
        ip,
        userAgent,
        success: !!user,
        failReason,
      })
      .catch(() => {
        // Silent fail - don't block login if logging fails
      });

    // LAYER 8: Handle failed attempt
    if (!user && authId) {
      await this.incrementFailedAttempts(authId);
    }

    // LAYER 9: Handle successful login
    if (user && authId) {
      await this.resetFailedAttempts(authId);
    }

    // LAYER 10: Ensure constant timing (100ms minimum)
    const elapsed = Date.now() - startTime;
    const minTime = this.config.get<number>('AUTH_MIN_RESPONSE_TIME_MS', 100);
    if (elapsed < minTime) {
      await new Promise((resolve) => setTimeout(resolve, minTime - elapsed));
    }

    // Always return same error message (no enumeration)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Find auth record with case-insensitive lookup for USERNAME
   */
  private async findAuthRecord(service: Service, identifier: string) {
    if (service === Service.USERNAME) {
      // Case-insensitive lookup for USERNAME
      return this.prisma.auth.findFirst({
        where: {
          service: Service.USERNAME,
          serviceIdLower: identifier.toLowerCase(),
        } as any,
      });
    } else {
      // Normal lookup for EMAIL/PHONE
      return this.prisma.auth.findUnique({
        where: {
          authIdentifier: { service, serviceId: identifier },
        },
      });
    }
  }

  /**
   * Check if account should be unlocked and unlock if time has passed
   * Returns true if account was unlocked
   */
  private async checkAndUnlockAccount(auth: any): Promise<boolean> {
    if (!auth.isLocked || !auth.lockedOnAt) {
      return false;
    }

    const lockoutDuration = this.config.get<number>(
      'ACCOUNT_LOCKOUT_DURATION_MINUTES',
      15,
    );
    const unlockTime = new Date(
      auth.lockedOnAt.getTime() + lockoutDuration * 60 * 1000,
    );

    if (new Date() >= unlockTime) {
      // Time has passed, unlock account
      await this.prisma.auth.update({
        where: { id: auth.id },
        data: { isLocked: false, falseAttempts: 0, lockedOnAt: null },
      });
      return true;
    }

    return false;
  }

  /**
   * Increment failed attempts and lock if threshold reached
   */
  private async incrementFailedAttempts(authId: number): Promise<void> {
    const threshold = this.config.get<number>('ACCOUNT_LOCKOUT_THRESHOLD', 5);

    // Update and get the new falseAttempts count
    await this.prisma.auth.update({
      where: { id: authId },
      data: {
        falseAttempts: { increment: 1 },
        lastFailedAt: new Date(),
      } as any,
    });

    // Fetch the updated auth to check falseAttempts
    const auth = await this.prisma.auth.findUnique({
      where: { id: authId },
      select: { falseAttempts: true },
    });

    if (auth && auth.falseAttempts >= threshold) {
      await this.prisma.auth.update({
        where: { id: authId },
        data: {
          isLocked: true,
          lockedOnAt: new Date(),
          lockCount: { increment: 1 },
          falseAttempts: 0,
        } as any,
      });
    }
  }

  /**
   * Reset failed attempts on successful login
   */
  private async resetFailedAttempts(authId: number): Promise<void> {
    await this.prisma.auth.update({
      where: { id: authId },
      data: {
        falseAttempts: 0,
        isLocked: false,
        lastFailedAt: null,
      } as any,
    });
  }

  /**
   * Create auth session and return JWT token
   * Used after successful password authentication
   */
  async createAuthSessionAndToken(user: User, requestInfo: Request) {
    // Find any auth record for this user to create session
    const auth = await this.prisma.auth.findFirst({
      where: { userId: user.id },
    });

    if (!auth) {
      throw new ForbiddenException('No auth record found for user');
    }

    const authority = await this.getPermissionsByUserId(user.id);
    await this.updateLastLogin(auth.id);

    // Generate clientId if not provided
    const clientId =
      requestInfo.clientId ||
      `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create auth session
    const session = await this.prisma.authSession.create({
      data: {
        clientId,
        authId: auth.id,
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
      },
    });

    return this.signToken(user, authority, session);
  }

  /**
   * Set password for a user (first time)
   */
  async setPassword(userId: number, dto: SetPasswordDto) {
    // Validate password strength
    const validation = validatePasswordStrength(dto.password, {
      minLength: this.config.get<number>('PASSWORD_MIN_LENGTH') || 8,
      requireUppercase:
        this.config.get<boolean>('PASSWORD_REQUIRE_UPPERCASE') ?? true,
      requireLowercase:
        this.config.get<boolean>('PASSWORD_REQUIRE_LOWERCASE') ?? true,
      requireDigit: this.config.get<boolean>('PASSWORD_REQUIRE_DIGIT') ?? true,
      requireSpecial:
        this.config.get<boolean>('PASSWORD_REQUIRE_SPECIAL') ?? true,
    });

    if (!validation.isValid) {
      throw new ForbiddenException(
        `Password too weak: ${validation.errors.join(', ')}`,
      );
    }

    // Check password confirmation
    if (dto.password !== dto.confirmPassword) {
      throw new ForbiddenException('Passwords do not match');
    }

    // Find auth record for the service
    const auth = await this.prisma.auth.findFirst({
      where: {
        userId,
        service: dto.service,
      },
    });

    if (!auth) {
      throw new ForbiddenException(
        `No ${dto.service} auth record found for this user`,
      );
    }

    // Check if password already exists
    if (auth.passwordHash) {
      throw new ForbiddenException(
        'Password already set. Use change password instead.',
      );
    }

    // Hash and store password
    const passwordHash = await hashPassword(dto.password);
    await this.prisma.auth.update({
      where: { id: auth.id },
      data: { passwordHash },
    });

    this.logger.log(`Password set for user ${userId} on ${dto.service}`);
    return { message: 'Password set successfully' };
  }

  /**
   * Update existing password
   */
  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
    service: Service,
  ) {
    // Find auth record
    const auth = await this.prisma.auth.findFirst({
      where: {
        userId,
        service,
      },
    });

    if (!auth || !auth.passwordHash) {
      throw new ForbiddenException('No password set for this service');
    }

    // Verify old password
    const isOldPasswordValid = await verifyPassword(
      oldPassword,
      auth.passwordHash,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password strength
    const validation = validatePasswordStrength(newPassword, {
      minLength: this.config.get<number>('PASSWORD_MIN_LENGTH') || 8,
      requireUppercase:
        this.config.get<boolean>('PASSWORD_REQUIRE_UPPERCASE') ?? true,
      requireLowercase:
        this.config.get<boolean>('PASSWORD_REQUIRE_LOWERCASE') ?? true,
      requireDigit: this.config.get<boolean>('PASSWORD_REQUIRE_DIGIT') ?? true,
      requireSpecial:
        this.config.get<boolean>('PASSWORD_REQUIRE_SPECIAL') ?? true,
    });

    if (!validation.isValid) {
      throw new ForbiddenException(
        `Password too weak: ${validation.errors.join(', ')}`,
      );
    }

    // Check confirmation
    if (newPassword !== confirmPassword) {
      throw new ForbiddenException('New passwords do not match');
    }

    // Hash and update password
    const passwordHash = await hashPassword(newPassword);
    await this.prisma.auth.update({
      where: { id: auth.id },
      data: { passwordHash, falseAttempts: 0 },
    });

    this.logger.log(`Password updated for user ${userId} on ${service}`);
    return { message: 'Password updated successfully' };
  }

  /**
   * Reset password using OTP
   */
  async resetPasswordWithOtp(dto: ResetPasswordDto, requestInfo: Request) {
    // Determine service if not provided
    let service = dto.service;
    if (!service) {
      service = getServiceTypeByAddress(dto.identifier) as Service;
    }

    // Find auth record
    const auth = await this.prisma.auth.findUnique({
      where: {
        authIdentifier: {
          service,
          serviceId: dto.identifier,
        },
      },
    });

    if (!auth) {
      throw new ForbiddenException('Invalid credentials');
    }

    // Verify OTP
    if (dto.otp !== auth.challenge) {
      throw new ForbiddenException('Invalid OTP');
    }

    // Validate new password
    const validation = validatePasswordStrength(dto.newPassword, {
      minLength: this.config.get<number>('PASSWORD_MIN_LENGTH') || 8,
      requireUppercase:
        this.config.get<boolean>('PASSWORD_REQUIRE_UPPERCASE') ?? true,
      requireLowercase:
        this.config.get<boolean>('PASSWORD_REQUIRE_LOWERCASE') ?? true,
      requireDigit: this.config.get<boolean>('PASSWORD_REQUIRE_DIGIT') ?? true,
      requireSpecial:
        this.config.get<boolean>('PASSWORD_REQUIRE_SPECIAL') ?? true,
    });

    if (!validation.isValid) {
      throw new ForbiddenException(
        `Password too weak: ${validation.errors.join(', ')}`,
      );
    }

    // Check confirmation
    if (dto.newPassword !== dto.confirmPassword) {
      throw new ForbiddenException('Passwords do not match');
    }

    // Hash and update password
    const passwordHash = await hashPassword(dto.newPassword);
    await this.prisma.auth.update({
      where: { id: auth.id },
      data: {
        passwordHash,
        challenge: null, // Clear OTP after use
        falseAttempts: 0,
        isLocked: false,
        lockedOnAt: null,
      },
    });

    this.logger.log(`Password reset for ${service}: ${dto.identifier}`);
    return { message: 'Password reset successfully' };
  }

  /**
   * Check if user has a password set for a service
   */
  async hasPassword(userId: number, service: Service) {
    const auth = await this.prisma.auth.findFirst({
      where: {
        userId,
        service,
      },
      select: {
        passwordHash: true,
      },
    });

    return {
      hasPassword: !!auth?.passwordHash,
      service,
    };
  }

  // ================== Service Authentication (OAuth2 Client Credentials) ==================

  /**
   * Authenticate a service using client_id and client_secret (OAuth2 Client Credentials Flow)
   * Returns a Service JWT with role: "INTERNAL_SERVICE"
   */
  async authenticateService(
    dto: ServiceAuthDto,
  ): Promise<{ accessToken: string }> {
    const { clientId, clientSecret } = dto;

    const serviceClient = await this.prisma.serviceClient.findUnique({
      where: { clientId },
    });

    if (!serviceClient || serviceClient.deletedAt) {
      this.logger.warn(`Service auth failed: client not found - ${clientId}`);
      throw new UnauthorizedException('Invalid client credentials');
    }

    if (!serviceClient.isActive) {
      this.logger.warn(`Service auth failed: client inactive - ${clientId}`);
      throw new UnauthorizedException('Service client is inactive');
    }

    // Verify client secret
    const isSecretValid = await verifyPassword(
      clientSecret,
      serviceClient.clientSecret,
    );
    if (!isSecretValid) {
      this.logger.warn(`Service auth failed: invalid secret - ${clientId}`);
      throw new UnauthorizedException('Invalid client credentials');
    }

    // Update last used timestamp
    await this.prisma.serviceClient.update({
      where: { id: serviceClient.id },
      data: { lastUsedAt: new Date() },
    });

    // Generate service JWT
    const payload: ServiceTokenPayload = {
      clientId: serviceClient.clientId,
      serviceName: serviceClient.name,
      role: 'INTERNAL_SERVICE',
    };

    const expiryTime = this.config.get('SERVICE_JWT_EXPIRATION_TIME') || '1h';

    const token = await this.jwt.signAsync(payload, {
      expiresIn: expiryTime,
      secret: getSecret(),
    });

    this.logger.log(`Service authenticated: ${serviceClient.name}`);

    return { accessToken: token };
  }

  /**
   * Create a new service client
   * Returns the clientId and plaintext clientSecret (only shown once)
   */
  async createServiceClient(
    dto: CreateServiceClientDto,
    createdBy?: number,
  ): Promise<{ clientId: string; clientSecret: string; name: string }> {
    // Generate a secure random secret
    const plainSecret = randomBytes(32).toString('hex');
    const hashedSecret = await hashPassword(plainSecret);

    const serviceClient = await this.prisma.serviceClient.create({
      data: {
        name: dto.name,
        description: dto.description,
        clientSecret: hashedSecret,
        createdBy,
      },
    });

    this.logger.log(
      `Service client created: ${dto.name} (${serviceClient.clientId})`,
    );

    return {
      clientId: serviceClient.clientId,
      clientSecret: plainSecret, // Only returned once during creation
      name: serviceClient.name,
    };
  }

  /**
   * Regenerate client secret for a service client
   * Returns the new plaintext clientSecret (only shown once)
   */
  async regenerateServiceClientSecret(
    clientId: string,
  ): Promise<{ clientId: string; clientSecret: string }> {
    const serviceClient = await this.prisma.serviceClient.findUnique({
      where: { clientId },
    });

    if (!serviceClient || serviceClient.deletedAt) {
      throw new ForbiddenException('Service client not found');
    }

    const plainSecret = randomBytes(32).toString('hex');
    const hashedSecret = await hashPassword(plainSecret);

    await this.prisma.serviceClient.update({
      where: { id: serviceClient.id },
      data: { clientSecret: hashedSecret },
    });

    this.logger.log(`Service client secret regenerated: ${serviceClient.name}`);

    return {
      clientId,
      clientSecret: plainSecret,
    };
  }

  /**
   * Update service client permissions
   */
  async updateServiceClientPermissions(
    clientId: string,
    permissions: {
      canImpersonate?: boolean;
      allowedRoles?: string[];
      rateLimit?: number;
      isActive?: boolean;
    },
  ) {
    const serviceClient = await this.prisma.serviceClient.findUnique({
      where: { clientId },
    });

    if (!serviceClient || serviceClient.deletedAt) {
      throw new ForbiddenException('Service client not found');
    }

    await this.prisma.serviceClient.update({
      where: { id: serviceClient.id },
      data: permissions,
    });

    this.logger.log(`Service client updated: ${serviceClient.name}`);

    return { success: true };
  }

  /**
   * List all service clients (without secrets)
   */
  async listServiceClients() {
    return this.prisma.serviceClient.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        clientId: true,
        name: true,
        description: true,
        isActive: true,
        canImpersonate: true,
        allowedRoles: true,
        rateLimit: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Delete (soft) a service client
   */
  async deleteServiceClient(clientId: string) {
    const serviceClient = await this.prisma.serviceClient.findUnique({
      where: { clientId },
    });

    if (!serviceClient || serviceClient.deletedAt) {
      throw new ForbiddenException('Service client not found');
    }

    await this.prisma.serviceClient.update({
      where: { id: serviceClient.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    this.logger.log(`Service client deleted: ${serviceClient.name}`);

    return { success: true };
  }
}
