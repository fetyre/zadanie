import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	MinLength,
	MaxLength,
	Matches
} from 'class-validator';
import { ID_REGEX } from 'src/user/regex/regex.const';
import { IChatFilter } from '../interface';

/**
 * @class FilterUserDto
 * @implements {IUserFilter}
 * @description Класс для фильтрации пользователя по ID, реализующий интерфейс IChatFilter
 */
export class FilterUserDto implements IChatFilter {
	@IsNotEmpty({ message: 'ID пользователя не может быть пустым' })
	@IsString({ message: 'ID пользователя должен быть строкой' })
	@MinLength(25, {
		message: 'ID пользователя не может быть короче 25 символов'
	})
	@MaxLength(25, {
		message: 'Превышена максимальная длина идентификатора пользователя'
	})
	@Matches(ID_REGEX, {
		message:
			'ID пользователя должен содержать только буквы (в обоих регистрах), цифры и дефисы'
	})
	@ApiProperty({
		description: 'ID пользователя',
		example: 'ckpfn8skk0000j29z3l9l4d1z'
	})
	user: string;
}
