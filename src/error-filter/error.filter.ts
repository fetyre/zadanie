import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	InternalServerErrorException
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorResponse } from './interface/error-response.interface';
import { ErrorMessageType } from './type/error-message.type';
import * as moment from 'moment-timezone';
import { ConfigLoaderService } from 'src/config/config.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly configLoaderService: ConfigLoaderService
	) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const ext: HttpException = this.handleException(exception);
		return this.handleHttpResponse(response, ext, host);
	}

	private handleException(exception: unknown): HttpException {
		if (exception instanceof HttpException) {
			return exception;
		} else {
			const message = exception?.['message'];
			return new InternalServerErrorException(message);
		}
	}

	private handleHttpResponse(
		response: any,
		exception: HttpException,
		host: ArgumentsHost
	) {
		const status: number = this.extractStatus(exception);
		const message: ErrorMessageType = this.extractErrorMessage(exception);
		const requestUrl: string = host.switchToHttp().getRequest().url;
		const responseBody: ErrorResponse = this.createResponseBody(
			status,
			message,
			requestUrl
		);
		response.status(status).json(responseBody);
	}

	private extractStatus(exception: HttpException): number {
		return exception instanceof HttpException
			? exception.getStatus()
			: this.configLoaderService.errorDefaultStatus;
	}

	private extractErrorMessage(exception: HttpException): ErrorMessageType {
		return exception instanceof HttpException
			? exception.getResponse()
			: this.configLoaderService.errorDefaultMessage;
	}

	private createResponseBody(
		status: number,
		message: ErrorMessageType,
		requestUrl?: string
	): ErrorResponse {
		const currentDateTime: string = moment
			.tz(this.configLoaderService.errorDefaultTimeTz)
			.format(this.configLoaderService.errorDefaultTimeFormat);
		return {
			statusCode: status,
			timestamp: currentDateTime,
			message,
			requestUrl
		};
	}
}
