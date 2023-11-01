import { Chat, User } from '@prisma/client';

export type UserOrUndefined = User | undefined;

export type ChatWithUsers = Chat & { users: User[] };

export type NullableChatWithUsers = ChatWithUsers | null;

export type OptionalUser = User | null;

export type OptionalChat = Chat | null;
