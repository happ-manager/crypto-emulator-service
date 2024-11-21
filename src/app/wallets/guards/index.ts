import { AccessWalletGuard } from "./access-wallet.guard";
import { CreateWalletGuard } from "./create-wallet.guard";

export const WALLETS_GUARDS = [CreateWalletGuard, AccessWalletGuard];
