import { BaseEntity, ISignal } from "@happ-manager/crypto-api";
import { ObjectType } from "@nestjs/graphql";
import { Column, Entity } from "typeorm";

@ObjectType()
@Entity({ name: "signals" })
export class SignalEntity extends BaseEntity implements ISignal {
	@Column()
	source: string;

	@Column({ nullable: true })
	tokenAddress?: string;

	@Column({ nullable: true })
	poolAddress?: string;

	@Column("timestamptz")
	signaledAt: Date;
}
