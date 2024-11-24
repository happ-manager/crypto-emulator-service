import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { SignalEntity } from "../../signals/entities/signal.entity";
import { ISignal } from "../../signals/interfaces/signal.interface";
import { TOKENS } from "../constants/tokens.constant";
import type { IToken } from "../interfaces/token.interface";

@ObjectType()
@Entity({ name: TOKENS })
export class TokenEntity extends BaseEntity implements IToken {
	@Field({ nullable: true })
	@Column({ nullable: true })
	name?: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	symbol?: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	chain?: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	tokenAddress?: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	poolAddress?: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	dexToolsPairId?: string;

	@Field(() => Boolean, { defaultValue: false })
	@Column("boolean", { default: false })
	verified: boolean;

	@Field(() => Boolean, { defaultValue: false })
	@Column("boolean", { default: false })
	disabled: boolean;

	@Field(() => SignalEntity, { nullable: true })
	@OneToOne(() => SignalEntity, (signal) => signal.token, { nullable: true })
	@JoinColumn()
	signal?: ISignal;
}

@ObjectType()
export class PaginatedTokens extends Paginated(TokenEntity) {}
