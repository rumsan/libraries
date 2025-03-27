import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { AbilityModule } from '../ability/ability.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({})
export class UsersModule {
  static register(usersServiceProvider?: Provider): DynamicModule {
    return {
      module: UsersModule,
      imports: [PrismaModule, AbilityModule.forRoot()],
      controllers: [UsersController],
      providers: [usersServiceProvider || UsersService],
      exports: [UsersService],
    };
  }
}
