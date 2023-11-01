import { ErrorMessageType } from '../type/error-message.type';

/**
 * @interface ErrorResponse
 * @description Интерфейс для структурирования ответов об ошибках.
 */
export interface ErrorResponse {
	statusCode: number;
	timestamp: string;
	message: ErrorMessageType;
	requestUrl?: string;
}
