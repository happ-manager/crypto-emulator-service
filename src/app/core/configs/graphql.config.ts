import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import type { GqlModuleAsyncOptions, GqlOptionsFactory } from "@nestjs/graphql";
import { registerEnumType } from "@nestjs/graphql";
import { join } from "path";

import { DateModule } from "../../libs/date";
import { DateScalar } from "../../libs/date/scalars/date.scalar";
import { PriceModule } from "../../libs/price";
import { PriceScalar } from "../../libs/price/scalars/price.scalar";
import { LoadersModule } from "../../loaders/loaders.module";
import { LoadersService } from "../../loaders/services/loaders.service";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { SortOrderEnum } from "../../shared/enums/sort-order.enum";
import type { IGqlContext } from "../../shared/graphql/interfaces/gql-context.interface";
import { ConditionFieldEnum } from "../../strategies/enums/condition-field.enum";
import { GroupOperatorEnum } from "../../strategies/enums/group-operator.enum";
import { MilestoneTypeEnum } from "../../strategies/enums/milestone-type.enum";
import { OperatorEnum } from "../../strategies/enums/operator.enum";
import { PredefinedStrategyEnum } from "../../strategies/enums/predefined-strategy.enum";
import { VerificationStatusEnum } from "../../users/enums/verification-status.enum";

export const GRAPHQL_CONFIG: GqlModuleAsyncOptions<ApolloDriverConfig, GqlOptionsFactory<ApolloDriverConfig>> = {
	imports: [LoadersModule, DateModule.forChild(), PriceModule.forChild()], // Убедитесь, что DateModule импортирован
	inject: [LoadersService, DateScalar, PriceScalar],
	useFactory: (loadersService: LoadersService, dateScalar: DateScalar, priceScalar: PriceScalar) => ({
		playground: false,
		sortSchema: true,
		plugins: [ApolloServerPluginLandingPageLocalDefault()],
		autoSchemaFile: join(process.cwd(), "src/schema.gql"),
		context: ({ req }): IGqlContext => ({ req, loaders: loadersService.loaders }),
		resolvers: {
			IDate: dateScalar,
			IPrice: priceScalar
		}
	}),
	driver: ApolloDriver
};

registerEnumType(SortOrderEnum, { name: "sortOrder" });
registerEnumType(ErrorsEnum, { name: "errorsEnum" });
registerEnumType(VerificationStatusEnum, { name: "verificationStatusEnum" });
registerEnumType(MilestoneTypeEnum, { name: "milestoneTypeEnum" });
registerEnumType(ConditionFieldEnum, { name: "conditionFieldEnum" });
registerEnumType(OperatorEnum, { name: "operatorEnum" });
registerEnumType(GroupOperatorEnum, { name: "groupOperatorEnum" });
registerEnumType(PredefinedStrategyEnum, { name: "predefinedStrategyEnum" });
