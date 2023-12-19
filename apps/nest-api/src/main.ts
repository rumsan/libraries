/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';
import { APP } from './constants';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const globalPrefix = 'api/v1';
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	app.setGlobalPrefix(globalPrefix);

	const port = process.env.PORT || 3333;

	const config = new DocumentBuilder()
		.setTitle('Sample App')
		.setDescription('This is just a sample app')
		.setVersion('0.1')
		.addBearerAuth(
			{ type: 'http', scheme: 'bearer', bearerFormat: APP.JWT_BEARER },
			APP.JWT_BEARER,
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	await app.listen(port);
	Logger.log(
		`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
	);
	Logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

bootstrap();
