import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { EMULATOR } from "../constants/emulator.constant";
import { IEmulateBody } from "../interfaces/emulator-body.interface";
import { EmulatorService } from "../services/emulator.service";

@ApiTags(EMULATOR)
@Controller(EMULATOR)
export class EmulatorController {
	constructor(private readonly _emulatorService: EmulatorService) {}

	@Post("emulate")
	async emulate(@Body() body: IEmulateBody) {
		return this._emulatorService.emulateByStrategies(body);
	}
}
