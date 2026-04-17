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
    dto: SignupEmailDto | SignupPhoneDto | SignupWalletDto | SignupPasswordDto,
  ) {
    // Validate password signup
    if (dto instanceof SignupPasswordDto) {
      // const { validatePasswordStrength } = await import(
      //   '../utils/password.utils'
      // );

      // Check password confirmation
      if (dto.password !== dto.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate password strength
      // const validation = validatePasswordStrength(dto.password);
      // if (!validation.isValid) {
      //   console.log(validation, 'password validation result');
      //   console.log(validation.isValid, 'is valid');
      //   throw new Error(`Password too weak: ${validation.errors.join(', ')}`);
      // }

      // console.log(validation, 'password validation result');
    }

    let authIdentifier: { service: Service; serviceId: string };
    if (dto instanceof SignupPhoneDto)
      authIdentifier = { service: Service.PHONE, serviceId: dto.phone };
    else if (dto instanceof SignupWalletDto)
      authIdentifier = { service: Service.WALLET, serviceId: dto.wallet };
    else if (dto instanceof SignupPasswordDto) {
      // Check for username first, then email/phone
      if (dto.username) {
        authIdentifier = { service: Service.USERNAME, serviceId: dto.username };
        console.log(
          authIdentifier,
          'auth identifier for password signup with username',
        );
      } else {
        // Validate that at least one identifier is provided
        if (!dto.email && !dto.phone) {
          throw new Error(
            'At least one of username, email, or phone is required',
          );
        }
        authIdentifier = {
          service: dto.service,
          serviceId: dto.service === Service.EMAIL ? dto.email! : dto.phone!,
        };
      }
    } else authIdentifier = { service: Service.EMAIL, serviceId: dto.email };

    // Safely extract possible identifiers from the DTO
    const username = (dto as any).username;
    const phone = (dto as any).phone;
    const email = (dto as any).email;

    const userWhere: Prisma.UserWhereInput = {
      OR: [
        username ? { username } : undefined,
        phone ? { phone } : undefined,
        email ? { email } : undefined,
      ].filter(Boolean) as Prisma.UserWhereInput[],
    };
    const existingUser = await this.prisma.user.findFirst({ where: userWhere });
    if (existingUser) {
      let reason = 'User with this ';
      if (username && existingUser.username === username) reason += 'username';
      else if (phone && existingUser.phone === phone) reason += 'phone number';
      else if (email && existingUser.email === email) reason += 'email';
      else reason += 'identifier';
      reason += ' already exists.';
      throw new Error(reason);
    }

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
      where: { uuid: dto.uuid },
    });

    if (!signup) throw new Error('Signup not found');

    if (
      signup.status === SignupStatus.APPROVED ||
      signup.status === SignupStatus.REJECTED
    ) {
      throw new Error('Signup is already processed.');
    }

    try {
      const signupData: any = signup.data;
      const { password, confirmPassword, service, ...userDataRaw } = signupData;
      const userData: CreateUserDto = userDataRaw;

      //Reusable callback (single definition)
      const approveSignupTx = async (tx: PrismaClientType) => {
        await tx.signup.update({
          where: { uuid: dto.uuid },
          data: {
            status: SignupStatus.APPROVED,
            rejectedReason: null,
            approvedAt: new Date(),
          },
        });
      };

      //Create user inside transaction
      const result = await this.userService.create(
        userData,
        async (err: any, tx: PrismaClientType) => {
          if (err) throw err;
          await approveSignupTx(tx);
        },
      );

      //PASSWORD HANDLING
      if (password) {
        const { hashPassword, validatePasswordStrength } = await import(
          '../utils/password.utils'
        );

        // Skip validation for USERNAME
        if (service !== Service.USERNAME) {
          const validation = validatePasswordStrength(password);
          if (!validation.isValid) {
            throw new Error(
              `Password too weak: ${validation.errors.join(', ')}`,
            );
          }

          if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
          }
        }

        const passwordHash = await hashPassword(password);

        const whereClause =
          service === Service.USERNAME && (result as any).username
            ? {
                userId: result.id,
                service: Service.USERNAME,
                serviceIdLower: (result as any).username.toLowerCase(),
              }
            : {
                userId: result.id,
                service,
              };

        const auth = await this.prisma.auth.findFirst({
          where: whereClause as any,
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

      return this.prisma.signup.update({
        where: { uuid: dto.uuid },
        data: {
          status: SignupStatus.FAILED,
          rejectedReason,
        },
      });
    }
  }
}
