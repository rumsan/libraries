import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PrismaDbModule } from '@binod7/prisma-db';

@Module({
	imports: [PrismaDbModule],
	controllers: [RolesController],
	providers: [RolesService],
})
export class RolesModule {}
