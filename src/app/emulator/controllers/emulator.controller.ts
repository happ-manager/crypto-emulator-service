import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { EMULATOR } from "../constants/emulator.constant";
import { EMULATOR_ENDPOINTS } from "../constants/emulator-endpoints.constant";
import { IEmulateBody } from "../interfaces/emulator-body.interface";
import { EmulatorService } from "../services/emulator.service";

@ApiTags(EMULATOR)
@Controller(EMULATOR_ENDPOINTS.BASE)
export class EmulatorController {
	constructor(private readonly _emulatorService: EmulatorService) {}

	@Post(EMULATOR_ENDPOINTS.EMULATE)
	async emulate(@Body() body: IEmulateBody) {
		return this._emulatorService.emulateByStrategies(body);
	}
}
