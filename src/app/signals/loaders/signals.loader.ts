import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { SignalEntity } from "../entities/signal.entity";
import { SignalsService } from "../services/signals.service";

export interface ISignalsLoader {
	getSignalByToken: DataLoader<string, SignalEntity | null>;
}

@Injectable()
export class SignalsLoader {
	constructor(private readonly _signalsService: SignalsService) {}

	createSignalByTokenLoader() {
		return new DataLoader<string, SignalEntity | null>(async (tokenIds: string[]) => {
			const { data } = await this._signalsService.getSignals({
				where: { token: { id: In(tokenIds) } },
				relations: ["token"]
			});

			return tokenIds.map((tokenId) => data.find((signal) => signal.token?.id === tokenId) || null);
		});
	}
}
