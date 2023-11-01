import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength
} from 'class-validator';

import { ID_REGEX } from 'src/user/regex/regex.const';
import { ChatIdFilterDto } from './chat-id-filter.dto';
import { MessageInput } from '../interface';

export class CreateMessageDto extends ChatIdFilterDto implements MessageInput {
	@IsNotEmpty({ message: 'ID автора не может быть пустым' })
	@IsString({ message: 'ID автора должен быть строкой' })
	@MinLength(25, { message: 'ID автора не может быть короче 25 символов' })
	@MaxLength(25, {
		message: 'Превышена максимальная длина идентификатора автора'
	})
	@Matches(ID_REGEX, {
		message:
			'ID автора должен содержать только буквы (в обоих регистрах), цифры и дефисы'
	})
	@ApiProperty({
		description: 'ID автора',
		example: 'ckpfn8skk0000j29z3l9l4d1z'
	})
	author: string;

	@IsNotEmpty({ message: 'Содержимое сообщения не может быть пустым' })
	@IsString({ message: 'Содержимое сообщения должно быть строкой' })
	@MinLength(1, { message: 'Сообщение не должно быть пустым' })
	@MaxLength(300, { message: 'Превышена длинна сообщения' })
	@Matches(
		/^[\x00-\x7F\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F923}-\u{1F92F}\p{L}]*$/u,
		{ message: 'Значение должно содержать только символы ASCII и эмоции' }
	)
	@ApiProperty({
		description: 'Содержимое сообщения',
		example: 'Привет, как дела?'
	})
	text: string;
}
