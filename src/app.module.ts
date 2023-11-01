import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma.batabase/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/config.schema';
import { config } from './config';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './error-filter/error.filter';
import { ErrorHandlerModule } from './errro-catch/error-catch.module';
import { ConfigLoaderModule } from './config/config.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema,
			load: [config]
		}),
		UserModule,
		PrismaModule,
		ChatModule,
		MessageModule,
		ErrorHandlerModule,
		ConfigLoaderModule
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter
		}
	]
})
export class AppModule {}
