import { Injectable } from "@nestjs/common";

import { CandlesService } from "../services/candles.service";

export interface ICandlesLoader {}

@Injectable()
export class CandlesLoader {
	constructor(private readonly _candlesService: CandlesService) {}
}
