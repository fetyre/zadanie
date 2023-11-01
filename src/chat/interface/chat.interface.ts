/**
 * @interface IChat
 * @description Интерфейс для создания чата
 * @property {string[]} users - Массив идентификаторов пользователей.
 * @property {string} name - Имя чата.
 */
export interface IChat {
	users: string[];
	name: string;
}
