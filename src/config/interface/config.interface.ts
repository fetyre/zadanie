import { PrismaClientOptions } from '@prisma/client/runtime/library';

/**
 * @interface IConfig
 * @description Интерфейс для конфигурации приложения.
 */
export interface IConfig {
	id: string;
	port: number;
	domain: string;
	db: PrismaClientOptions;
	messagePrivateKey: string;
	messagePublicKey: string;
	errorDefaultTimeFormat: string;
	errorDefaultTimeTz: string;
	errorDefaultMessage: string;
	errorDefaultStatus: number;
}
