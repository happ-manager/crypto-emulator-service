import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import type {
	AddressLookupTableAccount,
	SendOptions,
	SerializeConfig,
	Signer,
	TransactionInstruction
} from "@solana/web3.js";
import {
	ComputeBudgetProgram,
	PublicKey,
	SystemProgram,
	Transaction,
	TransactionExpiredBlockheightExceededError,
	TransactionMessage,
	VersionedTransaction
} from "@solana/web3.js";
import bs58 from "bs58";
import type { GetPriorityFeeEstimateRequest, GetPriorityFeeEstimateResponse, JitoRegion } from "helius-sdk";
import { JITO_API_URLS, JITO_TIP_ACCOUNTS } from "helius-sdk";
import { firstValueFrom } from "rxjs";

import { SOLANA_CONFIG } from "../injection-tokens/solana-config.injection-token";
import { ISolanaConfig } from "../interfaces/solana-config.interface";

@Injectable()
export class TransactionBuilderService {
	constructor(
		@Inject(SOLANA_CONFIG) readonly _solanaConfig: ISolanaConfig,
		private httpService: HttpService
	) {}

	async sendSmartTransaction(
		instructions: TransactionInstruction[],
		signers: Signer[],
		lookupTables: AddressLookupTableAccount[] = [],
		sendOptions: SendOptions & {
			feePayer?: Signer;
			lastValidBlockHeightOffset?: number;
		} = { skipPreflight: false, lastValidBlockHeightOffset: 150 }
	) {
		const lastValidBlockHeightOffset = sendOptions.lastValidBlockHeightOffset ?? 150;

		if (lastValidBlockHeightOffset < 0) {
			throw new Error("expiryBlockOffset must be a positive integer");
		}

		try {
			const { transaction, blockhash, minContextSlot } = await this.createSmartTransaction(
				instructions,
				signers,
				lookupTables,
				sendOptions.feePayer
			);

			const commitment = sendOptions?.preflightCommitment || "confirmed";

			const currentBlockHeight = await this._solanaConfig.provider.connection.getBlockHeight();
			const lastValidBlockHeight = Math.min(
				blockhash.lastValidBlockHeight,
				currentBlockHeight + lastValidBlockHeightOffset
			);

			let error: Error;

			// We will retry the transaction on TransactionExpiredBlockheightExceededError
			// until the lastValidBlockHeightOffset is reached in case the transaction is
			// included after the lastValidBlockHeight due to network latency or
			// to the leader not forwarding the transaction for an unknown reason
			// Worst case scenario, it'll retry until the lastValidBlockHeightOffset is reached
			// The tradeoff is better reliability at the cost of a possible longer confirmation time
			do {
				try {
					// signature does not change when it resends the same one
					const signature = await this._solanaConfig.provider.connection.sendRawTransaction(transaction.serialize(), {
						maxRetries: 0,
						preflightCommitment: "confirmed",
						skipPreflight: sendOptions.skipPreflight,
						minContextSlot,
						...sendOptions
					} as any);

					const abortSignal = AbortSignal.timeout(15_000);
					await this._solanaConfig.provider.connection.confirmTransaction(
						{
							abortSignal,
							signature,
							blockhash: blockhash.blockhash,
							lastValidBlockHeight
						},
						commitment
					);

					abortSignal.removeEventListener("abort", () => {});

					return signature;
				} catch (_error: any) {
					if (!(_error instanceof Error)) {
						error = new Error();
					}

					error = _error;
				}
			} while (!(error instanceof TransactionExpiredBlockheightExceededError));
		} catch (error) {
			throw new Error(`Error sending smart transaction: ${error}`);
		}

		throw new Error("Transaction failed to confirm within lastValidBlockHeight");
	}

	async createSmartTransaction(
		instructions: TransactionInstruction[],
		signers: Signer[],
		lookupTables: AddressLookupTableAccount[] = [],
		feePayer?: Signer,
		serializeOptions: SerializeConfig = {
			requireAllSignatures: true,
			verifySignatures: true
		}
	) {
		if (signers.length === 0) {
			throw new Error("The transaction must have at least one signer");
		}

		// Check if any of the instructions provided set the compute unit price and/or limit, and throw an error if true
		const existingComputeBudgetInstructions = instructions.filter((instruction) =>
			instruction.programId.equals(ComputeBudgetProgram.programId)
		);

		if (existingComputeBudgetInstructions.length > 0) {
			throw new Error("Cannot provide instructions that set the compute unit price and/or limit");
		}

		// For building the transaction
		const payerKey = feePayer ? feePayer.publicKey : signers[0].publicKey;
		const {
			context: { slot: minContextSlot },
			value: blockhash
		} = await this._solanaConfig.provider.connection.getLatestBlockhashAndContext();
		const recentBlockhash = blockhash.blockhash;

		// Determine if we need to use a versioned transaction
		const isVersioned = lookupTables.length > 0;
		let legacyTransaction: Transaction | null = null;
		let versionedTransaction: VersionedTransaction | null = null;

		// Build the initial transaction based on whether lookup tables are present
		if (isVersioned) {
			const v0Message = new TransactionMessage({
				instructions,
				payerKey,
				recentBlockhash
			}).compileToV0Message(lookupTables);

			versionedTransaction = new VersionedTransaction(v0Message);

			// Include feePayer in signers if it exists and is not already in the list
			const allSigners = feePayer ? [...signers, feePayer] : signers;
			versionedTransaction.sign(allSigners);
		} else {
			legacyTransaction = new Transaction().add(...instructions);
			legacyTransaction.recentBlockhash = recentBlockhash;
			legacyTransaction.feePayer = payerKey;

			for (const signer of signers) {
				legacyTransaction.partialSign(signer);
			}

			if (feePayer) {
				legacyTransaction.partialSign(feePayer);
			}
		}

		// Serialize the transaction
		const serializedTransaction = bs58.encode(
			isVersioned ? versionedTransaction.serialize() : legacyTransaction.serialize(serializeOptions)
		);

		// Get the priority fee estimate based on the serialized transaction
		// const priorityFeeEstimateResponse = await this.getPriorityFeeEstimate({
		//     transaction: serializedTransaction,
		//     options: {
		//         recommended: true,
		//     },
		// });
		//
		// console.log(
		//     `${new Date().toISOString()} createSmartTransaction 4`
		// );
		// const { priorityFeeEstimate } = priorityFeeEstimateResponse;
		//
		// if (!priorityFeeEstimate) {
		//     throw new Error('Priority fee estimate not available');
		// }
		//
		//
		// console.log('priorityFeeEstimate',priorityFeeEstimate);

		// Add the compute unit price instruction with the estimated fee
		const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
			// microLamports: priorityFeeEstimate,
			microLamports: 10_321_196
		});

		instructions.unshift(computeBudgetIx);

		// Get the optimal compute units
		// const units = await this.getComputeUnits(
		//     instructions,
		//     payerKey,
		//     isVersioned ? lookupTables : [],
		//     signers
		// );
		//
		// if (!units) {
		//     throw new Error(
		//         `Error fetching compute units for the instructions provided`
		//     );
		// }
		//
		// console.log(
		//     `${new Date().toISOString()} createSmartTransaction 6`
		// );

		// For very small transactions, such as simple transfers, default to 1k CUs
		// const customersCU = units < 1000 ? 1000 : Math.ceil(units * 1.1);
		const customersCU = 96_888;

		const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
			units: customersCU
		});

		instructions.unshift(computeUnitsIx);

		// Rebuild the transaction with the final instructions
		if (isVersioned) {
			const v0Message = new TransactionMessage({
				instructions,
				payerKey,
				recentBlockhash
			}).compileToV0Message(lookupTables);

			versionedTransaction = new VersionedTransaction(v0Message);

			const allSigners = feePayer ? [...signers, feePayer] : signers;
			versionedTransaction.sign(allSigners);

			return {
				transaction: versionedTransaction,
				blockhash,
				minContextSlot
			};
		}
		legacyTransaction = new Transaction().add(...instructions);
		legacyTransaction.recentBlockhash = recentBlockhash;
		legacyTransaction.feePayer = payerKey;

		for (const signer of signers) {
			legacyTransaction.partialSign(signer);
		}

		if (feePayer) {
			legacyTransaction.partialSign(feePayer);
		}

		return {
			transaction: legacyTransaction,
			blockhash,
			minContextSlot
		};
	}

	async getPriorityFeeEstimate(params: GetPriorityFeeEstimateRequest) {
		try {
			const url = `${this._solanaConfig.provider.connection.rpcEndpoint}`;
			const response = await firstValueFrom(
				this.httpService.post(
					url,
					{
						jsonrpc: "2.0",
						id: 422,
						method: "getPriorityFeeEstimate",
						params: [params]
					},
					{
						headers: { "Content-Type": "application/json" }
					}
				)
			);

			if (response.data.error) {
				throw new Error(`Error fetching priority fee estimate: ${JSON.stringify(response.data.error, null, 2)}`);
			}

			return response.data.result as GetPriorityFeeEstimateResponse;
		} catch (error) {
			throw new Error(`Error fetching priority fee estimate: ${error}`);
		}
	}

	async getComputeUnits(
		instructions: TransactionInstruction[],
		payer: PublicKey,
		lookupTables: AddressLookupTableAccount[],
		signers?: Signer[]
	) {
		const testInstructions = [ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }), ...instructions];

		const testTransaction = new VersionedTransaction(
			new TransactionMessage({
				instructions: testInstructions,
				payerKey: payer,
				recentBlockhash: (await this._solanaConfig.provider.connection.getLatestBlockhash()).blockhash
			}).compileToV0Message(lookupTables)
		);

		if (signers) {
			testTransaction.sign(signers);
		}

		const rpcResponse = await this._solanaConfig.provider.connection.simulateTransaction(testTransaction, {
			sigVerify: Boolean(signers)
		});

		if (rpcResponse.value.err) {
			console.error(`Simulation error: ${JSON.stringify(rpcResponse.value.err, null, 2)}`);
			return null;
		}

		return rpcResponse.value.unitsConsumed || null;
	}

	async sendSmartTransactionWithTip(
		instructions: TransactionInstruction[],
		signers: Signer[],
		lookupTables: AddressLookupTableAccount[] = [],
		tipAmount: number = 1000,
		region: JitoRegion = "Default",
		feePayer?: Signer,
		lastValidBlockHeightOffset = 150
	) {
		if (lastValidBlockHeightOffset < 0) {
			throw new Error("lastValidBlockHeightOffset must be a positive integer");
		}

		if (signers.length === 0) {
			throw new Error("The transaction must have at least one signer");
		}

		// Create the smart transaction with tip based
		const { transaction, blockhash } = await this.createSmartTransactionWithTip(
			instructions,
			signers,
			lookupTables,
			tipAmount,
			feePayer
		);

		const serializedTransaction = bs58.encode(transaction.serialize());

		// Get the Jito API URL for the specified region
		const jitoApiUrl = `${JITO_API_URLS[region]}/api/v1/bundles`;

		// Send the transaction as a Jito Bundle
		const bundleId = await this.sendJitoBundle([serializedTransaction], jitoApiUrl);

		const currentBlockHeight = await this._solanaConfig.provider.connection.getBlockHeight();
		const lastValidBlockHeight = Math.min(
			blockhash.lastValidBlockHeight,
			currentBlockHeight + lastValidBlockHeightOffset
		);

		// Poll for confirmation status
		const timeout = 60_000; // 60 second timeout
		const interval = 5000; // 5 second interval
		const startTime = Date.now();

		while (
			Date.now() - startTime < timeout ||
			(await this._solanaConfig.provider.connection.getBlockHeight()) <= lastValidBlockHeight
		) {
			const bundleStatuses = await this.getBundleStatuses([bundleId], jitoApiUrl);

			if (bundleStatuses && bundleStatuses.value && bundleStatuses.value.length > 0) {
				const status = bundleStatuses.value[0].confirmation_status;

				if (status === "confirmed") {
					return bundleStatuses.value[0].transactions[0];
				}
			}

			await new Promise((resolve) => setTimeout(resolve, interval));
		}

		throw new Error("Bundle failed to confirm within the timeout period");
	}

	async sendJitoBundle(serializedTransactions: string[], jitoApiUrl: string) {
		const response = await firstValueFrom(
			this.httpService.post(
				jitoApiUrl,
				{
					jsonrpc: "2.0",
					id: 1,
					method: "sendBundle",
					params: [serializedTransactions]
				},
				{
					headers: { "Content-Type": "application/json" }
				}
			)
		);

		console.log("sendJitoBundle", { test: response.data.result });

		if (response.data.error) {
			throw new Error(`Error sending bundles: ${JSON.stringify(response.data.error, null, 2)}`);
		}

		return response.data.result;
	}

	async getBundleStatuses(bundleIds: string[], jitoApiUrl: string) {
		const response = await firstValueFrom(
			this.httpService.post(
				jitoApiUrl,
				{
					jsonrpc: "2.0",
					id: 1,
					method: "getBundleStatuses",
					params: [bundleIds]
				},
				{
					headers: { "Content-Type": "application/json" }
				}
			)
		);

		console.log("getBundleStatuses", { test: response.data.result });

		if (response.data.error) {
			throw new Error(`Error getting bundle statuses: ${JSON.stringify(response.data.error, null, 2)}`);
		}

		return response.data.result;
	}

	async createSmartTransactionWithTip(
		instructions: TransactionInstruction[],
		signers: Signer[],
		lookupTables: AddressLookupTableAccount[] = [],
		tipAmount: number = 1000,
		feePayer?: Signer
	) {
		if (signers.length === 0) {
			throw new Error("The transaction must have at least one signer");
		}

		// Select a random tip account
		const randomTipAccount = JITO_TIP_ACCOUNTS[Math.floor(Math.random() * JITO_TIP_ACCOUNTS.length)];

		// Set the fee payer and add the tip instruction
		const payerKey = feePayer ? feePayer.publicKey : signers[0].publicKey;
		this.addTipInstruction(instructions, payerKey, randomTipAccount, tipAmount);

		return this.createSmartTransaction(instructions, signers, lookupTables, feePayer);
	}

	addTipInstruction(
		instructions: TransactionInstruction[],
		feePayer: PublicKey,
		tipAccount: string,
		tipAmount: number
	): void {
		const tipInstruction = SystemProgram.transfer({
			fromPubkey: feePayer,
			toPubkey: new PublicKey(tipAccount),
			lamports: tipAmount
		});

		instructions.push(tipInstruction);
	}
}
