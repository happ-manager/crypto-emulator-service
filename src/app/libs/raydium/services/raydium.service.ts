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
		const { owner, amount, rpc } = dexWrap;
		const wsol = getAssociatedTokenAddressSync(NATIVE_MINT, owner.publicKey);
		const instructions: TransactionInstruction[] = [
			createAssociatedTokenAccountIdempotentInstruction(owner.publicKey, wsol, owner.publicKey, NATIVE_MINT),
			SystemProgram.transfer({
				fromPubkey: owner.publicKey,
				toPubkey: wsol,
				lamports: amount * 1e9
			}),
			createSyncNativeInstruction(wsol)
		];

		return rpc.sendSmartTransaction(instructions, [owner]);
	}

	async swap(dexSwap: IDexSwap) {
		const {
			owner,
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

		const tokenInAccount = getAssociatedTokenAddressSync(from, owner.publicKey);
		const tokenOutAccount = getAssociatedTokenAddressSync(to, owner.publicKey);

		console.log({
			owner: owner.publicKey,
			from,
			to,
			tokenInAccount,
			tokenOutAccount
		});

		const instructions: TransactionInstruction[] = [
			ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
			ComputeBudgetProgram.setComputeUnitLimit({ units }),
			createAssociatedTokenAccountIdempotentInstruction(owner.publicKey, tokenInAccount, owner.publicKey, from),
			createAssociatedTokenAccountIdempotentInstruction(owner.publicKey, tokenOutAccount, owner.publicKey, to),
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
					{ pubkey: owner.publicKey, isSigner: true, isWritable: false }
				]
			})
		];

		const transactionMessage = new TransactionMessage({
			instructions,
			payerKey: owner.publicKey,
			recentBlockhash: blockhash
		});
		const transaction = new VersionedTransaction(transactionMessage.compileToV0Message());

		transaction.sign([owner]);

		return rpc.connection.sendRawTransaction(transaction.serialize(), {
			skipPreflight,
			preflightCommitment,
			maxRetries
		});
	}
}
