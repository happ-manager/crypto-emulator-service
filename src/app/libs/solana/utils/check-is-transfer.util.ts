import type { ISolanaMessage } from "../interfaces/solana-message.interface";

export function checkIsTransfer(message: ISolanaMessage) {
	return message?.params?.result?.transaction?.meta.logMessages.includes("Program log: Instruction: Transfer");
}
