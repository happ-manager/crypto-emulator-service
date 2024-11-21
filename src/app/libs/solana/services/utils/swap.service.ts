import type { OnModuleInit } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { LiquidityPoolKeysV4 } from "@raydium-io/raydium-sdk";
import {
	Liquidity,
	LIQUIDITY_STATE_LAYOUT_V4,
	MAINNET_PROGRAM_ID,
	Market,
	MARKET_STATE_LAYOUT_V3,
	Token,
	TOKEN_PROGRAM_ID,
	TokenAmount
} from "@raydium-io/raydium-sdk";
import {
	createAssociatedTokenAccountIdempotentInstruction,
	createCloseAccountInstruction,
	createSyncNativeInstruction,
	getAssociatedTokenAddressSync
} from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import bs58 from "bs58";

import { LoggerService } from "../../../logger";
import { CONFIRMED_CONNECTION } from "../../injection-tokens/confirmed-connection.injection-token";
import { TransactionBuilderService } from "./transaction-builder.service";

@Injectable()
export class SwapService implements OnModuleInit {
	constructor(
		@Inject(CONFIRMED_CONNECTION) private readonly _connection: Connection,
		private readonly _transactionBuilderService: TransactionBuilderService,
		private readonly _loggerService: LoggerService
	) {}

	async onModuleInit() {}

	async buyToken(poolAddress: string, price: number, secret: string) {
		const poolKeys = await this.getPoolKeys(poolAddress);

		if (!poolKeys) {
			this._loggerService.error(`Cant find pool keys`);
			return;
		}

		return this.snipeToken(poolKeys, price, secret);
	}

	async sellToken(poolAddress: string, secret: string) {
		const poolKeys = await this.getPoolKeys(poolAddress);

		if (!poolKeys) {
			this._loggerService.error(`Cant find pool keys`);
			return;
		}

		return this.snipeSellToken(poolKeys, secret);
	}

	async snipeSellToken(poolKeys: LiquidityPoolKeysV4, secret: string) {
		const sniperWallet = Keypair.fromSecretKey(bs58.decode(secret));

		try {
			const outputToken = new Token(
				TOKEN_PROGRAM_ID,
				new PublicKey(poolKeys.quoteMint),
				poolKeys.quoteDecimals,
				"BASE_TOKEN",
				"Base Token"
			);

			const outputTokenAccountAddress = getAssociatedTokenAddressSync(outputToken.mint, sniperWallet.publicKey);

			const wsolAccountAddress = getAssociatedTokenAddressSync(
				new PublicKey("So11111111111111111111111111111111111111112"),
				sniperWallet.publicKey
			);

			const transactionIx: TransactionInstruction[] = [];

			// Create output token account if it doesn't exist
			transactionIx.push(
				createAssociatedTokenAccountIdempotentInstruction(
					sniperWallet.publicKey,
					outputTokenAccountAddress,
					sniperWallet.publicKey,
					outputToken.mint
				)
			);

			// Get balance of output token account
			const outputTokenAccountInfo = await this._connection.getTokenAccountBalance(outputTokenAccountAddress);
			const outputTokenAmount = new TokenAmount(outputToken, outputTokenAccountInfo.value.amount);

			if (outputTokenAmount.raw.isZero()) {
				this._loggerService.error("No tokens available to sell.");
				return;
			}

			// Create WSOL account if it doesn't exist
			transactionIx.push(
				createAssociatedTokenAccountIdempotentInstruction(
					sniperWallet.publicKey,
					wsolAccountAddress,
					sniperWallet.publicKey,
					new PublicKey("So11111111111111111111111111111111111111112")
				),
				SystemProgram.transfer({
					fromPubkey: sniperWallet.publicKey,
					toPubkey: wsolAccountAddress,
					lamports: 1_000_000 // Ensure WSOL account has some SOL for rent-exemption
				}),
				createSyncNativeInstruction(wsolAccountAddress)
			);

			// Make swap instruction
			const { innerTransaction } = Liquidity.makeSwapFixedInInstruction(
				{
					poolKeys,
					userKeys: {
						owner: sniperWallet.publicKey,
						tokenAccountIn: outputTokenAccountAddress,
						tokenAccountOut: wsolAccountAddress
					},
					amountIn: outputTokenAmount.raw,
					minAmountOut: 1 // Set minimum amount out to prevent slippage issues
				},
				poolKeys.version
			);

			// Add swap instructions
			transactionIx.push(
				...innerTransaction.instructions,
				createCloseAccountInstruction(wsolAccountAddress, sniperWallet.publicKey, sniperWallet.publicKey)
			);

			return await this._transactionBuilderService.sendSmartTransaction(
				transactionIx,
				[sniperWallet, ...innerTransaction.signers],
				[]
				// 2_500_000
			);
		} catch (error) {
			this._loggerService.error(`Error during sell token: ${error.message}`);
		}
	}

	async snipeToken(poolKeys: LiquidityPoolKeysV4, price: number, walletSecret: string) {
		const sniperWallet = Keypair.fromSecretKey(bs58.decode(walletSecret));

		try {
			const WSOL_TOKEN = new Token(
				TOKEN_PROGRAM_ID,
				new PublicKey("So11111111111111111111111111111111111111112"),
				9,
				"WSOL",
				"Wrapped SOL"
			);

			const inputTokenAmount = new TokenAmount(WSOL_TOKEN, price * LAMPORTS_PER_SOL);

			const wsolAccountAddress = getAssociatedTokenAddressSync(WSOL_TOKEN.mint, sniperWallet.publicKey);

			const outputTokenAccountAddress = getAssociatedTokenAddressSync(
				new PublicKey(poolKeys.quoteMint),
				sniperWallet.publicKey
			);

			let transactionIx: TransactionInstruction[] = [];

			transactionIx = [
				createAssociatedTokenAccountIdempotentInstruction(
					sniperWallet.publicKey,
					wsolAccountAddress,
					sniperWallet.publicKey,
					WSOL_TOKEN.mint
				),
				SystemProgram.transfer({
					fromPubkey: sniperWallet.publicKey,
					toPubkey: wsolAccountAddress,
					lamports: inputTokenAmount.raw.toNumber()
				}),
				createSyncNativeInstruction(wsolAccountAddress),
				createAssociatedTokenAccountIdempotentInstruction(
					sniperWallet.publicKey,
					outputTokenAccountAddress,
					sniperWallet.publicKey,
					poolKeys.quoteMint
				)
			];

			const { innerTransaction } = Liquidity.makeSwapFixedInInstruction(
				{
					poolKeys,
					userKeys: {
						owner: sniperWallet.publicKey,
						tokenAccountIn: wsolAccountAddress,
						tokenAccountOut: outputTokenAccountAddress
					},
					amountIn: inputTokenAmount.raw,
					minAmountOut: 0
				},
				poolKeys.version
			);

			transactionIx.push(
				...innerTransaction.instructions,
				createCloseAccountInstruction(wsolAccountAddress, sniperWallet.publicKey, sniperWallet.publicKey)
			);

			return await this._transactionBuilderService.sendSmartTransaction(
				transactionIx,
				[sniperWallet, ...innerTransaction.signers],
				[]
				// 2_500_000
			);
		} catch (error) {
			this._loggerService.error(error);
		}
	}

	async getPoolKeys(poolAddress: string): Promise<LiquidityPoolKeysV4> {
		const poolId = new PublicKey(poolAddress);
		let poolAccount;
		let marketAccount;

		while (true) {
			poolAccount = await this._connection.getAccountInfo(poolId);
			if (poolAccount) {
				break;
			}
		}

		const poolInfo = LIQUIDITY_STATE_LAYOUT_V4.decode(poolAccount.data);

		while (true) {
			marketAccount = await this._connection.getAccountInfo(poolInfo.marketId);
			if (marketAccount) {
				break;
			}
		}

		const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);

		return {
			id: poolId,
			baseMint: poolInfo.baseMint,
			quoteMint: poolInfo.quoteMint,
			lpMint: poolInfo.lpMint,
			baseDecimals: poolInfo.baseDecimal.toNumber(),
			quoteDecimals: poolInfo.quoteDecimal.toNumber(),
			lpDecimals: poolInfo.baseDecimal.toNumber(),
			version: 4,
			programId: MAINNET_PROGRAM_ID.AmmV4,
			authority: Liquidity.getAssociatedAuthority({
				programId: poolAccount.owner
			}).publicKey,
			openOrders: poolInfo.openOrders,
			targetOrders: poolInfo.targetOrders,
			baseVault: poolInfo.baseVault,
			quoteVault: poolInfo.quoteVault,
			withdrawQueue: poolInfo.withdrawQueue,
			lpVault: poolInfo.lpVault,
			marketVersion: 3,
			marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
			marketId: poolInfo.marketId,
			marketAuthority: Market.getAssociatedAuthority({
				programId: poolInfo.marketProgramId,
				marketId: poolInfo.marketId
			}).publicKey,
			marketBaseVault: marketInfo.baseVault,
			marketQuoteVault: marketInfo.quoteVault,
			marketBids: marketInfo.bids,
			marketAsks: marketInfo.asks,
			marketEventQueue: marketInfo.eventQueue,
			lookupTableAccount: new PublicKey("11111111111111111111111111111111")
		};
	}
}
