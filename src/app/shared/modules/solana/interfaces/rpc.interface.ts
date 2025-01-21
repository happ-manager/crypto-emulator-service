import type { Connection } from "@solana/web3.js";

import type { ITokenAsset } from "../../helius/interfaces/token-asset.interface";

export interface IRpc {
	connection: Connection;
	getAsset: (mintAddress: string) => Promise<ITokenAsset>;
}
