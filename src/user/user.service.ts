import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.batabase/prisma.service';
import { User } from '@prisma/client';
import { NullableUser } from './types/user.types';
import { UserInput } from './inetrface/user.interface';
import { ErrorHandlerService } from 'src/errro-catch/error-catch.service';

/**
 * @class UserService
 * @classdesc Регистрация пользователя
 * @throws {ConflictException} если пользователь существует.
 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера
 */
@Injectable()
export class UserService {
	private readonly logger: Logger = new Logger(UserService.name);
	constructor(
		private readonly prisma: PrismaService,
		private readonly errorHandlerService: ErrorHandlerService
	) {}

	/**
	 * Создает нового пользователя на основе данных из объекта CreateUserDto.
	 * Перед созданием пользователя выполняет проверку наличия пользователя с таким логином.
	 * @param {UserInput} userData - Данные для создания пользователя.
	 * @returns {Promise<User>} Созданный пользователь.
	 * @throws {ConflictException} если пользователь существует.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера
	 * @see {@link checkIfUserExists} проверка свободности имени
	 * @see {@link createUser} сохранение пользователя в бд
	 */
	public async create(userData: UserInput): Promise<User> {
		try {
			this.logger.log(`Запуск create, username:${userData.username}`);
			await this.checkIfUserExists(userData.username);
			return await this.createUser(userData);
		} catch (error) {
			this.logger.error(
				`Ошибка при создании пользователя: ${error.message}, username:${userData.username}`
			);
			this.errorHandlerService.handleError(error);
		}
	}

	/**
	 * Сохраняет нового пользователя с заданным логином.
	 * @param {UserInput} userData - Данные для создания пользователя.
	 * @returns {Promise<User>} Созданный пользователь.
	 */
	private async createUser(userData: UserInput): Promise<User> {
		this.logger.log(`Запуск createUser, username:${userData.username} `);
		return await this.prisma.user.create({
			data: { username: userData.username }
		});
	}

	/**
	 * Проверяет наличие пользователя с заданным логином.
	 * @param {string} username - Логин пользователя для проверки.
	 * @returns {Promise<void>} ничего не возвращает
	 * @throws {ConflictException} если пользователь существует.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера
	 * @see {@link findUserByName} поиск пользователя по username
	 * @see {@link checkUser} проверка наличияь пользователя после поиска
	 */
	private async checkIfUserExists(username: string): Promise<void> {
		this.logger.log(`Запуск checkIfUserExists, username: ${username}`);
		const user: NullableUser = await this.findUserByName(username);
		return this.checkUser(user);
	}

	/**
	 * Проверяет, существует ли пользователь с заданным логином.
	 * @param {NullableUser} user - Объект пользователя или null для проверки.
	 * @returns {void} ничего не возвращает
	 * @throws {ConflictException} если пользователь существует.
	 */
	private checkUser(user: NullableUser): void {
		this.logger.log(`Запуск checkUser`);
		if (user) {
			throw new HttpException(
				'Пользователь с таким логином уже существует',
				HttpStatus.CONFLICT
			);
		}
	}

	/**
	 * Находит пользователя по его логину.
	 * @param {string} username - Логин пользователя для поиска.
	 * @returns {Promise<NullableUser>} Найденный объект пользователя или null.
	 */
	private async findUserByName(username: string): Promise<NullableUser> {
		this.logger.log(`Запуск метода findUserByName, username: ${username}`);
		return await this.prisma.user.findUnique({ where: { username } });
	}
}
