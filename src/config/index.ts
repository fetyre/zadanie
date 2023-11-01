import { PrismaClientOptions } from '@prisma/client/runtime/library';
import { IConfig } from './interface/config.interface';

export function config(): IConfig {
	return {
		id: process.env.APP_ID,
		port: parseInt(process.env.PORT, 10),
		domain: process.env.DOMAIN,
		messagePrivateKey: process.env.MESSAGE_PRIVATE_KEY,
		messagePublicKey: process.env.MESSAGE_PUBLIC_KEY,
		errorDefaultTimeFormat: process.env.ERROR_DEFAULT_TIME_FORMAT,
		errorDefaultTimeTz: process.env.ERROR_DEFAULT_TIME_TZ,
		errorDefaultMessage: process.env.ERROR_DEFAULT_MESSAGE,
		errorDefaultStatus: parseInt(process.env.ERROR_DEFAULT_STATUS, 10),
		db: {
			clientUrl: process.env.DATABASE_URL,
			log: ['query', 'error', 'warn'],
			errorFormat: 'pretty',
			datasources: {
				db: {
					url: process.env.DATABASE_URL
				}
			}
		} as PrismaClientOptions
	};
}
