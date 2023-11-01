import { ApiProperty } from '@nestjs/swagger';
import {
	ArrayMinSize,
	ArrayUnique,
	IsArray,
	IsNotEmpty,
	IsString,
	Length,
	Validate
} from 'class-validator';
import { IsValidUserFormatValidator } from '../validate';
import { IChat } from '../interface';

/**
 * @class CreateChatDto
 * @implements {IChat}
 * @description Класс для создания чата, реализующий интерфейс IChat
 */
export class CreateChatDto implements IChat {
	@ApiProperty({
		description: 'Массив с идентификаторами участников чата (минимум 1)',
		type: [String],
		example: ['ckvjvszld0000a8z7z7t71t6u', 'ckvjvszle0001a8z7rsn9kiio']
	})
	@IsArray({ message: 'Участники должны быть представлены в виде массива' })
	@ArrayMinSize(1, { message: 'Минимум 1 участника должны быть указаны' })
	@IsNotEmpty({ message: 'Массив участников не должен быть пустым' })
	@ArrayUnique({ message: 'Идентификаторы участников должны быть уникальными' })
	@Validate(IsValidUserFormatValidator, {
		message: 'Недопустимый формат элемента'
	})
	users: string[];

	@ApiProperty({
		description: 'Имя чата ',
		type: String,
		example: 'Название чата'
	})
	@IsNotEmpty({ message: 'Имя чата не должно быть пустым' })
	@IsString({ message: 'Имя чата должно быть строкой' })
	@Length(3, 100, { message: 'Имя чата должно содержать от 3 до 50 символов' })
	name: string;
}
