import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaModule } from 'src/prisma.batabase/prisma.module';
import { ChatController } from './chat.controller';
import { UserService } from 'src/user/user.service';

@Module({
	imports: [PrismaModule],
	controllers: [ChatController],
	providers: [ChatService, UserService]
})
export class ChatModule {}
