import { Injectable, Logger } from "@nestjs/common";
import type { Keypair, SendOptions } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

import { SolanaPriceService } from "../../shared/modules/solana";
import { IComputeUnits } from "../../shared/modules/solana/interfaces/compute-units.interface";
import { SolanaService } from "../../shared/modules/solana/services/solana.service";

@Injectable()
export class ExchangeService {
	private readonly _loggerService = new Logger("TradingService");

	constructor(
		private readonly _solanaService: SolanaService,
		private readonly _solanaPriceService: SolanaPriceService
	) {}

	buy(pool: any, signer: Keypair, amountInUsd: number, computeUnits: IComputeUnits, sendOptions?: SendOptions) {
		const amount = amountInUsd / this._solanaPriceService.solanaPrice;

		return this._solanaService.swap(
			new PublicKey(pool.baseMint),
			new PublicKey(pool.quoteMint),
			amount,
			signer,
			pool,
			computeUnits,
			sendOptions
		);
	}

	sell(pool: any, signer: Keypair, amount: number, computeUnits: IComputeUnits, sendOptions?: SendOptions) {
		return this._solanaService.swap(
			new PublicKey(pool.quoteMint),
			new PublicKey(pool.baseMint),
			amount,
			signer,
			pool,
			computeUnits,
			sendOptions
		);
	}
}
