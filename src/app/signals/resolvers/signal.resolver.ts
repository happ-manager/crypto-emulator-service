import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Loaders } from "../../loaders/decorators/loaders.decorator";
import { ILoaders } from "../../loaders/interfaces/loaders.interface";
import { TokenEntity } from "../../tokens/entities/token.entity";
import { SignalEntity } from "../entities/signal.entity";

@Resolver(() => SignalEntity)
export class SignalResolver {
	@ResolveField(() => TokenEntity, { nullable: true })
	async token(@Parent() signal: SignalEntity, @Loaders() loaders: ILoaders): Promise<TokenEntity | null> {
		return loaders.getTokenBySignal.load(signal.id);
	}
}
