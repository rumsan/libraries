# Rumsan Workspace

A Monorepo for Prisma and Rumsan User Libraries

## Prerequisite

- Postgres Database
- Node.js v20.\* (Recommended)
- NestJS/CLI Installed
  ```bash
  npm install -g @nestjs/cli
  ```

## Run Locally

Setp 1: Clone the project

```bash
  git clone git@github.com:rumsan/libraries.git
```

Step 2: Go to the project directory and install dependencies

```bash
  cd my-project
  npm install
```

Step 3: Add following details to .env file inside project root and update variables

```bash
DATABASE_URL=postgres://USERNAME:PASSWORD@HOST:DB_PORT/DB_NAME
JWT_SECRET=hello12345xyz
JWT_EXPIRY_TIME=60m
PORT=3333
```

Step 4: Migrate and seed prisma db

```bash
  npx prisma migrate dev
```

Seed database with

```bash
  npx prisma db seed
```

Step 5: Run project

```bash
  npm run dev
```

Step 6: Visit API docs at: http://localhost:3333/api/docs

## Usage/Examples

Go to `apps/nest-api/src/app/app.module.ts` and see the implementation of PrismaDbModule and RsUserModule.

```javascript
import { Module } from '@nestjs/common';
import { RsUserModule } from '@rumsan/user';
import { PrismaDbModule, PrismaService } from '@rumsan/prisma';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ListenerModule } from './listeners/listners.module';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		EventEmitterModule.forRoot({ maxListeners: 10, ignoreErrors: false }),
		ListenerModule,
		PrismaDbModule,
		RsUserModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}


========Consume Services Inside Target App==========
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@binod7/rumsan-user';
import { ACTIONS, SUBJECTS } from '../constants';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('app')
@ApiTags('App')
@ApiBearerAuth()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
	@UseGuards(JwtGuard, AbilitiesGuard)
	@Get()
	getData() {
		return this.appService.getData();
	}
}
```
