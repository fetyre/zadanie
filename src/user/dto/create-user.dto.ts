import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { NAME_REGEX } from '../regex/regex.const';
import { Transform } from 'class-transformer';
import { UserInput } from '../inetrface/user.interface';

/**
 * @class CreateUserDto
 * @classdesc Объект данных для создания пользователя.
 * @property {string} username - Имя пользователя.
 */
export class CreateUserDto implements UserInput {
	@ApiProperty({
		description: 'Имя пользователя',
		required: true
	})
	@IsString({ message: 'Имя должно быть строкой' })
	@IsNotEmpty({ message: 'Имя обязательно должно быть заполнено' })
	@Length(3, 300, { message: 'Минимальная длина имени должна быть 3 символа' })
	@Matches(NAME_REGEX, {
		message:
			'Для имени можно использовать только буквы, цифры, апострофы, точки, пробелы и тире'
	})
	@Transform(({ value }) => value.replace(/\s+/g, ' ').trim())
	username: string;
}
