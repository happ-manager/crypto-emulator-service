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
import { MilestoneEntity } from "../entities/milestone.entity";
import type { IConditionsGroup } from "../interfaces/conditions-group.interface";
import type { IMilestone } from "../interfaces/milestone.interface";
import { ConditionsGroupsService } from "./conditions-groups.service";

@Injectable()
export class MilestonesService {
	constructor(
		@InjectRepository(MilestoneEntity)
		private readonly _milestonesRepository: Repository<MilestoneEntity>,
		private readonly _eventsService: EventsService,
		private readonly _conditionsGroupsService: ConditionsGroupsService,
		private readonly _loggerService: LoggerService
	) {}

	async recreateMilestones(milestones: DeepPartial<IMilestone>[]) {
		const savedMilestones = await this._milestonesRepository.save(milestones);

		const conditionsGroupsToCreate = milestones.reduce(
			(conditionsGroups, milestone) => [
				...conditionsGroups,
				...milestone.conditionsGroups.map((conditionsGroup: IConditionsGroup) => ({
					...conditionsGroup,
					milestone: { id: milestone.id }
				}))
			],
			[]
		);

		await this._conditionsGroupsService.recreateConditionsGroups(conditionsGroupsToCreate);

		return savedMilestones;
	}

	async getMilestone(options?: FindOneOptions<MilestoneEntity>) {
		return this._milestonesRepository.findOne(options);
	}

	async getMilestones(options?: FindManyOptions<MilestoneEntity>) {
		const [data, count] = await this._milestonesRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createMilestone(milestone: DeepPartial<IMilestone>) {
		try {
			const savedMilestone = await this._milestonesRepository.save(milestone);
			const foundMilestone = await this._milestonesRepository.findOne({ where: { id: savedMilestone.id } });

			this._eventsService.emit(EventsEnum.MILESTONE_CREATED, foundMilestone);

			return foundMilestone;
		} catch (error) {
			this._loggerService.error(`createMilestone ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async createMilestones(milestones: DeepPartial<IMilestone[]>) {
		try {
			const savedMilestones = await this._milestonesRepository.save(milestones);
			const savedMilestonesIds = savedMilestones.map((milestone) => milestone.id);
			const foundMilestones = await this._milestonesRepository.find({
				where: { id: In(savedMilestonesIds) }
			});

			this._eventsService.emit(EventsEnum.MILESTONES_CREATED, foundMilestones);

			return foundMilestones;
		} catch (error) {
			this._loggerService.error(`createMilestones ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateMilestone(id: string, milestone: DeepPartial<IMilestone>) {
		try {
			const savedMilestones = await this._milestonesRepository.save({ id, ...milestone });
			const foundMilestones = await this._milestonesRepository.findOne({ where: { id: savedMilestones.id } });

			this._eventsService.emit(EventsEnum.MILESTONE_UPDATED, foundMilestones);

			return foundMilestones;
		} catch (error) {
			this._loggerService.error(`updateMilestone ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteMilestone(id: string) {
		try {
			await this._milestonesRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(`deleteMilestone ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteMilestones(ids: string[]) {
		try {
			await this._milestonesRepository.delete(ids);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(`deleteMilestones ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
