import { Resolver } from "@nestjs/graphql";

import { TradingTokenEntity } from "../../entities/trading-token.entity";

@Resolver(() => TradingTokenEntity)
export class TradingTokenResolver {}
