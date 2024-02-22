import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { Service, User } from '@prisma/client';
import { ERRORS, Enums, TRequestDetails } from '@rumsan/core';
import { PrismaService } from '@rumsan/prisma';
import { CONSTANTS } from '@rumsan/sdk/constants';
import {
  ChallengeDto,
  OtpDto,
  OtpLoginDto,
  WalletLoginDto,
} from '@rumsan/sdk/dtos';
import { createChallenge, decryptChallenge } from '@rumsan/sdk/utils';
import { hashMessage, recoverAddress } from 'viem';
import { EVENTS } from '../constants';
import { getSecret } from '../utils/configUtils';
import { getServiceTypeByAddress } from '../utils/service.utils';
import { TokenDataInterface } from './interfaces/auth.interface';
@Injectable()
export class AuthsService {
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

  async getOtp(dto: OtpDto, requestInfo: TRequestDetails) {
    if (!dto.service) {
      dto.service = getServiceTypeByAddress(dto.address) as Enums.Service;
    }
    const auth = await this.prisma.auth.findUnique({
      where: {
        authIdentifier: {
          service: dto.service as Service,
          serviceId: dto.address,
        },
      },
    });
    if (!auth) throw new ForbiddenException('Invalid credentials!');
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

    return challenge;
  }

  async loginByOtp(dto: OtpLoginDto, requestInfo: TRequestDetails) {
    const { challenge, otp } = dto;
    const challengeData = decryptChallenge(
      getSecret(),
      challenge,
      CONSTANTS.CLIENT_TOKEN_LIFETIME,
    );
    if (!challengeData.address)
      throw new ForbiddenException('Invalid credentials in challenge!');
    if (!dto.service) {
      dto.service = getServiceTypeByAddress(
        challengeData.address,
      ) as Enums.Service;
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

    // Add authLog
    this.prisma.authSession
      .create({
        data: {
          clientId: challengeData.clientId,
          authId: auth.id,
          ip: requestInfo.ip,
          userAgent: requestInfo.userAgent,
        },
      })
      .then();
    return this.signToken(user, authority);
  }

  getChallengeForWallet(dto: ChallengeDto, requestInfo: TRequestDetails) {
    return createChallenge(getSecret(), {
      clientId: dto.clientId,
      ip: requestInfo.ip,
    });
  }

  async loginByWallet(dto: WalletLoginDto, requestInfo: TRequestDetails) {
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

    // Add authLog
    this.prisma.authSession.create({
      data: {
        clientId: challengeData.clientId,
        authId: auth.id,
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
      },
    });

    return this.signToken(user, authority);
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
  ): Promise<{ accessToken: string }> {
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
}
