import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../shared/graphql/decorators/pagination-args.decorator";
import { CreateSignalDto } from "../dtos/create-signal.dto";
import { UpdateSignalDto } from "../dtos/update-signal.dto";
import { PaginatedSignals, SignalEntity } from "../entities/signal.entity";
import { SignalsService } from "../services/signals.service";

@Resolver(() => SignalEntity)
export class SignalsResolver {
	constructor(private readonly _signalsService: SignalsService) {}

	@Query(() => PaginatedSignals)
	async signals(@Args() args: PaginationArgs) {
		return this._signalsService.getSignals(args);
	}

	@Query(() => SignalEntity)
	async signal(@Args() args: IdArgs) {
		const { id } = args;
		return this._signalsService.getSignal({ where: { id } });
	}

	@Mutation(() => SignalEntity)
	async createSignal(@Args("signal") signal: CreateSignalDto) {
		return this._signalsService.createSignal(signal);
	}

	@Mutation(() => SignalEntity)
	async updateSignal(@Args("signal") signal: UpdateSignalDto) {
		const { id, ...data } = signal;
		return this._signalsService.updateSignal(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteSignal(@Args("id") id: string) {
		return this._signalsService.deleteSignal(id);
	}
}
