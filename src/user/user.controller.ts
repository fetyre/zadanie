import {
	Controller,
	Post,
	Body,
	HttpStatus,
	Res,
	HttpException,
	HttpCode
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { CreateUserDto } from './dto';
import {
	ApiOperation,
	ApiResponse,
	ApiConflictResponse,
	ApiInternalServerErrorResponse,
	ApiBody,
	ApiTags
} from '@nestjs/swagger';
import { User } from '@prisma/client';

@Controller('users')
@ApiTags('Users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * @summary Создание нового пользователя.
	 * @param {CreateUserDto} createUserDto - Данные для создания пользователя.
	 * @param {Response} res - Объект ответа HTTP.
	 * @returns {Promise<void>} ничего.
	 * @throws {HttpException} Если пользователь с таким логином уже существует.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера.
	 * @see {@link UserService.create}
	 */
	@Post('add')
	@HttpCode(201)
	@ApiOperation({ summary: 'Создание нового пользователя' })
	@ApiBody({ type: CreateUserDto })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Пользователь создан успешно',
		type: String
	})
	@ApiConflictResponse({
		description: 'Пользователь с таким логином уже существует',
		type: HttpException
	})
	@ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
	async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
		const user: User = await this.userService.create(createUserDto);
		res.status(HttpStatus.CREATED).json(user.id);
	}
}
