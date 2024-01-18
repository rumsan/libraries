import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RSExceptionModule, RumsanAppModule } from '@rumsan/core';
import { PrismaModule } from '@rumsan/prisma';
import { AbilityModule } from './ability/ability.module';
import { AbilitySubject } from './ability/ability.subjects';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ERRORS_RSUSER } from './constants';
import { RolesModule } from './roles/roles.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  controllers: [AuthController, UserController],
  imports: [
    //SignupModule.forRoot({ autoApprove: false }),
    RSExceptionModule.forRoot({ errorSet: ERRORS_RSUSER }),
    RumsanAppModule.forRoot({
      controllers: {
        subjects: AbilitySubject.list,
      },
    }),
    AbilityModule,
    PrismaModule,
    AuthModule,
    UserModule,
    RolesModule,
  ],
  providers: [JwtService, ConfigService, UserService],
  exports: [UserService],
})
export class RumsanUserModule {}
