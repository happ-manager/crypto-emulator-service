import { ArgsType, Field, Int } from "@nestjs/graphql";

import type { IPaginationArgs } from "../../interfaces/pagination-args.interface";

@ArgsType()
export class PaginationArgs implements IPaginationArgs {
	@Field(() => Int, { nullable: true })
	skip?: number;

	@Field(() => Int, { nullable: true })
	take?: number;
}
