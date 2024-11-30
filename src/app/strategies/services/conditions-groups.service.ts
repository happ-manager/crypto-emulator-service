import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { In } from "typeorm";
import { Repository } from "typeorm";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { ConditionsGroupEntity } from "../entities/conditions-group.entity";
import type { ICondition } from "../interfaces/condition.interface";
import type { IConditionsGroup } from "../interfaces/conditions-group.interface";
import { ConditionsService } from "./conditions.service";

@Injectable()
export class ConditionsGroupsService {
	constructor(
		@InjectRepository(ConditionsGroupEntity)
		private readonly _conditionsGroupsRepository: Repository<ConditionsGroupEntity>,
		private readonly _eventsService: EventsService,
		private readonly _conditionsService: ConditionsService,
		private readonly _loggerService: LoggerService
	) {}

	async recreateConditionsGroups(conditionsGroups: DeepPartial<IConditionsGroup>[]) {
		const savedConditionsGroups = await this._conditionsGroupsRepository.save(conditionsGroups);

		const conditionsToCreate = conditionsGroups.reduce(
			(conditions, conditionsGroup) => [
				...conditions,
				...conditionsGroup.conditions.map((condition: ICondition) => ({
					conditionsGroup: { id: conditionsGroup.id },
					...condition
				}))
			],
			[]
		);

		const conditions = await this._conditionsService.createConditions(conditionsToCreate);

		return { ...savedConditionsGroups, conditions };
	}

	async getConditionsGroup(options?: FindOneOptions<ConditionsGroupEntity>) {
		return this._conditionsGroupsRepository.findOne(options);
	}

	async getConditionsGroups(options?: FindManyOptions<ConditionsGroupEntity>) {
		const [data, count] = await this._conditionsGroupsRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createConditionsGroup(conditionsGroup: DeepPartial<IConditionsGroup>) {
		try {
			const savedConditionsGroup = await this._conditionsGroupsRepository.save(conditionsGroup);
			const foundConditionsGroup = await this._conditionsGroupsRepository.findOne({
				where: { id: savedConditionsGroup.id }
			});

			this._eventsService.emit(EventsEnum.CONDITIONS_GROUP_CREATED, foundConditionsGroup);

			return foundConditionsGroup;
		} catch (error) {
			this._loggerService.error(`createConditionsGroup ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async createConditionsGroups(conditionsGroups: DeepPartial<IConditionsGroup[]>) {
		try {
			const savedConditionsGroups = await this._conditionsGroupsRepository.save(conditionsGroups);
			const savedConditionsGroupsIDs = savedConditionsGroups.map((conditionsGroup) => conditionsGroup.id);
			const foundConditionsGroups = await this._conditionsGroupsRepository.find({
				where: { id: In(savedConditionsGroupsIDs) },
				relations: ["conditions"]
			});

			this._eventsService.emit(EventsEnum.CONDITIONS_GROUPS_CREATED, foundConditionsGroups);

			return foundConditionsGroups;
		} catch (error) {
			this._loggerService.error(`createConditionsGroups ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateConditionsGroup(id: string, conditionsGroup: DeepPartial<IConditionsGroup>) {
		try {
			const savedConditionsGroup = await this._conditionsGroupsRepository.save({ id, ...conditionsGroup });
			const foundConditionsGroup = await this._conditionsGroupsRepository.findOne({
				where: { id: savedConditionsGroup.id }
			});

			this._eventsService.emit(EventsEnum.CONDITIONS_GROUP_UPDATED, foundConditionsGroup);

			return foundConditionsGroup;
		} catch (error) {
			this._loggerService.error(`updateConditionsGroup ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteConditionsGroup(id: string) {
		try {
			await this._conditionsGroupsRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(`deleteConditionsGroup ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteConditionsGroups(ids: string[]) {
		try {
			await this._conditionsGroupsRepository.delete(ids);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(`deleteConditionsGroups ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
