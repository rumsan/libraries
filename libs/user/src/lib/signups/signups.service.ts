import { Inject, Injectable } from '@nestjs/common';
import {
  Prisma,
  PrismaClient,
  Service,
  Signup,
  SignupStatus,
} from '@prisma/client';
import {
  DefaultArgs,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';
import { CreateUserDto } from '@rumsan/extensions/dtos';
import { PaginatorTypes, PrismaService, paginator } from '@rumsan/prisma';
import { UsersService } from '../users/users.service';
import { SignupEmailDto, SignupListDto, SignupPasswordDto } from './dto';
import { SignupApproveDto } from './dto/signup-approve.dto';
import { SignupPhoneDto } from './dto/signup-phone.dto';
import { SignupWalletDto } from './dto/signup-wallet.dto';
import { SignupConfig } from './interfaces/signup-config.interfaces';

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 20 });
type PrismaClientType = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
>;
@Injectable()
export class SignupsService {
  constructor(
    @Inject('SIGNUP_CONFIG') private config: SignupConfig,
    protected prisma: PrismaService,
    private userService: UsersService,
  ) {}

  async signup(
    dto:
      | SignupEmailDto
      | SignupPhoneDto
      | SignupWalletDto
      | SignupPasswordDto,
  ) {
    let authIdentifier: { service: Service; serviceId: string };
    if (dto instanceof SignupPhoneDto)
      authIdentifier = { service: Service.PHONE, serviceId: dto.phone };
    else if (dto instanceof SignupWalletDto)
      authIdentifier = { service: Service.WALLET, serviceId: dto.wallet };
    else if (dto instanceof SignupPasswordDto) {
      // Check for username first, then email/phone
      if (dto.username) {
        authIdentifier = { service: Service.USERNAME, serviceId: dto.username };
      } else {
        // Validate that at least one identifier is provided
        if (!dto.email && !dto.phone) {
          throw new Error('At least one of username, email, or phone is required');
        }
        authIdentifier = {
          service: dto.service,
          serviceId: dto.service === Service.EMAIL ? dto.email! : dto.phone!,
        };
      }
    } else authIdentifier = { service: Service.EMAIL, serviceId: dto.email };

    if (await this.prisma.rsclient.auth.exists(authIdentifier))
      throw new Error('Already registered');

    const rec = await this.prisma.signup.create({
      data: {
        userIdentifier: authIdentifier.serviceId,
        data: {
          ...dto,
        },
      },
    });

    if (this.config.autoApprove) {
      await this.approve({ uuid: rec.uuid });
    }
    return rec;
  }

  async list(
    dto: SignupListDto,
  ): Promise<PaginatorTypes.PaginatedResult<Signup>> {
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[dto.sort] = dto.order;
    return paginate(
      this.prisma.signup,
      {
        where: {
          status: dto.status,
        },
        orderBy,
      },
      {
        page: dto.page,
        perPage: dto.perPage,
      },
    );
  }

  async approve(dto: SignupApproveDto) {
    const signup = await this.prisma.signup.findUnique({
      where: {
        uuid: dto.uuid,
      },
    });
    if (!signup) throw new Error('Signup not found');
    if (
      signup.status === SignupStatus.APPROVED ||
      signup.status === SignupStatus.REJECTED
    )
      throw new Error('Signup is already processed.');

    try {
      const signupData: any = signup.data;
      
      // Extract user data, excluding password-specific fields
      const { password, confirmPassword, service, ...userDataRaw } = signupData;
      const userData: CreateUserDto = <CreateUserDto>userDataRaw;

      const callback = async (err: any, tx: PrismaClientType) => {
        if (err) throw err;
        await tx.signup.update({
          where: {
            uuid: dto.uuid,
          },
          data: {
            status: SignupStatus.APPROVED,
            rejectedReason: null,
            approvedAt: new Date(),
          },
        });
      };

      const result = await this.userService.create(userData, callback);

      // Handle password signup - set password after user is created
      if (signupData.password && signupData.service) {
        const { hashPassword, validatePasswordStrength } = await import(
          '../utils/password.utils'
        );

        // Validate password
        const validation = validatePasswordStrength(signupData.password);
        if (!validation.isValid) {
          throw new Error(
            `Password too weak: ${validation.errors.join(', ')}`,
          );
        }

        // Check password confirmation
        if (signupData.password !== signupData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Hash and store password
        const passwordHash = await hashPassword(signupData.password);
        const auth = await this.prisma.auth.findFirst({
          where: {
            userId: result.id,
            service: signupData.service,
          },
        });

        if (auth) {
          await this.prisma.auth.update({
            where: { id: auth.id },
            data: { passwordHash } as any,
          });
        }
      }

      return result;
    } catch (err) {
      let rejectedReason = 'Unknown';
      if (err instanceof Error) rejectedReason = err.message;
      if (err instanceof PrismaClientKnownRequestError) {
        rejectedReason = err.message;
        console.log(err.message);
      }

      return this.prisma.signup.update({
        where: {
          uuid: dto.uuid,
        },
        data: {
          status: SignupStatus.FAILED,
          rejectedReason,
        },
      });
    }
  }
}
