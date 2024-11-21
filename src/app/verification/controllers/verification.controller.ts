import { Body, Controller, Post } from "@nestjs/common";
import { ApiParam, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { TokenAddress } from "../../shared/decorators/token-address.decorator";
import { TOKEN_ADDRESS_PARAM } from "../../shared/swagger/constants/swagger-params.constant";
import { VERIFICATION } from "../constants/verification.constant";
import { VERIFICATION_ENDPOINTS } from "../constants/verification-endpoints.constant";
import { VerificationService } from "../services/verification.service";

@ApiTags(VERIFICATION)
@Controller(VERIFICATION)
export class VerificationController {
	constructor(private readonly _verificationService: VerificationService) {}

	@ApiParam(TOKEN_ADDRESS_PARAM)
	@Post(VERIFICATION_ENDPOINTS.CHECK)
	async check(@TokenAddress() address: string) {
		return this._verificationService.check(address);
	}
}
