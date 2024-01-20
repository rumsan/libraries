import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { UsersModule } from '../users/users.module';
import { SignupConfig } from './interfaces/signup-config.interfaces';
import { SignupController } from './signups.controller';
import { SignupsService } from './signups.service';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [SignupController],
  exports: [SignupsService],
})
export class SignupModule {
  static forRoot(options: SignupConfig): DynamicModule {
    return {
      module: SignupModule,

      providers: [
        {
          provide: 'SIGNUP_CONFIG',
          useValue: options,
        },
        SignupsService,
      ],
    };
  }
}
