import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CREDENTIALS } from "../constants/credentials.constant";
import { CREDENTIALS_ENDPOINTS } from "../constants/credentials-endpoints.constant";
import { AccessCredentialGuard } from "../guards/access-credential.guard";
import type { ICredential } from "../interfaces/credential.interface";
import { CredentialsService } from "../services/credentials.service";

@ApiTags(CREDENTIALS)
@Controller(CREDENTIALS_ENDPOINTS.BASE)
export class CredentialsController {
	constructor(private readonly _credentialsService: CredentialsService) {}

	@Get(CREDENTIALS_ENDPOINTS.GET_CREDENTIAL)
	async getCredential(@Param("id") id: string) {
		return this._credentialsService.getCredential({ where: { id } });
	}

	@Get(CREDENTIALS_ENDPOINTS.GET_CREDENTIALS)
	async getCredentials() {
		return this._credentialsService.getCredentials();
	}

	@Post(CREDENTIALS_ENDPOINTS.CREATE_CREDENTIAL)
	@UseGuards(AccessCredentialGuard)
	async createCredential(@Body() credential: Partial<ICredential>) {
		return this._credentialsService.createCredential(credential);
	}

	@Patch(CREDENTIALS_ENDPOINTS.UPDATE_CREDENTIAL)
	@UseGuards(AccessCredentialGuard)
	async updateCredential(@Param("id") credentialId: string, @Body() credential: Partial<ICredential>) {
		return this._credentialsService.updateCredential(credentialId, credential);
	}

	@Delete(CREDENTIALS_ENDPOINTS.DELETE_CREDENTIAL)
	@UseGuards(AccessCredentialGuard)
	async deleteCredential(@Param("id") credentialId: string) {
		return this._credentialsService.deleteCredential(credentialId);
	}
}
