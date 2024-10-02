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
import { SignupEmailDto, SignupListDto } from './dto';
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

  async signup(dto: SignupEmailDto | SignupPhoneDto | SignupWalletDto) {
    let authIdentifier: { service: Service; serviceId: string };
    if (dto instanceof SignupPhoneDto)
      authIdentifier = { service: Service.PHONE, serviceId: dto.phone };
    else if (dto instanceof SignupWalletDto)
      authIdentifier = { service: Service.WALLET, serviceId: dto.wallet };
    else authIdentifier = { service: Service.EMAIL, serviceId: dto.email };

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
      await this.approve({ cuid: rec.cuid });
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
        cuid: dto.cuid,
      },
    });
    if (!signup) throw new Error('Signup not found');
    if (
      signup.status === SignupStatus.APPROVED ||
      signup.status === SignupStatus.REJECTED
    )
      throw new Error('Signup is already processed.');

    try {
      const userData: CreateUserDto = <CreateUserDto>(signup.data as unknown);

      const callback = async (err: any, tx: PrismaClientType) => {
        if (err) throw err;
        await tx.signup.update({
          where: {
            cuid: dto.cuid,
          },
          data: {
            status: SignupStatus.APPROVED,
            rejectedReason: null,
            approvedAt: new Date(),
          },
        });
      };

      const result = await this.userService.create(userData, callback);
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
          cuid: dto.cuid,
        },
        data: {
          status: SignupStatus.FAILED,
          rejectedReason,
        },
      });
    }
  }
}
