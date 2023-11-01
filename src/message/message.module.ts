import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from 'src/prisma.batabase/prisma.module';
import { ConfigLoaderModule } from 'src/config/config.module';
import { ConfigLoaderService } from 'src/config/config.service';

@Module({
	imports: [PrismaModule, ConfigLoaderModule],
	controllers: [MessageController],
	providers: [MessageService, ConfigLoaderService]
})
export class MessageModule {}
