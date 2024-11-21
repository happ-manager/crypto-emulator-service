import { Resolver } from "@nestjs/graphql";

import { WalletEntity } from "../entities/wallet.entity";

@Resolver(() => WalletEntity)
export class WalletResolver {}
