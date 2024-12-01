import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Loaders } from "../../loaders/decorators/loaders.decorator";
import { ILoaders } from "../../loaders/interfaces/loaders.interface";
import { SignalEntity } from "../../signals/entities/signal.entity";
import { TokenEntity } from "../entities/token.entity";

@Resolver(() => TokenEntity)
export class TokenResolver {
	@ResolveField(() => SignalEntity, { nullable: true })
	async signal(@Parent() token: TokenEntity, @Loaders() loaders: ILoaders) {
		return loaders.getSignalsByTokens.load(token.id);
	}
}
