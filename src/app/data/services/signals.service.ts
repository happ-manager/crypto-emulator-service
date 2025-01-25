import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";

import { SignalEntity } from "../entities/signal.entity";

@Injectable()
export class SignalsService {
	constructor(@InjectRepository(SignalEntity) private readonly _signalsRepository: Repository<SignalEntity>) {}

	get repository() {
		return this._signalsRepository;
	}

	async getSignals(options?: FindManyOptions<SignalEntity>) {
		return this._signalsRepository.find(options);
	}
}
