import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

import type { ILoaders } from "../interfaces/loaders.interface";

export const Loaders = createParamDecorator((data: unknown, context: ExecutionContext) => {
	const gqlContext = GqlExecutionContext.create(context);
	return gqlContext.getContext().loaders as ILoaders;
});
