import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '@rumsan/prisma';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { JwtStrategy, LocalStrategy } from './strategy';

@Module({
  imports: [JwtModule.register({}), PrismaModule, PassportModule, ConfigModule],
  controllers: [AuthsController],
  providers: [AuthsService, JwtStrategy, LocalStrategy],
  exports: [AuthsService],
})
export class AuthsModule {}
