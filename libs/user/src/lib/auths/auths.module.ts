import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@rumsan/extensions/strategy';
import { PrismaModule } from '@rumsan/prisma';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';

@Module({
  imports: [JwtModule.register({}), PrismaModule, PassportModule, ConfigModule],
  controllers: [AuthsController],
  providers: [AuthsService, JwtStrategy],
  exports: [AuthsService],
})
export class AuthsModule {}
