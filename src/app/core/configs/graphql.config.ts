import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import type { GqlModuleAsyncOptions, GqlOptionsFactory } from "@nestjs/graphql";
import { registerEnumType } from "@nestjs/graphql";
import { join } from "path";

import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { SortOrderEnum } from "../../shared/enums/sort-order.enum";
import type { IGqlContext } from "../../shared/graphql/interfaces/gql-context.interface";
import { ConditionFieldEnum } from "../../strategies/enums/condition-field.enum";
import { GroupOperatorEnum } from "../../strategies/enums/group-operator.enum";
import { MilestoneTypeEnum } from "../../strategies/enums/milestone-type.enum";
import { OperatorEnum } from "../../strategies/enums/operator.enum";
import { PredefinedStrategyEnum } from "../../strategies/enums/predefined-strategy.enum";

export const GRAPHQL_CONFIG: GqlModuleAsyncOptions<ApolloDriverConfig, GqlOptionsFactory<ApolloDriverConfig>> = {
	useFactory: () => ({
		playground: false,
		sortSchema: true,
		plugins: [ApolloServerPluginLandingPageLocalDefault()],
		autoSchemaFile: join(process.cwd(), "src/schema.gql"),
		context: ({ req }): IGqlContext => ({ req })
	}),
	driver: ApolloDriver
};

registerEnumType(SortOrderEnum, { name: "sortOrder" });
registerEnumType(ErrorsEnum, { name: "errorsEnum" });
registerEnumType(PredefinedStrategyEnum, { name: "predefinedStrategyEnum" });
registerEnumType(GroupOperatorEnum, { name: "groupOperatorEnum" });
registerEnumType(MilestoneTypeEnum, { name: "milestoneTypeEnum" });
registerEnumType(ConditionFieldEnum, { name: "conditionFieldEnum" });
registerEnumType(OperatorEnum, { name: "operatorEnum" });
