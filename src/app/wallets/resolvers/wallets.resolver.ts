import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../shared/graphql/decorators/pagination-args.decorator";
import { CreateWalletDto } from "../dtos/create-wallet.dto";
import { UpdateWalletDto } from "../dtos/update-wallet.dto";
import { PaginatedWallets, WalletEntity } from "../entities/wallet.entity";
import { WalletsService } from "../services/wallets.service";

@Resolver(() => WalletEntity)
export class WalletsResolver {
	constructor(private readonly _walletsService: WalletsService) {}

	@Query(() => PaginatedWallets)
	async wallets(@Args() args: PaginationArgs) {
		return this._walletsService.getWallets(args);
	}

	@Query(() => WalletEntity)
	async wallet(@Args() args: IdArgs) {
		const { id } = args;
		return this._walletsService.getWallet({ where: { id } });
	}

	@Mutation(() => WalletEntity)
	async createWallet(@Args("wallet") wallet: CreateWalletDto) {
		return this._walletsService.createWallet(wallet);
	}

	@Mutation(() => WalletEntity)
	async updateWallet(@Args("wallet") wallet: UpdateWalletDto) {
		const { id, ...data } = wallet;
		return this._walletsService.updateWallet(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteWallet(@Args("id") id: string) {
		return this._walletsService.deleteWallet(id);
	}
}
