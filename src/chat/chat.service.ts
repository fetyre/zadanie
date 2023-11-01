import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User, Chat } from '@prisma/client';
import { PrismaService } from 'src/prisma.batabase/prisma.service';
import { CreateChatDto } from './dto';
import { ChatWithUsers, IChat, IChatFilter } from './interface';
import { NullableChat, UserChatResponse } from './types/chat.type';
import { ErrorHandlerService } from 'src/errro-catch/error-catch.service';

/**
 * @class ChatService
 * @description Сервис для работы с чатами
 */
@Injectable()
export class ChatService {
	private readonly logger: Logger = new Logger(ChatService.name);
	constructor(
		private readonly prisma: PrismaService,
		private readonly errorHandlerService: ErrorHandlerService
	) {}

	/**
	 * @method create
	 * @description Создает новый чат после успешной валидации данных.
	 * @param {IChat} chatData - Данные для создания чата.
	 * @returns {Promise<Chat>} Созданный чат.
	 * @throws {InternalServerErrorException} Если произошла ошибка при создании чата.
	 * @throws {BadRequestException} Если данные не прошли валидацию.
	 * @throws {ConflictException} Если чат с указанным именем уже существует.
	 * @see {@link validateCreateChatDto} Метод для валидации данных чата.
	 * @see {@link createChat} Метод для сохранения чата в бд чата.
	 */
	public async create(chatData: IChat): Promise<Chat> {
		try {
			this.logger.log(`Запуск метода create, chatName: ${chatData.name}`);
			await this.validateCreateChatDto(chatData);
			return await this.createChat(chatData);
		} catch (error) {
			this.logger.error(
				`Ошибка в методе create, chatName: ${chatData.name}, error:${error.message}`
			);
			this.errorHandlerService.handleError(error);
		}
	}

	/**
	 * @description сохраняет чат в бд
	 * @method crecreateChatate
	 * @param {IChat} chatData - Данные для создания чата.
	 * @returns {Promise<Chat>} Созданный чат.
	 */
	private async createChat(chatData: IChat): Promise<Chat> {
		this.logger.log(`Запуск метода createChat, chatName: ${chatData.name}`);
		return await this.prisma.chat.create({
			data: {
				name: chatData.name,
				users: {
					connect: chatData.users.map(userId => ({ id: userId }))
				}
			}
		});
	}

	/**
	 * @method validateCreateChatDto
	 * @description Выполняет валидацию данных для создания чата.
	 * @param {IChat} chatData - Данные для создания чата.
	 * @returns {Promise<void>} ничего
	 * @see {@link checkIdUsers} Метод для проверки идентификаторов пользователей.
	 * @see {@link checkRoomName} Метод для проверки имени комнаты (чата).
	 */
	private async validateCreateChatDto(chatData: IChat): Promise<void> {
		this.logger.log(
			`Запуск метода validateCreateChatDto, chatName: ${chatData.name}`
		);
		await Promise.all([
			this.checkIdUsers(chatData),
			this.checkRoomName(chatData.name)
		]);
	}

	/**
	 * @method checkRoomName
	 * @description Проверяет наличие чата с указанным именем.
	 * @param {string} name - Имя чата для проверки.
	 * @returns {Promise<void>} ничего
	 * @throws {ConflictException} Если чат с указанным именем уже существует.
	 * @see {@link findChatByName} Метод для поиска чата по имени.
	 * @see {@link checkChat} Метод для проверки наличия чата.
	 */
	private async checkRoomName(name: string): Promise<void> {
		this.logger.log(`Запуск метода checkRoomName , chatName: ${name}`);
		const chat: NullableChat = await this.findChatByName(name);
		return this.checkChat(chat);
	}

	/**
	 * @method checkChat
	 * @description Проверяет наличие чата.
	 * @returns {void} ничего
	 * @param {NullableChat} chat - Объект чата для проверки.
	 * @throws {ConflictException} Если чат с указанным именем уже существует.
	 */
	private checkChat(chat: NullableChat): void {
		this.logger.log(`Запуск метода checkChat в`);
		if (chat) {
			throw new HttpException('Имя чата занято', HttpStatus.CONFLICT);
		}
	}

	/**
	 * @method findChatByName
	 * @description находит чат по имени.
	 * @param {string} name - Имя чата для поиска.
	 * @returns {Promise<NullableChat>} Объект найденного чата или null, если чат не найден.
	 */
	private async findChatByName(name: string): Promise<NullableChat> {
		this.logger.log(`Запуск метода findChatByName, chatName: ${name}`);
		return await this.prisma.chat.findUnique({ where: { name } });
	}

	/**
	 * @method checkIdUsers
	 * @description Проверяет идентификаторы пользователей для создания чата.
	 * @param {CreateChatDto} dto - Данные для создания чата.
	 * @returns {Promise<void>} ничего
	 * @throws {NotFoundException} Если хотя бы один из идентификаторов не найден.
	 * @see {@link findUsersByIds} Метод для поиска пользователей по идентификаторам.
	 * @see {@link validateUserCount} Метод для валидации количества найденных пользователей.
	 */
	private async checkIdUsers(dto: CreateChatDto): Promise<void> {
		this.logger.log(`Запуск метода checkIdUsers `);
		const countUsers: User[] = await this.findUsersByIds(dto.users);
		return this.validateUserCount(countUsers, dto.users);
	}

	/**
	 * @method validateUserCount
	 * @description Выполняет валидацию количества найденных пользователей.
	 * @param {User[]} countUsers - Массив объектов пользователей для сравнения.
	 * @param {string[]} dtoUsers - Массив идентификаторов пользователей из запроса.
	 * @returns {Promise<void>} ничего
	 * @throws {NotFoundException} Если хотя бы один из идентификаторов не найден.
	 * @see {@link handleMissingUserIdsValidation} Обрабатывает валидацию отсутствующих идентификаторов пользователей.
	 */
	private async validateUserCount(
		countUsers: User[],
		dtoUsers: string[]
	): Promise<void> {
		this.logger.log(`Запуск метода validateUserCount `);
		if (countUsers.length !== dtoUsers.length) {
			return await this.handleMissingUserIdsValidation(countUsers, dtoUsers);
		}
	}

	/**
	 * @method handleMissingUserIdsValidation
	 * @description Обрабатывает валидацию отсутствующих идентификаторов пользователей.
	 * @param {User[]} countUsers - Массив объектов пользователей для сравнения.
	 * @param {string[]} dtoUsers - Массив идентификаторов пользователей из запроса.
	 * @returns {Promise<void>} ничего
	 * @throws  {NotFoundException}, если хотя бы один из идентификаторов не найден.
	 * @see {@link getFoundUserIds} Метод для получения идентификаторов найденных пользователей.
	 * @see {@link findMissingUserIds} Метод для поиска отсутствующих идентификаторов пользователей.
	 * @see {@link handleMissingUsers} Метод для обработки отсутствующих пользователей.
	 */
	private async handleMissingUserIdsValidation(
		countUsers: User[],
		dtoUsers: string[]
	): Promise<void> {
		this.logger.log(`Запуск метода handleMissingUserIdsValidation `);
		const foundUserIds: string[] = this.getFoundUserIds(countUsers);
		const missingUserIds: string[] = this.findMissingUserIds(
			foundUserIds,
			dtoUsers
		);
		return this.handleMissingUsers(missingUserIds);
	}

	/**
	 * @method handleMissingUsers
	 * @description Обрабатывает отсутствие найденных пользователей по идентификаторам.
	 * @param {string[]} missingUserIds - Массив идентификаторов отсутствующих пользователей.
	 * @throws  {NotFoundException}, если хотя бы один из идентификаторов не найден.
	 */
	private handleMissingUsers(missingUserIds: string[]): void {
		this.logger.log(`Запуск метода handleMissingUsers `);
		if (missingUserIds.length > 0) {
			throw new HttpException(
				`Пользователи с id ${missingUserIds.join(', ')} не найдены`,
				HttpStatus.NOT_FOUND
			);
		}
	}

	/**
	 * @method getFoundUserIds
	 * @description Получает идентификаторы найденных пользователей из массива объектов пользователей.
	 * @param {User[]} countUsers - Массив объектов пользователей.
	 * @returns {string[]} Массив идентификаторов пользователей.
	 */
	private getFoundUserIds(countUsers: User[]): string[] {
		this.logger.log(`Запуск метода getFoundUserIds `);
		return countUsers.map(user => user.id);
	}

	/**
	 * @method findMissingUserIds
	 * @description Находит отсутствующие идентификаторы пользователей.
	 * @param {string[]} foundUserIds - Массив идентификаторов найденных пользователей.
	 * @param {string[]} dtoUsers - Массив идентификаторов пользователей из запроса.
	 * @returns {string[]} Массив идентификаторов отсутствующих пользователей.
	 */
	private findMissingUserIds(
		foundUserIds: string[],
		dtoUsers: string[]
	): string[] {
		this.logger.log(`Запуск метода findMissingUserIds `);
		return dtoUsers.filter(id => !foundUserIds.includes(id));
	}

	/**
	 * @method findUsersByIds
	 * @description  находит пользователей по массиву идентификаторов.
	 * @param {string[]} userIds - Массив идентификаторов пользователей.
	 * @returns {Promise<User[]>} Массив объектов пользователей.
	 */
	private async findUsersByIds(userIds: string[]): Promise<User[]> {
		this.logger.log(`Запуск метода findUsersByIds `);
		return await this.prisma.user.findMany({
			where: { id: { in: [...new Set(userIds)] } }
		});
	}

	/**
	 * @method findAll
	 * @description  находит чаты пользователя и выполняет проверку их наличия.
	 * @param {IChatFilter} filetData - Фильтр для поиска чатов пользователя.
	 * @returns {Promise<ChatWithUsers[]>} Объект с массивом чатов вместе с участниками и объектом пользователя.
	 * @throws {NotFoundException} Если пользователь не существует.
	 * @see {@link findManyChatAndCheckByUserId} Метод для поиска чатов пользователя и проверки их наличия.
	 */
	public async findAll(filetData: IChatFilter): Promise<ChatWithUsers[]> {
		try {
			this.logger.log(`Запуск метода findAll, userId: ${filetData.user}`);
			return await this.findManyChatAndCheckByUserId(filetData);
		} catch (error) {
			this.logger.error(
				`Ошибка в  методе creatfindAlleChat, userId: ${filetData.user}, error:${error.message}`
			);
			this.errorHandlerService.handleError(error);
		}
	}

	/**
	 * @method findManyChatAndCheckByUserId
	 * @description находит чаты пользователя вместе с участниками и выполняет проверку наличия пользователя.
	 * @param {IChatFilter} filetData - Фильтр для поиска чатов пользователя.
	 * @returns {Promise<ChatWithUsers[]>} Массив чатов вместе с участниками.
	 * @throws {NotFoundException} Если пользователь не существует.
	 * @see {@link findManyChats} Метод для поиска чатов пользователя вместе с участниками.
	 * @see {@link checkChats} Метод для проверки наличия чата.
	 */
	private async findManyChatAndCheckByUserId(
		filetData: IChatFilter
	): Promise<ChatWithUsers[]> {
		this.logger.log(
			`Запуск метода findManyChatAndCheckByUserId, userId: ${filetData.user}`
		);
		const chats: UserChatResponse = await this.findManyChats(filetData);
		this.checkChats(chats);
		return chats.chat;
	}

	/**
	 * @method findManyChats
	 * @description Асинхронно находит чаты пользователя вместе с участниками.
	 * @param {IChatFilter} filetData - Фильтр для поиска чатов пользователя.
	 * @returns {Promise<UserChatResponse>} Объект с массивом чатов вместе с участниками и объектом пользователя.
	 */
	private async findManyChats(
		filetData: IChatFilter
	): Promise<UserChatResponse> {
		this.logger.log(`Запуск метода findManyChats, userId: ${filetData.user}`);
		return await this.prisma.user.findUnique({
			where: { id: filetData.user },
			include: {
				chat: { orderBy: { created_at: 'desc' }, include: { users: true } }
			}
		});
	}

	/**
	 * @method checkChats
	 * @description Проверяет наличие пользователя.
	 * @param {UserChatResponse} data - Объект пользователя для проверки.
	 * @returns {void} ничего
	 * @throws {NotFoundException} Если пользователь не найден.
	 */
	private checkChats(data: UserChatResponse): void {
		this.logger.log(`Запуск метода checkChats`);
		if (!data) {
			throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
		}
	}
}
