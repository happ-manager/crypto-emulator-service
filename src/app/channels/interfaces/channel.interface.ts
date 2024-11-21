import type { VerificationStatusEnum } from "../../users/enums/verification-status.enum";

export interface IChannel {
	id: string;
	verificationStatus: VerificationStatusEnum;
	telegramId?: string;
}
