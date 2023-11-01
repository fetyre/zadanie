import { IChatIdFilter } from './chat-id-filter.interface';

/**
 * @interface MessageInput
 * @description Интерфейс для ввода создания сообщения.
 * @extends IChatIdFilter
 * @property {string} author - Автор сообщения.
 * @property {string} text - Текст сообщения.
 */
export interface MessageInput extends IChatIdFilter {
	author: string;
	text: string;
}
