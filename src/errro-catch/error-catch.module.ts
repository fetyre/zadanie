import { Global, Module } from '@nestjs/common';
import { ErrorHandlerService } from './error-catch.service';

@Global()
@Module({
	providers: [ErrorHandlerService],
	exports: [ErrorHandlerService]
})
export class ErrorHandlerModule {}
