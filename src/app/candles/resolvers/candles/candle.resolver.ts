import { Resolver } from "@nestjs/graphql";

import { CandleEntity } from "../../entities/candle.entity";

@Resolver(() => CandleEntity)
export class CandleResolver {}
