import type { ISolanaMessage } from "../interfaces/solana-message.interface";

export function checkIsInit(message: ISolanaMessage) {
	return message?.params?.result?.transaction.meta.logMessages.some((x) => x.includes("Program log: initialize2"));
}
