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

	private async getConditionsGroupWithConditions(conditionsGroup: DeepPartial<IConditionsGroup>) {
		const conditionsToCreate: any[] = (conditionsGroup.conditions || []).map((condition: ICondition) => ({
			...condition,
			conditionsGroup: { id: conditionsGroup.id }
		}));
		const conditions = await this._conditionsService.createConditions(conditionsToCreate);

		return { ...conditionsGroup, conditions };
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
			const conditionsGroupWithConditions = await this.getConditionsGroupWithConditions(conditionsGroup);
			const savedConditionsGroup = await this._conditionsGroupsRepository.save(conditionsGroupWithConditions);
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
			const processedGroups = await Promise.all(
				conditionsGroups.map((group: IConditionsGroup) => this.getConditionsGroupWithConditions(group))
			);
			const savedConditionsGroups = await this._conditionsGroupsRepository.save(processedGroups);
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
			const conditionsGroupWithConditions = await this.getConditionsGroupWithConditions({ id, ...conditionsGroup });
			const savedConditionsGroup = await this._conditionsGroupsRepository.save(conditionsGroupWithConditions);
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
		const conditions = await this._conditionsService.getConditions({
			where: { conditionsGroup: { id: In(ids) } }
		});
		const conditionIds = conditions.data.map((condition) => condition.id);

		if (conditionIds.length > 0) {
			await this._conditionsService.deleteConditions(conditionIds);
		}

		try {
			await this._conditionsGroupsRepository.delete(ids);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(`deleteConditionsGroups ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
