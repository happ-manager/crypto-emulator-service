import {
	parseBigNumberish,
	struct,
	Token,
	TOKEN_PROGRAM_ID,
	TokenAmount,
	u8 as u82,
	u64
} from "@raydium-io/raydium-sdk";
import { NATIVE_MINT } from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";

export function encodeData(from: PublicKey, amount: number) {
	const decimals = from.equals(NATIVE_MINT) ? 9 : 6;
	const tokenAmount = Math.round(amount * 10 ** decimals); // Используем Math.floor для избегания погрешностей

	// Определяем входной токен и его количество
	const inputToken = new Token(TOKEN_PROGRAM_ID, from, decimals, "TOKEN", "Input Token");
	const inputTokenAmount = new TokenAmount(inputToken, tokenAmount);

	const LAYOUT = struct([u82("instruction"), u64("amountIn"), u64("minAmountOut")]);
	const data = Buffer.alloc(LAYOUT.span);
	LAYOUT.encode(
		{ instruction: 9, amountIn: parseBigNumberish(inputTokenAmount.raw), minAmountOut: parseBigNumberish(1) },
		data
	);

	return data;
}
