import { Field, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { Column, Entity } from "typeorm";

import { BaseEntity } from "../../../shared/entities/base.entity";
import { Paginated } from "../../../shared/models/paginated.model";
import { DEX_TOOLS_CANDLE } from "../constant/dex-tools-entities.constant";
import type { IDexToolCandle, IDexToolsCandleEntity } from "../interfaces/dex-tools-candle.interface";

@ObjectType()
@Entity({ name: DEX_TOOLS_CANDLE })
export class DexToolsCandleEntity extends BaseEntity implements IDexToolsCandleEntity {
	@Field()
	@Column()
	name: string;

	@Field(() => GraphQLJSON) // Используем JSON-тип GraphQL
	@Column("jsonb")
	data: IDexToolCandle[];
}

@ObjectType()
export class PaginatedDexToolCandles extends Paginated(DexToolsCandleEntity) {}
