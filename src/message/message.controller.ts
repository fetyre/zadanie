import {
	Controller,
	Post,
	Body,
	Res,
	HttpStatus,
	HttpException
} from '@nestjs/common';
import { MessageService } from './message.service';
import { Response } from 'express';
import { ChatIdFilterDto, CreateMessageDto } from './dto';
import { Message } from '@prisma/client';
import {
	ApiBody,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';

@Controller('messages')
@ApiTags('Сообщения')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	/**
	 * @summary Создание нового сообщения
	 * @param {CreateMessageDto} createMessageDto - Данные для создания пользователя.
	 * @param {Response} res - Объект ответа HTTP.
	 * @returns {Promise<void>} ничего.
	 * @throws {NotFoundException} Если чат или пользователь не найдены.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера.
	 * @throws {ForbiddenException} ошибка доступа
	 * @see {@link MessageService.create}
	 */
	@Post('add')
	@ApiOperation({ summary: 'Создание нового сообщения' })
	@ApiBody({ type: CreateMessageDto })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Сообщение создано успешно',
		type: String
	})
	@ApiForbiddenResponse({
		description: 'Доступ запрещен',
		type: HttpException
	})
	@ApiNotFoundResponse({
		description: 'Чат или пользователь не найден',
		type: HttpException
	})
	@ApiInternalServerErrorResponse({
		description: 'Внутренняя ошибка сервера',
		type: HttpException
	})
	async create(
		@Body() createMessageDto: CreateMessageDto,
		@Res() res: Response
	): Promise<void> {
		const message: Message = await this.messageService.create(createMessageDto);
		res.status(HttpStatus.CREATED).json(message.id);
	}

	/**
	 * @summary Получение всех сообщений в чате
	 * @param {ChatIdFilterDto} dto - Данные для создания пользователя.
	 * @param {Response} res - Объект ответа HTTP.
	 * @returns {Promise<void>} ничего.
	 * @throws {NotFoundException} Если чат не найден.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера.
	 * @see {@link MessageService.findAll}
	 */
	@Post('get')
	@ApiOperation({ summary: 'Получение всех сообщений в чате' })
	@ApiBody({ type: ChatIdFilterDto })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Сообщения успешно загружены',
		isArray: true
	})
	@ApiNotFoundResponse({
		description: 'Чат не найден',
		type: HttpException
	})
	@ApiInternalServerErrorResponse({
		description: 'Внутренняя ошибка сервера',
		type: HttpException
	})
	async findAll(
		@Body() dto: ChatIdFilterDto,
		@Res() res: Response
	): Promise<void> {
		const messages: Message[] = await this.messageService.findAll(dto);
		res.status(HttpStatus.OK).json(messages);
	}
}
