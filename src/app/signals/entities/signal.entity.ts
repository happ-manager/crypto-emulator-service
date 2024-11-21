import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToOne } from "typeorm";

import { DateColumn } from "../../libs/date/decorators/date-column.decorator";
import { IDate } from "../../libs/date/interfaces/date.interface";
import { DateScalar } from "../../libs/date/scalars/date.scalar";
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

	@Field(() => DateScalar)
	@DateColumn()
	signaledAt: IDate;

	@Field(() => TokenEntity, { nullable: true })
	@OneToOne(() => TokenEntity, (token) => token.signal, { nullable: true })
	token?: IToken;
}

@ObjectType()
export class PaginatedSignals extends Paginated(SignalEntity) {}
