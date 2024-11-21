import { Injectable } from "@nestjs/common";

import { CredentialsService } from "../services/credentials.service";

export interface ISettingsLoader {}

@Injectable()
export class CredentialsLoader {
	constructor(private readonly _settingsService: CredentialsService) {}
}
