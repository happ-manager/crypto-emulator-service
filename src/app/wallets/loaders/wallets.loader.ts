import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { WalletEntity } from "../entities/wallet.entity";
import { WalletsService } from "../services/wallets.service";

export interface IWalletsLoader {
	getTargetWalletsByTrading: DataLoader<string, WalletEntity | null>;
	getSourceWalletsByTrading: DataLoader<string, WalletEntity | null>;
}

@Injectable()
export class WalletsLoader {
	constructor(private readonly _walletsService: WalletsService) {}

	createTargetWalletsByTradingsLoader() {
		return new DataLoader<string, WalletEntity | null>(async (walletsIds: string[]) => {
			const { data } = await this._walletsService.getWallets({
				where: { targetTradings: { id: In(walletsIds) } },
				relations: ["targetTradings"]
			});

			return walletsIds.map((id) => data.find((wallet) => wallet.targetTradings.some((c) => c.id === id)) || null);
		});
	}

	createSourceWalletsByTradingsLoader() {
		return new DataLoader<string, WalletEntity | null>(async (walletsIds: string[]) => {
			const { data } = await this._walletsService.getWallets({
				where: { sourceTradings: { id: In(walletsIds) } },
				relations: ["sourceTradings"]
			});

			return walletsIds.map((id) => data.find((wallet) => wallet.sourceTradings.some((c) => c.id === id)) || null);
		});
	}
}
