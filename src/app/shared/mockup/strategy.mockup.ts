import type { IStrategy } from "../../strategies/interfaces/strategy.interface";

export const STRATEGY_MOCKUP = {
	id: "90813a1f-d59f-4ea4-bc9d-52876d1610a0",
	createdAt: "2025-01-05T16:41:41.395Z",
	updatedAt: "2025-01-05T16:41:41.395Z",
	name: "Тест",
	description: null,
	predefinedStrategy: null,
	milestones: [
		{
			id: "a34d999c-a7d6-4031-856c-21042b4c3212",
			createdAt: "2025-01-05T16:54:02.160Z",
			updatedAt: "2025-01-05T16:54:02.160Z",
			name: "Покупка",
			description: null,
			groupOperator: "AND",
			type: "BUY",
			value: "100%",
			position: 1,
			refMilestone: {
				id: "0ff33e8a-453f-46c9-86ae-8679d5aedf3e",
				createdAt: "2025-01-05T16:54:02.160Z",
				updatedAt: "2025-01-05T16:54:02.160Z",
				name: "Сигнал",
				description: null,
				groupOperator: "AND",
				type: "SIGNAL",
				value: null,
				position: 0
			},
			conditionsGroups: [
				{
					id: "c9b4e5bd-93de-4ca0-9268-de5a78f7182a",
					createdAt: "2025-01-05T16:54:02.482Z",
					updatedAt: "2025-01-05T16:54:02.482Z",
					name: "Группа #1",
					description: "",
					groupOperator: "AND",
					duration: 0,
					refMilestone: {
						id: "0ff33e8a-453f-46c9-86ae-8679d5aedf3e",
						createdAt: "2025-01-05T16:54:02.160Z",
						updatedAt: "2025-01-05T16:54:02.160Z",
						name: "Сигнал",
						description: null,
						groupOperator: "AND",
						type: "SIGNAL",
						value: null,
						position: 0
					},
					refConditionsGroup: null,
					conditions: [
						{
							id: "a03ceef4-6c53-4f9d-8b89-ad1f4207c882",
							createdAt: "2025-01-05T16:54:02.823Z",
							updatedAt: "2025-01-05T16:54:02.823Z",
							field: "DATE_DIFF",
							operator: "LESS_EQUAL",
							value: "1000",
							refMilestone: {
								id: "0ff33e8a-453f-46c9-86ae-8679d5aedf3e",
								createdAt: "2025-01-05T16:54:02.160Z",
								updatedAt: "2025-01-05T16:54:02.160Z",
								name: "Сигнал",
								description: null,
								groupOperator: "AND",
								type: "SIGNAL",
								value: null,
								position: 0
							},
							refConditionsGroup: null
						}
					]
				},
				{
					id: "e6463292-6e30-406a-b1ea-8dcbea23df8c",
					createdAt: "2025-01-05T16:54:02.482Z",
					updatedAt: "2025-01-05T16:54:02.482Z",
					name: "Группа #2",
					description: "",
					groupOperator: "AND",
					duration: 3000,
					refMilestone: null,
					refConditionsGroup: {
						id: "c9b4e5bd-93de-4ca0-9268-de5a78f7182a",
						createdAt: "2025-01-05T16:54:02.482Z",
						updatedAt: "2025-01-05T16:54:02.482Z",
						name: "Группа #1",
						description: "",
						groupOperator: "AND",
						duration: 0
					},
					conditions: [
						{
							id: "4eaa540c-40b1-4e19-a190-44ebff8ae0ff",
							createdAt: "2025-01-05T16:54:02.823Z",
							updatedAt: "2025-01-05T16:54:02.823Z",
							field: "PRICE",
							operator: "MORE",
							value: "40",
							refMilestone: null,
							refConditionsGroup: {
								id: "c9b4e5bd-93de-4ca0-9268-de5a78f7182a",
								createdAt: "2025-01-05T16:54:02.482Z",
								updatedAt: "2025-01-05T16:54:02.482Z",
								name: "Группа #1",
								description: "",
								groupOperator: "AND",
								duration: 0
							}
						},
						{
							id: "a03ceef4-6c53-4f9d-8b89-ad1f4207c882",
							createdAt: "2025-01-05T16:54:02.823Z",
							updatedAt: "2025-01-05T16:54:02.823Z",
							field: "DATE_DIFF",
							operator: "LESS_EQUAL",
							value: "15000",
							refMilestone: null,
							refConditionsGroup: {
								id: "c9b4e5bd-93de-4ca0-9268-de5a78f7182a",
								createdAt: "2025-01-05T16:54:02.482Z",
								updatedAt: "2025-01-05T16:54:02.482Z",
								name: "Группа #1",
								description: "",
								groupOperator: "AND",
								duration: 0
							}
						}
					]
				}
			]
		},
		{
			id: "fa54f91f-7b78-4624-8552-c8094be37b7e",
			createdAt: "2025-01-05T16:54:02.160Z",
			updatedAt: "2025-01-05T16:54:02.160Z",
			name: "Продажа",
			description: null,
			groupOperator: "AND",
			type: "SELL",
			value: "100%",
			position: 2,
			refMilestone: {
				id: "a34d999c-a7d6-4031-856c-21042b4c3212",
				createdAt: "2025-01-05T16:54:02.160Z",
				updatedAt: "2025-01-05T16:54:02.160Z",
				name: "Покупка",
				description: null,
				groupOperator: "AND",
				type: "BUY",
				value: "100%",
				position: 1
			},
			conditionsGroups: [
				{
					id: "b5009cf5-b989-40d3-808a-72a234a47b8c",
					createdAt: "2025-01-05T16:54:02.482Z",
					updatedAt: "2025-01-05T16:54:02.482Z",
					name: "Группа #1",
					description: "",
					groupOperator: "AND",
					duration: 0,
					refMilestone: {
						id: "a34d999c-a7d6-4031-856c-21042b4c3212",
						createdAt: "2025-01-05T16:54:02.160Z",
						updatedAt: "2025-01-05T16:54:02.160Z",
						name: "Покупка",
						description: null,
						groupOperator: "AND",
						type: "BUY",
						value: "100%",
						position: 1
					},
					refConditionsGroup: null,
					conditions: [
						{
							id: "3589e3ae-35f5-4420-ac68-e178a0d8ca9a",
							createdAt: "2025-01-05T16:54:02.823Z",
							updatedAt: "2025-01-05T16:54:02.823Z",
							field: "PRICE_DIFF",
							operator: "MORE",
							value: "10%",
							refMilestone: {
								id: "a34d999c-a7d6-4031-856c-21042b4c3212",
								createdAt: "2025-01-05T16:54:02.160Z",
								updatedAt: "2025-01-05T16:54:02.160Z",
								name: "Покупка",
								description: null,
								groupOperator: "AND",
								type: "BUY",
								value: "100%",
								position: 1
							},
							refConditionsGroup: null
						}
					]
				}
			]
		},
		{
			id: "0ff33e8a-453f-46c9-86ae-8679d5aedf3e",
			createdAt: "2025-01-05T16:54:02.160Z",
			updatedAt: "2025-01-05T16:54:02.160Z",
			name: "Сигнал",
			description: null,
			groupOperator: "AND",
			type: "SIGNAL",
			value: null,
			position: 0,
			refMilestone: null,
			conditionsGroups: []
		}
	]
} as any as IStrategy;
