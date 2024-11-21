import { Field, Int, ObjectType } from "@nestjs/graphql";

export type ClassType<T = any> = new (...args: any[]) => T;

export function Paginated<T>(TItemClass: ClassType<T>) {
	@ObjectType({ isAbstract: true })
	abstract class PaginatedAbstract {
		@Field(() => [TItemClass])
		data: T[];

		@Field(() => Int)
		totalCount: number;

		@Field(() => Int)
		page: number;
	}

	return PaginatedAbstract;
}
