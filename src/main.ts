import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.batabase/prisma.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app: INestApplication<any> = await NestFactory.create(AppModule);
	const prismaService: PrismaService = app.get(PrismaService);
	app.enableShutdownHooks();
	app
		.getHttpAdapter()
		.getInstance()
		.on('beforeShutdown', async () => {
			await prismaService.$disconnect();
		});
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	);
	const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
		.setTitle('NestJS Example App')
		.setDescription('The API description')
		.setVersion('1.0')
		.addTag('zadanie')
		.build();
	const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);
	await app.listen(process.env.PORT);
}
bootstrap();
