import {
    ForbiddenException,
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
    OtpDto,
    OtpLoginDto,
    ResetPasswordDto,
    SetPasswordDto,
    WalletLoginDto
} from '@rumsan/extensions/dtos';
import { ERRORS } from '@rumsan/extensions/exceptions';
import { PrismaService } from '@rumsan/prisma';
import { CONSTANTS } from '@rumsan/sdk/constants';
import { Service } from '@rumsan/sdk/enums';
import { Request } from '@rumsan/sdk/types';
import { hashMessage, recoverAddress } from 'viem';
import { EVENTS } from '../constants';
import { createChallenge, decryptChallenge } from '../utils/challenge.utils';
import { getSecret } from '../utils/config.utils';
import {
    hashPassword,
    validatePasswordStrength,
    verifyPassword,
} from '../utils/password.utils';
import { getServiceTypeByAddress } from '../utils/service.utils';
import { TokenDataInterface } from './interfaces/auth.interface';

@Injectable()
export class AuthsService {
  private readonly logger = new Logger(AuthsService.name);
  constructor(
    protected prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
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
    if (requestInfo.ip !== challengeData.ip) throw ERRORS.NO_MATCH_IP;

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
   * Validate user credentials for password-based login
   * Used by LocalStrategy
   */
  async validateUser(
    identifier: string,
    password: string,
    service?: Service,
  ): Promise<any> {
    // Determine service type if not provided
    if (!service) {
      try {
        service = getServiceTypeByAddress(identifier) as Service;
      } catch (error) {
        this.logger.warn(`Invalid identifier format: ${identifier}`);
        return null;
      }
    }

    // Only EMAIL, PHONE, and USERNAME support password auth
    if (
      service !== Service.EMAIL &&
      service !== Service.PHONE &&
      service !== Service.USERNAME
    ) {
      this.logger.warn(`Password auth not supported for service: ${service}`);
      return null;
    }

    // Find auth record
    const auth = await this.prisma.auth.findUnique({
      where: {
        authIdentifier: {
          service,
          serviceId: identifier,
        },
      },
      include: {
        User: true,
      },
    });

    if (!auth) {
      this.logger.warn(`Auth record not found for ${service}: ${identifier}`);
      return null;
    }

    // Check if account is locked
    if (auth.isLocked) {
      const lockDuration =
        this.config.get<number>('ACCOUNT_LOCKOUT_DURATION_MINUTES') || 15;
      const lockoutTime = new Date(
        auth.lockedOnAt!.getTime() + lockDuration * 60000,
      );

      if (new Date() < lockoutTime) {
        throw ERRORS.ACCOUNT_LOCKED;
      } else {
        // Unlock account if lockout period has passed
        await this.prisma.auth.update({
          where: { id: auth.id },
          data: { isLocked: false, falseAttempts: 0, lockedOnAt: null },
        });
      }
    }

    // Check if password is set
    if (!auth.passwordHash) {
      this.logger.warn(`No password set for ${service}: ${identifier}`);
      return null;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, auth.passwordHash);

    if (!isPasswordValid) {
      // Increment false attempts
      const newAttempts = auth.falseAttempts + 1;
      const threshold =
        this.config.get<number>('ACCOUNT_LOCKOUT_THRESHOLD') || 5;

      if (newAttempts >= threshold) {
        await this.prisma.auth.update({
          where: { id: auth.id },
          data: {
            falseAttempts: newAttempts,
            isLocked: true,
            lockedOnAt: new Date(),
          },
        });
        throw ERRORS.ACCOUNT_LOCKED;
      } else {
        await this.prisma.auth.update({
          where: { id: auth.id },
          data: { falseAttempts: newAttempts },
        });
      }

      return null;
    }

    // Reset false attempts on successful login
    await this.prisma.auth.update({
      where: { id: auth.id },
      data: { falseAttempts: 0 },
    });

    return auth.User;
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
    const clientId = requestInfo.clientId || `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;

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
      requireDigit:
        this.config.get<boolean>('PASSWORD_REQUIRE_DIGIT') ?? true,
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
      throw new ForbiddenException('Password already set. Use change password instead.');
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
      requireDigit:
        this.config.get<boolean>('PASSWORD_REQUIRE_DIGIT') ?? true,
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
      requireDigit:
        this.config.get<boolean>('PASSWORD_REQUIRE_DIGIT') ?? true,
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
}
