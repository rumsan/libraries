import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { AbilityModule } from '../ability/ability.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, AbilityModule.forRoot()],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {
  public static forRoot(): DynamicModule {
    return {
      module: UsersModule,
      controllers: [UsersController],
    };
  }
}
