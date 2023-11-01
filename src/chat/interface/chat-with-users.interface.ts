import { User } from '@prisma/client';

export interface ChatWithUsers {
	users: User[];
	id: string;
	name: string;
	created_at: Date;
}
