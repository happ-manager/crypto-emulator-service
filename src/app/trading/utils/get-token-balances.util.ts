import type { TokenBalance } from "@solana/web3.js";

import { WSOL_WALLET } from "../../libs/solana/constant/wallets.constant";
import { RaydiumInstruction } from "../../libs/solana/enums/raydium-instruction.enum";

export interface ITokenBalances {
	wsolMint: string;
	tokenMint: string;
	myWsolBalance: number;
	myTokenBalance: number;
	poolWsolBalance: number;
	poolTokenBalance: number;
}

export function getTokenBalanaces(
	tokenBalances: TokenBalance[],
	instructionType: RaydiumInstruction,
	isJupiter: boolean
): ITokenBalances {
	const [first, second, third, fourth] = tokenBalances;

	const isFirstWsol = first.mint === WSOL_WALLET;
	const isThirdWsol = third.mint === WSOL_WALLET;

	const wsolMint = isFirstWsol ? first.mint : second.mint;
	const tokenMint = isFirstWsol ? second.mint : first.mint;

	let myWsolBalance: TokenBalance;
	let myTokenBalance: TokenBalance;
	let poolWsolBalance: TokenBalance;
	let poolTokenBalance: TokenBalance;

	if (isJupiter) {
		// Для юпитера - 2 кошелька. Первый - пользователя, второй, третий - пул лквидности
		myWsolBalance = first;
		myTokenBalance = first;

		poolWsolBalance = isThirdWsol ? third : second;
		poolTokenBalance = isThirdWsol ? second : third;
	} else if (instructionType === RaydiumInstruction.CREATE_POOL) {
		poolWsolBalance = isFirstWsol ? first : second;
		poolTokenBalance = isFirstWsol ? second : first;
	} else {
		myWsolBalance = isFirstWsol ? first : second;
		myTokenBalance = isFirstWsol ? second : first;

		poolWsolBalance = isThirdWsol ? third : fourth;
		poolTokenBalance = isThirdWsol ? fourth : third;
	}

	return {
		wsolMint,
		tokenMint,
		myWsolBalance: myWsolBalance?.uiTokenAmount.uiAmount,
		myTokenBalance: myTokenBalance?.uiTokenAmount.uiAmount,
		poolWsolBalance: poolWsolBalance?.uiTokenAmount.uiAmount,
		poolTokenBalance: poolTokenBalance?.uiTokenAmount.uiAmount
	};
}
