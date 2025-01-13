import { environment } from "src/environments/environment";

import type { ICryptoConfig } from "../../libs/crypto";

export const CRYPTO_CONFIG: ICryptoConfig = {
	secret: environment.crypto.secret
};
