import type { SendOptions } from "@solana/web3.js";

import { CommitmentTypeEnum } from "../enums/commitment-type.enum";

export const SEND_OPTIONS: SendOptions = {
	skipPreflight: true,
	preflightCommitment: CommitmentTypeEnum.PROCESSED,
	maxRetries: 1
};
