import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.batabase/prisma.service';
import { Message, User } from '@prisma/client';
import { CreateMessageDto } from './dto';
import * as crypto from 'crypto';
import { ErrorHandlerService } from 'src/errro-catch/error-catch.service';
import { IChatIdFilter, MessageInput } from './interface';
import {
	NullableChatWithUsers,
	OptionalChat,
	OptionalUser,
	UserOrUndefined
} from './types/message.type';
import { ConfigLoaderService } from 'src/config/config.service';

@Injectable()
export class MessageService {
	private readonly logger: Logger = new Logger(MessageService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly errorHandlerService: ErrorHandlerService,
		private readonly configLoaderService: ConfigLoaderService
	) {}

	/**
	 * Создает новое сообщение после успешной валидации данных и их шифрования.
	 * @param {CreateMessageDto} messageData - Данные для создания сообщения.
	 * @returns {Promise<Message>} Созданное сообщение.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера.
	 * @throws {ForbiddenException} Если пользователь отсутствует в чате.
	 * @throws {NotFoundException} Если чат или пользователь не найдены.
	 * @see {@link validateMessage} проверка пользователя и чата.
	 * @see {@link createUser} зашифровка сообщения в бд
	 * @see {@link createMessage} сохранение сообщения в бд
	 */
	public async create(messageData: MessageInput): Promise<Message> {
		try {
			this.logger.log(
				`Запуск create , authorId:${messageData.author}, chatId: ${messageData.chat}`
			);
			await this.validateMessage(messageData);
			const newDto: CreateMessageDto = await this.encryptMessage(messageData);
			return await this.createMessage(newDto);
		} catch (error) {
			this.logger.error(
				`Ошибка в create, authorId:${messageData.author}, error: ${error.message}`
			);
			this.errorHandlerService.handleError(error);
		}
	}

	/**
	 * Шифрует текстовое сообщение с использованием публичного ключа.
	 * @param {string} text - Текст для шифрования.
	 * @param {string} publicKey - Публичный ключ для шифрования.
	 * @returns {Promise<string>} Зашифрованный текст в формате base64.
	 */
	private async encryptText(text: string, publicKey: string): Promise<string> {
		this.logger.log(`Запуск encryptText`);
		const encryptedData: Buffer = crypto.publicEncrypt(
			publicKey,
			Buffer.from(text)
		);
		return encryptedData.toString('base64');
	}

	/**
	 * Шифрует текст сообщения в объекте MessageInput с использованием публичного ключа.
	 * @param {MessageInput} messageData - Объект MessageInput, содержащий текст для шифрования.
	 * @returns {Promise<MessageInput>} Объект MessageInput с зашифрованным текстом.
	 */
	private async encryptMessage(
		messageData: MessageInput
	): Promise<MessageInput> {
		this.logger.log(
			`Запуск encryptMessage, authorId:${messageData.author}, chatId: ${messageData.chat}`
		);
		messageData.text = await this.encryptText(
			messageData.text,
			this.configLoaderService.messagePublicKey
		);
		return messageData;
	}

	/**
	 *  проверка пользователя и чата.
	 * @param {MessageInput} messageData - Данные для проверки и поиска.
	 * @returns {Promise<void>} ничего
	 * @throws {ForbiddenException} Если пользователь отсутствует в чате.
	 * @see {@link validateMessageData}
	 * @see {@link validateUserInChat} Проверяет, что пользователь присутствует в списке участников чата.
	 */
	private async validateMessage(messageData: MessageInput): Promise<void> {
		this.logger.log(
			`Запуск validateUserInChat, authorId:${messageData.author}, chatId: ${messageData.chat}`
		);
		const [user, chatUsers] = await this.validateMessageData(messageData);
		return await this.validateUserInChat(user, chatUsers);
	}

	/**
	 * Проверяет, что пользователь присутствует в списке участников чата.
	 * @param {User} user - Объект пользователя для проверки.
	 * @param {User[]} chatUsers - Массив пользователей, участвующих в чате.
	 * @returns {Promise<void> } ничего
	 * @throws {ForbiddenException} Если пользователь отсутствует в чате.
	 * @see {@link findUserInChat} Находит пользователя в списке участников чата.
	 * @see {@link checkUserInChat} Проверяет, существует ли пользователь в чате.
	 */
	private async validateUserInChat(
		user: User,
		chatUsers: User[]
	): Promise<void> {
		this.logger.log(`Запуск validateUserInChat, authorId:${user.id}`);
		const foundUser: User = await this.findUserInChat(user, chatUsers);
		return this.checkUserInChat(foundUser);
	}

	/**
	 * Проверяет, существует ли пользователь в чате.
	 * @param {User} user - Объект пользователя для проверки.
	 * @returns {void} ничего
	 * @throws {ForbiddenException} Если пользователь отсутствует в чате.
	 */
	private checkUserInChat(user: User): void {
		this.logger.log(`Запуск checkUserInChat`);
		if (!user) {
			throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
		}
	}

	/**
	 * Находит пользователя в списке участников чата.
	 * @param {User} user - Объект пользователя для поиска.
	 * @param {User[]} chatUsers - Массив пользователей, участвующих в чате.
	 * @returns {UserOrUndefined} Объект пользователя, если найден, иначе undefined.
	 */
	private async findUserInChat(
		user: User,
		chatUsers: User[]
	): Promise<UserOrUndefined> {
		this.logger.log(`Запуск findUserInChat, authorId:${user.id}`);
		return chatUsers.find(chatUser => chatUser.id === user.id);
	}

	/**
	 * Создает новое сообщение на основе данных из объекта CreateMessageDto.
	 * @param {MessageInput} messageData - Данные сообщения для сохранения в бд.
	 * @returns {Promise<Message>} Созданное сообщение.
	 */
	private async createMessage(messageData: MessageInput): Promise<Message> {
		this.logger.log(
			`Запуск createMessage , authorId:${messageData.author}, chatId:${messageData.chat}`
		);
		return await this.prisma.message.create({
			data: {
				text: messageData.text,
				author: messageData.author,
				chat: messageData.chat
			}
		});
	}

	/**
	 * @param {MessageInput} messageData - Данные сообщения для проверки.
	 * @throws {NotFoundException}  если пользователь или чат не найдены.
	 * @returns {Promise<[User, User[]]>} Объект с данными пользователя и массивом пользователей чата.
	 * @see {@link findAndCheckUserById} Находит пользователя по его идентификатору и проверяет его наличие.
	 * @see {@link findAndCheckChatAndUsersById} Находит чат и его участников по идентификатору чата, затем проверяет их наличие.
	 */
	private async validateMessageData(
		messageData: MessageInput
	): Promise<[User, User[]]> {
		this.logger.log(
			`Запуск validateMessageData, authorId:${messageData.author}, chatId:${messageData.chat}`
		);
		return await Promise.all([
			this.findAndCheckUserById(messageData.author),
			this.findAndCheckChatAndUsersById(messageData.chat)
		]);
	}

	/**
	 * Находит пользователя по его идентификатору и проверяет его наличие.
	 * @param {string} id - Идентификатор пользователя.
	 * @returns {Promise<User>} Объект пользователя.
	 * @throws {NotFoundException}  если пользователь не найден.
	 * @see {@link findUserById} Находит пользователя по его идентификатору.
	 * @see {@link checkUser} Проверяет, существует ли пользователь.
	 */
	private async findAndCheckUserById(id: string): Promise<User> {
		this.logger.log(`Запуск findAndCheckUserById, authorId:${id}`);
		const user: OptionalUser = await this.findUserById(id);
		this.checkUser(user);
		return user;
	}

	/**
	 * Находит чат и его участников по идентификатору чата, затем проверяет их наличие.
	 * @param {string} id - Идентификатор чата.
	 * @returns {Promise<User[]>} Массив пользователей, являющихся участниками чата.
	 * @throws {NotFoundException}, если чат не найден.
	 * @see {@link findChatAndUsersById} Находит чат и его участников по идентификатору чата.
	 * @see {@link checkChat} Проверяет, существует ли чат.
	 */
	private async findAndCheckChatAndUsersById(id: string): Promise<User[]> {
		this.logger.log(`Запуск findAndCheckChatAndUsersById, chatId:${id}`);
		const chat: NullableChatWithUsers = await this.findChatAndUsersById(id);
		this.checkChat(chat);
		return chat.users;
	}

	/**
	 * Проверяет, существует ли чат.
	 * @param {NullableChatWithUsers} chat - Объект чата вместе с участниками или null для проверки.
	 * @returns {Promise<void>} ничего
	 * @throws {NotFoundException}, если чат не найден.
	 */
	private async checkChat(
		chat: NullableChatWithUsers | OptionalChat
	): Promise<void> {
		this.logger.log(`Запуск checkChat`);
		if (!chat) {
			throw new HttpException('Чат не найден', HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * Находит чат и его участников по идентификатору чата.
	 * @param {string} id - Идентификатор чата.
	 * @returns {Promise<NullableChatWithUsers>} Объект чата вместе с участниками или null.
	 */
	private async findChatAndUsersById(
		id: string
	): Promise<NullableChatWithUsers> {
		this.logger.log(`Запуск findChatAndUsersById, chatId:${id}`);
		return await this.prisma.chat.findUnique({
			where: { id },
			include: { users: true }
		});
	}

	/**
	 * Находит пользователя по его идентификатору.
	 * @param {string} id - Идентификатор пользователя.
	 * @returns {Promise<OptionalUser>} Найденный объект пользователя или null
	 */
	private async findUserById(id: string): Promise<OptionalUser> {
		this.logger.log(`Запуск findChatById, authorId:${id}`);
		return await this.prisma.user.findUnique({ where: { id } });
	}

	/**
	 * Проверяет, существует ли пользователь.
	 * @param {OptionalUser} user - Объект пользователя или null для проверки.
	 * @throws {NotFoundException}  если пользователь не найден.
	 */
	private async checkUser(user: OptionalUser): Promise<void> {
		this.logger.log(`Запуск checkUser `);
		if (!user) {
			throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * находит и возвращает все сообщения для заданного чата после выполнения проверок.
	 * Перед возвратом сообщений, они расшифровываются с использованием приватного ключа.
	 * @param {IChatIdFilter} filter - Фильтр для поиска сообщений в чате.
	 * @returns {Promise<Message[]>} Массив расшифрованных сообщений.
	 * @throws {NotFoundException} если чат не существует.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера.
	 * @see {@link findAndCheckChatById} проверка чата
	 * @see {@link findChatInMessageById} поиск и возврат сообщений
	 * @see {@link decryptMessagesArray} расшифровка сообщений
	 */
	public async findAll(filter: IChatIdFilter): Promise<Message[]> {
		try {
			this.logger.log(`Запуск findAll, chatId:${filter.chat}`);
			await this.findAndCheckChatById(filter.chat);
			const messages: Message[] = await this.findChatInMessageById(filter);
			return await this.decryptMessagesArray(messages);
		} catch (error) {
			this.logger.error(
				`Ошибка в findAll, chatId:${filter.chat}, error: ${error.message}`
			);
			this.errorHandlerService.handleError(error);
		}
	}

	/**
	 * расшифровывает текстовое содержание каждого сообщения в массиве.
	 * @param {Message[]} messages - Массив сообщений, содержащих зашифрованный текст.
	 * @returns {Promise<Message[]>} Массив сообщений с расшифрованным текстом.
	 */
	private async decryptMessagesArray(messages: Message[]): Promise<Message[]> {
		this.logger.log(`Запуск decryptMessagesArray`);
		return Promise.all(this.decryptMessages(messages));
	}

	/**
	 * расшифровывает зашифрованные данные.
	 * @param {string} encryptedData - Зашифрованные данные в формате base64.
	 * @returns {Promise<string>} Расшифрованные данные в виде строки.
	 */
	private async decrypt(encryptedData: string): Promise<string> {
		this.logger.log(`Запуск decrypt`);
		const buffer: Buffer = Buffer.from(encryptedData, 'base64');
		const decryptedData: Buffer = crypto.privateDecrypt(
			this.configLoaderService.messagePrivateKey,
			buffer
		);
		return decryptedData.toString();
	}

	/**
	 * Расшифровывает текстовое содержание каждого сообщения в массиве.
	 * @param {Message[]} messages - Массив сообщений, содержащих зашифрованный текст.
	 * @returns {Promise<Message>[]} Массив расшифрованных сообщений.
	 */
	private decryptMessages(messages: Message[]): Promise<Message>[] {
		this.logger.log(`Запуск decryptMessages`);
		return messages.map(async message => {
			const decryptedContent: string = await this.decrypt(message.text);
			message.text = decryptedContent;
			return message;
		});
	}

	/**
	 * Находит чат по его идентификатору и выполняет проверку наличия чата.
	 * @param {string} id - Идентификатор чата для поиска.
	 * @throws {NotFoundException} если чат не существует.
	 * @returns {Promise<void>} ничего
	 * @see {@link findChatById} поиск чата по id
	 * @see {@link checkChat} проверка чата
	 */
	private async findAndCheckChatById(id: string): Promise<void> {
		this.logger.log(`Запуск findAndCheckChatById, chatId:${id}`);
		const chat: OptionalChat = await this.findChatById(id);
		return this.checkChat(chat);
	}

	/**
	 * Находит чат по его идентификатору.
	 * @param {string} id - Идентификатор чата для поиска.
	 * @returns {OptionalChat} Найденный объект чата или null.
	 */
	private async findChatById(id: string): Promise<OptionalChat> {
		this.logger.log(`Запуск findChatById, chatId:${id}`);
		return await this.prisma.chat.findUnique({ where: { id } });
	}

	/**
	 * Находит сообщения в чате по его идентификатору.
	 * @param {IChatIdFilter} filter - Фильтр для поиска сообщений в чате.
	 * @returns {Promise<Message[]>} Массив сообщений, отсортированный по времени создания в возрастающем порядке.
	 */
	private async findChatInMessageById(
		filter: IChatIdFilter
	): Promise<Message[]> {
		this.logger.log(`Запуск findChatInMessageById, chatId: ${filter.chat}`);
		return await this.prisma.message.findMany({
			where: { chat: filter.chat },
			orderBy: { created_at: 'asc' }
		});
	}
}
