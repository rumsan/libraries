/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseTransformInterceptor, RsExceptionFilter } from '@rumsan/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app/app.module';
import { APP } from './constants';
import { loggerInstance } from './logger/winston.logger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      instance: loggerInstance,
    }),
  });
  //to get real ip from nginx
  //app.set('trust proxy', true);
  const globalPrefix = 'v1';

  //must have this if you want to implicit conversion of string to number in dto
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new RsExceptionFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3333;

  const config = new DocumentBuilder()
    .setTitle('Rumsan Libraries')
    .setDescription('Rumsan libraries API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: APP.JWT_BEARER },
      APP.JWT_BEARER,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(`Swagger UI: http://localhost:${port}/swagger`);
}

bootstrap();
