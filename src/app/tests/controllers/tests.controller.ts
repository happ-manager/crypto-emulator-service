import { Body, Controller, Get, Query } from "@nestjs/common";
import { ApiParam, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { Date } from "../../libs/date/decorators/date.decorator";
import { IDate } from "../../libs/date/interfaces/date.interface";
import { IDexToolsPeriod } from "../../libs/dex-tools/interfaces/dex-tools-period.interface";
import { PairId } from "../../shared/decorators/pair-id.decorator";
import { PAIR_ID_PARAM } from "../../shared/swagger/constants/swagger-params.constant";
import {
	CHAIN_QUERY,
	DATE_QUERY,
	PERIOD_QUERY,
	UNIX_QUERY
} from "../../shared/swagger/constants/swagger-queries.constant";
import { ApiQueries } from "../../shared/swagger/decorators/api-queries.decorator";
import { TESTS } from "../constants/tests.constant";
import { TESTS_ENDPOINTS } from "../constants/tests-endpoints.constant";
import { TestsService } from "../services/tests.service";

@ApiTags(TESTS)
@Controller(TESTS_ENDPOINTS.BASE)
export class TestsController {
	constructor(private readonly testsService: TestsService) {}

	@ApiParam(PAIR_ID_PARAM)
	@ApiQueries([UNIX_QUERY, DATE_QUERY, CHAIN_QUERY, PERIOD_QUERY])
	@Get(TESTS_ENDPOINTS.GET_CANDLES)
	async getCandles(
		@PairId() pairId: string,
		@Query("chain") chain?: string,
		@Query("period") period?: IDexToolsPeriod,
		@Date("unix") unixDate?: IDate,
		@Date("date") date?: IDate
	) {
		return this.testsService.getCandles(pairId, chain, date || unixDate, period);
	}

	@ApiParam(PAIR_ID_PARAM)
	@ApiQueries([UNIX_QUERY, DATE_QUERY, CHAIN_QUERY, PERIOD_QUERY])
	@Get(TESTS_ENDPOINTS.GET_FORMATED_CANDLES)
	async getFormatedCandles(
		@PairId() pairId: string,
		@Query("chain") chain?: string,
		@Query("period") period?: IDexToolsPeriod,
		@Date("unix") unixDate?: IDate,
		@Date("date") date?: IDate
	) {
		return this.testsService.getFormatedCandles(pairId, chain, date || unixDate, period);
	}
}
