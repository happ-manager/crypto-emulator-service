import { Injectable } from "@nestjs/common";
import {
	createAssociatedTokenAccountIdempotentInstruction,
	createSyncNativeInstruction,
	getAssociatedTokenAddressSync,
	NATIVE_MINT,
	TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
	ComputeBudgetProgram,
	SystemProgram,
	TransactionInstruction,
	TransactionMessage,
	VersionedTransaction
} from "@solana/web3.js";

import type { IDex, IDexSwap, IDexWrap } from "../../solana/interfaces/dex.interface";
import { encodeData } from "../utils/encode-data.util";

@Injectable()
export class RaydiumService implements IDex {
	async wrap(dexWrap: IDexWrap) {
		const { signer, amount, rpc } = dexWrap;
		const wsol = getAssociatedTokenAddressSync(NATIVE_MINT, signer.publicKey);
		const instructions: TransactionInstruction[] = [
			createAssociatedTokenAccountIdempotentInstruction(signer.publicKey, wsol, signer.publicKey, NATIVE_MINT),
			SystemProgram.transfer({
				fromPubkey: signer.publicKey,
				toPubkey: wsol,
				lamports: amount * 1e9
			}),
			createSyncNativeInstruction(wsol)
		];

		return rpc.sendSmartTransaction(instructions, [signer]);
	}

	async swap(dexSwap: IDexSwap) {
		const {
			signer,
			from,
			to,
			amount,
			poolKeys,
			microLamports,
			units,
			skipPreflight,
			maxRetries,
			preflightCommitment,
			blockhash,
			rpc
		} = dexSwap;

		const tokenInAccount = getAssociatedTokenAddressSync(from, signer.publicKey);
		const tokenOutAccount = getAssociatedTokenAddressSync(to, signer.publicKey);

		const instructions: TransactionInstruction[] = [
			ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
			ComputeBudgetProgram.setComputeUnitLimit({ units }),
			createAssociatedTokenAccountIdempotentInstruction(signer.publicKey, tokenInAccount, signer.publicKey, from),
			createAssociatedTokenAccountIdempotentInstruction(signer.publicKey, tokenOutAccount, signer.publicKey, to),
			new TransactionInstruction({
				programId: poolKeys.programId,
				data: encodeData(from, amount),
				keys: [
					// system
					{ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
					// amm
					{ pubkey: poolKeys.id, isSigner: false, isWritable: true },
					{ pubkey: poolKeys.authority, isSigner: false, isWritable: false },
					{ pubkey: poolKeys.openOrders, isSigner: false, isWritable: true },
					{ pubkey: poolKeys.targetOrders, isSigner: false, isWritable: true },
					{ pubkey: poolKeys.baseVault, isSigner: false, isWritable: true },
					{ pubkey: poolKeys.quoteVault, isSigner: false, isWritable: true },
					// serum
					{ pubkey: poolKeys.marketProgramId, isSigner: false, isWritable: false },
					{ pubkey: poolKeys.marketId, isSigner: false, isWritable: true },
					{ pubkey: poolKeys.marketBids, isSigner: false, isWritable: true },
					{ pubkey: poolKeys.marketAsks, isSigner: false, isWritable: true },
					{ pubkey: poolKeys.marketEventQueue, isSigner: false, isWritable: true },
					{ pubkey: poolKeys.marketBaseVault, isSigner: false, isWritable: true },
					{ pubkey: poolKeys.marketQuoteVault, isSigner: false, isWritable: true },
					{ pubkey: poolKeys.marketAuthority, isSigner: false, isWritable: false },
					// user
					{ pubkey: tokenInAccount, isSigner: false, isWritable: true },
					{ pubkey: tokenOutAccount, isSigner: false, isWritable: true },
					{ pubkey: signer.publicKey, isSigner: true, isWritable: false }
				]
			})
		];

		const transactionMessage = new TransactionMessage({
			instructions,
			payerKey: signer.publicKey,
			recentBlockhash: blockhash
		});
		const transaction = new VersionedTransaction(transactionMessage.compileToV0Message());

		transaction.sign([signer]);

		return rpc.connection.sendRawTransaction(transaction.serialize(), {
			skipPreflight,
			preflightCommitment,
			maxRetries
		});
	}
}
