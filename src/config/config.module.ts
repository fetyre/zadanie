import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigLoaderService } from './config.service';

@Module({
	imports: [ConfigModule],
	providers: [ConfigLoaderService],
	exports: [ConfigLoaderService]
})
export class ConfigLoaderModule {}
