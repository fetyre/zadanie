import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	MinLength,
	MaxLength,
	Matches
} from 'class-validator';
import { ID_REGEX } from 'src/user/regex/regex.const';
import { IChatIdFilter } from '../interface';

export class ChatIdFilterDto implements IChatIdFilter {
	@IsNotEmpty({ message: 'ID чата не может быть пустым' })
	@IsString({ message: 'ID чата должен быть строкой' })
	@MinLength(25, { message: 'ID чата не может быть короче 25 символов' })
	@MaxLength(25, {
		message: 'Превышена максимальная длина идентификатора чата'
	})
	@Matches(ID_REGEX, {
		message:
			'ID чата должен содержать только буквы (в обоих регистрах), цифры и дефисы'
	})
	@ApiProperty({
		description: 'ID чата',
		example: 'ckpfn8skk0000j29z3l9l4d1z'
	})
	chat: string;
}
