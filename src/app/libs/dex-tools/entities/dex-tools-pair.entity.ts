import { Field, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { Column, Entity } from "typeorm";

import { BaseEntity } from "../../../shared/entities/base.entity";
import { Paginated } from "../../../shared/models/paginated.model";
import { DEX_TOOLS_PAIR } from "../constant/dex-tools-entities.constant";
import type { IDexToolsPairEntity } from "../interfaces/dex-tools-pair.interface";
import { IDexToolPair } from "../interfaces/dex-tools-pair.interface";

@ObjectType()
@Entity({ name: DEX_TOOLS_PAIR })
export class DexToolsPairEntity extends BaseEntity implements IDexToolsPairEntity {
	@Field()
	@Column()
	name: string;

	@Field(() => GraphQLJSON) // Используем JSON-тип GraphQL
	@Column("jsonb")
	data: IDexToolPair;
}

@ObjectType()
export class PaginatedDexToolPairs extends Paginated(DexToolsPairEntity) {}
