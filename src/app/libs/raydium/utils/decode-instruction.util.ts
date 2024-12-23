import bs58 from "bs58";
import type { Instruction } from "helius-sdk";

import { CREATE_POOL_STRUCT } from "../constants/structs";

// Типы для декодированных инструкций
export interface IDecodedInstruction {
	instructionType: number;
	details: Record<string, any>;
}

export function decodeInstruction(instruction: Instruction): IDecodedInstruction {
	if (!instruction.data) {
		return;
	}

	const decodedData = bs58.decode(instruction.data);
	const buffer = Buffer.from(decodedData);

	const [instructionType] = decodedData;
	let details: Record<string, any> = {};

	switch (instructionType) {
		case 0: // Init Pool
			details = {
				nonce: decodedData[1],
				startTime: decodedData.slice(2, 10)
			};
			break;
		case 1: // Create Pool
			details = CREATE_POOL_STRUCT.decode(buffer);

			break;
		case 3: // Add Liquidity
			details = {
				baseAmountIn: decodedData.slice(1, 9),
				quoteAmountIn: decodedData.slice(9, 17),
				otherAmountMin: decodedData.slice(17, 25),
				fixedSide: decodedData[25] === 0 ? "base" : "quote"
			};
			break;
		case 4: // Remove Liquidity
			details = {
				lpAmount: decodedData.slice(1, 9),
				baseAmountMin: decodedData.slice(9, 17),
				quoteAmountMin: decodedData.slice(17, 25)
			};
			break;
		case 9: // Swap Fixed In
			details = {
				amountIn: decodedData.slice(1, 9),
				minAmountOut: decodedData.slice(9, 17)
			};
			break;
		case 11: // Swap Fixed Out
			details = {
				maxAmountIn: decodedData.slice(1, 9),
				amountOut: decodedData.slice(9, 17)
			};
			break;
		case 12: // Simulate Pool
			details = {
				simulateType: decodedData[1]
			};
			break;
		default:
			details = {};
			break;
	}

	return {
		details,
		instructionType
	};
}
