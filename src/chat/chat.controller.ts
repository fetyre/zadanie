import {
	Body,
	Controller,
	HttpException,
	HttpStatus,
	Post,
	Res
} from '@nestjs/common';
import { Response } from 'express';
import { Chat } from '@prisma/client';
import { ChatService } from './chat.service';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { CreateChatDto, FilterUserDto } from './dto';
import { ChatWithUsers } from './interface';

@Controller('chat')
@ApiTags('чаты')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	/**
	 * @method create
	 * @description Создает новый чат после успешной валидации данных.
	 * @param {CreateChatDto} createChatDto - Данные для создания чата.
	 * @param {Response} res - Объект ответа HTTP.
	 * @returns {Promise<void>} Пустой промис после успешного создания чата.
	 * @throws {BadRequestException} Если данные не прошли валидацию.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера.
	 * @throws {ConflictException} Если чат с указанным именем уже существует.
	 * @see {@link ChatService.create} Метод сервиса для создания чата.
	 */
	@Post('add')
	@ApiOperation({ summary: 'Создание чата' })
	@ApiBadRequestResponse({ description: 'Ошибка валидации' })
	@ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
	@ApiBody({ type: CreateChatDto })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Чат успешно создан',
		type: Object
	})
	async create(
		@Body() createChatDto: CreateChatDto,
		@Res() res: Response
	): Promise<void> {
		const chat: Chat = await this.chatService.create(createChatDto);
		res.status(HttpStatus.OK).json(chat.id);
	}

	/**
	 * @method findAll
	 * @description Получает все чаты пользователя вместе с участниками.
	 * @param {FilterUserDto} dto - Фильтр для поиска чатов пользователя.
	 * @param {Response} res - Объект ответа HTTP.
	 * @returns {Promise<void>} Пустой промис после успешного получения чатов.
	 * @throws {NotFoundException} Если пользователь не найден.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера.
	 * @see {@link ChatService.findAll} Метод сервиса для получения всех чатов пользователя.
	 */
	@Post('get')
	@ApiOperation({
		summary: 'Получение чатов пользователя вместе с участниками'
	})
	@ApiBody({ type: FilterUserDto })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Чаты успешно загружены',
		isArray: true
	})
	@ApiNotFoundResponse({
		description: 'Пользователь не найден',
		type: HttpException
	})
	@ApiInternalServerErrorResponse({
		description: 'Внутренняя ошибка сервера',
		type: HttpException
	})
	async findAll(
		@Body() dto: FilterUserDto,
		@Res() res: Response
	): Promise<void> {
		const rest: ChatWithUsers[] = await this.chatService.findAll(dto);
		res.status(HttpStatus.OK).json(rest);
	}
}
