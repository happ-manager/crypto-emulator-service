import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { SIGNALS } from "../constants/signals.constant";
import { SIGNALS_ENDPOINTS } from "../constants/signals-endpoints.constant";
import { AccessSignalGuard } from "../guards/access-signal.guard";
import type { ISignal } from "../interfaces/signal.interface";
import { SignalsService } from "../services/signals.service";

@ApiTags(SIGNALS)
@Controller(SIGNALS_ENDPOINTS.BASE)
export class SignalsController {
	constructor(private readonly _signalsService: SignalsService) {}

	@Get(SIGNALS_ENDPOINTS.GET_SIGNAL)
	async getSignal(@Param("id") id: string) {
		return this._signalsService.getSignal({ where: { id } });
	}

	@Get(SIGNALS_ENDPOINTS.GET_SIGNALS)
	async getSignals() {
		return this._signalsService.getSignals();
	}

	@Post(SIGNALS_ENDPOINTS.CREATE_SIGNAL)
	@UseGuards(AccessSignalGuard)
	async createSignal(@Body() signal: Partial<ISignal>) {
		return this._signalsService.createSignal(signal);
	}

	@Patch(SIGNALS_ENDPOINTS.UPDATE_SIGNAL)
	@UseGuards(AccessSignalGuard)
	async updateSignal(@Param("id") signalId: string, @Body() signal: Partial<ISignal>) {
		return this._signalsService.updateSignal(signalId, signal);
	}

	@Delete(SIGNALS_ENDPOINTS.DELETE_SIGNAL)
	@UseGuards(AccessSignalGuard)
	async deleteSignal(@Param("id") signalId: string) {
		return this._signalsService.deleteSignal(signalId);
	}
}
