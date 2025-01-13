import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { In } from "typeorm";
import { Repository } from "typeorm";

import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { EventsEnum } from "../../shared/enums/events.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { MilestoneEntity } from "../entities/milestone.entity";
import type { IConditionsGroup } from "../interfaces/conditions-group.interface";
import type { IMilestone } from "../interfaces/milestone.interface";
import { ConditionsGroupsService } from "./conditions-groups.service";

@Injectable()
export class MilestonesService {
	private readonly _loggerService = new Logger("MilestonesService");

	constructor(
		@InjectRepository(MilestoneEntity)
		private readonly _milestonesRepository: Repository<MilestoneEntity>,
		private readonly _eventsService: EventEmitter2,
		private readonly _conditionsGroupsService: ConditionsGroupsService
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
			this._loggerService.error(error, "createMilestone");
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
			this._loggerService.error(error, "createMilestones");
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
			this._loggerService.error(error, "updateMilestone");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteMilestone(id: string) {
		try {
			await this._milestonesRepository.delete(id);

			this._eventsService.emit(EventsEnum.MILESTONE_DELETED, id);

			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deleteMilestone");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteMilestones(ids: string[]) {
		try {
			await this._milestonesRepository.delete(ids);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deleteMilestones");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
