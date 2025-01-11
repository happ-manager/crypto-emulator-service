import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { TokenEntity } from "../../tokens/entities/token.entity";
import { IToken } from "../../tokens/interfaces/token.interface";
import { SIGNALS } from "../constants/signals.constant";
import type { ISignal } from "../interfaces/signal.interface";

@ObjectType()
@Entity({ name: SIGNALS })
export class SignalEntity extends BaseEntity implements ISignal {
	@Field()
	@Column()
	source: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	tokenName?: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	tokenAddress?: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	poolAddress?: string;

	@Field(() => Date)
	@Column("timestamptz")
	signaledAt: Date;

	@Field(() => TokenEntity, { nullable: true })
	@ManyToOne(() => TokenEntity, (token) => token.signals, { nullable: true, onDelete: "SET NULL" })
	token?: IToken;
}

@ObjectType()
export class PaginatedSignals extends Paginated(SignalEntity) {}
