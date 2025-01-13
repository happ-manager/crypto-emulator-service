import { Query, Resolver } from "@nestjs/graphql";

import { ErrorsEnum } from "../enums/errors.enum";

@Resolver()
export class EnumsResolver {
	@Query(() => [ErrorsEnum])
	getErrors() {
		return Object.values(ErrorsEnum);
	}
}
