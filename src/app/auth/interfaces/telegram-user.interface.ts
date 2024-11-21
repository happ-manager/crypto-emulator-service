import type { User } from "typegram/manage";

export interface ITelegramUser extends User {
	phone: string;
}
