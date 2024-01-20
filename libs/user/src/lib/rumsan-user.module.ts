import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RSExceptionModule, RumsanAppModule } from '@rumsan/core';
import { PrismaModule } from '@rumsan/prisma';
import { AbilityModule } from './ability/ability.module';
import { AbilitySubject } from './ability/ability.subjects';
import { AuthsController } from './auths/auths.controller';
import { AuthsModule } from './auths/auths.module';
import { ERRORS_RSUSER } from './constants';
import { RolesModule } from './roles/roles.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

@Module({
  controllers: [AuthsController, UsersController],
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
    AuthsModule,
    UsersModule,
    RolesModule,
  ],
  providers: [JwtService, ConfigService, UsersService],
  exports: [UsersService],
})
export class RumsanUsersModule {}
