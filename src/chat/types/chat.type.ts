import { Chat, User } from '@prisma/client';
import { ChatWithUsers } from '../interface';

export type NullableChat = Chat | null;

export type UserChatData = { chat: ChatWithUsers[] } & User;

export type UserChatResponse = UserChatData | null;
