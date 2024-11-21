import type { VerificationStatusEnum } from "../enums/verification-status.enum";

export interface IUser {
	id: string;
	verificationStatus: VerificationStatusEnum;
	verificationCode?: string;
	name?: string;
	email?: string;
	password?: string;
	tel?: string;
	telegramId?: string;
}
