import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ErrorHandlerService {
	public handleError(error: any) {
		if (error instanceof HttpException) {
			throw error;
		}
		throw new HttpException(
			'Внутренняя ошибка сервера',
			HttpStatus.INTERNAL_SERVER_ERROR
		);
	}
}
