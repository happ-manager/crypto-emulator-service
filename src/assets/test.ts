export const t = {
	id: "d847ecea-7055-4557-a666-3ce08cc3f3ba",
	name: "easy",
	createdAt: "2024-12-24T20:22:53.645Z",
	updatedAt: "2024-12-24T20:22:53.645Z",
	milestones: [
		{
			id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
			name: "Сигнал",
			type: "SIGNAL",
			value: null,
			position: 0,
			createdAt: "2024-12-24T20:28:10.864Z",
			updatedAt: "2024-12-24T20:28:10.864Z",
			description: null,
			refMilestone: null,
			groupOperator: "AND",
			conditionsGroups: []
		},
		{
			id: "bbcb4935-80a3-4ed4-aae4-ffff2dcdd170",
			name: "Вход",
			type: "BUY",
			value: "100%",
			position: 1,
			createdAt: "2024-12-27T14:46:35.431Z",
			updatedAt: "2024-12-27T14:46:35.431Z",
			description: null,
			refMilestone: {
				id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
				name: "Сигнал",
				type: "SIGNAL",
				value: null,
				position: 0,
				createdAt: "2024-12-24T20:28:10.864Z",
				updatedAt: "2024-12-24T20:28:10.864Z",
				description: null,
				groupOperator: "AND"
			},
			groupOperator: "AND",
			conditionsGroups: [
				{
					id: "e4633b91-a036-4ee5-8cde-311aa34f7196",
					name: "Вход на +30%",
					duration: 5,
					createdAt: "2024-12-27T14:46:35.710Z",
					updatedAt: "2024-12-27T14:46:35.710Z",
					conditions: [
						{
							id: "9a89846b-a564-4fdc-bed5-75ac9a4f024a",
							field: "PRICE",
							value: "900%",
							operator: "MORE_EQUAL",
							createdAt: "2024-12-27T14:46:36.034Z",
							updatedAt: "2024-12-27T14:46:36.034Z",
							refMilestone: {
								id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
								name: "Сигнал",
								type: "SIGNAL",
								value: null,
								position: 0,
								createdAt: "2024-12-24T20:28:10.864Z",
								updatedAt: "2024-12-24T20:28:10.864Z",
								description: null,
								groupOperator: "AND"
							},
							refConditionsGroup: null
						}
					],
					description: "",
					refMilestone: {
						id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
						name: "Сигнал",
						type: "SIGNAL",
						value: null,
						position: 0,
						createdAt: "2024-12-24T20:28:10.864Z",
						updatedAt: "2024-12-24T20:28:10.864Z",
						description: null,
						groupOperator: "AND"
					},
					groupOperator: "AND",
					refConditionsGroup: null
				}
			]
		},
		{
			id: "98058a38-adcc-4d7e-86d7-e25bb49300fc",
			name: "Выход",
			type: "SELL",
			value: "100%",
			position: 2,
			createdAt: "2024-12-25T18:11:48.970Z",
			updatedAt: "2024-12-25T18:11:48.970Z",
			description: null,
			refMilestone: {
				id: "bbcb4935-80a3-4ed4-aae4-ffff2dcdd170",
				name: "Вход",
				type: "BUY",
				value: "100%",
				position: 1,
				createdAt: "2024-12-27T14:46:35.431Z",
				updatedAt: "2024-12-27T14:46:35.431Z",
				description: null,
				groupOperator: "AND"
			},
			groupOperator: "OR",
			conditionsGroups: [
				{
					id: "9100e7fd-ed41-45db-aa15-bde0a8208877",
					name: "Выход на +45% или -1%",
					duration: 0,
					createdAt: "2024-12-25T18:11:49.190Z",
					updatedAt: "2024-12-25T18:11:49.190Z",
					conditions: [
						{
							id: "24908762-6e32-4de6-8e7e-4d07668d34d2",
							field: "PRICE",
							value: "-1%",
							operator: "LESS_EQUAL",
							createdAt: "2024-12-25T18:11:49.443Z",
							updatedAt: "2024-12-25T18:11:49.443Z",
							refMilestone: {
								id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
								name: "Сигнал",
								type: "SIGNAL",
								value: null,
								position: 0,
								createdAt: "2024-12-24T20:28:10.864Z",
								updatedAt: "2024-12-24T20:28:10.864Z",
								description: null,
								groupOperator: "AND"
							},
							refConditionsGroup: null
						},
						{
							id: "71065d95-1b4f-49d6-9950-efcb8f6986cf",
							field: "PRICE",
							value: "75%",
							operator: "MORE_EQUAL",
							createdAt: "2024-12-25T17:10:53.835Z",
							updatedAt: "2024-12-25T17:10:53.835Z",
							refMilestone: {
								id: "bbcb4935-80a3-4ed4-aae4-ffff2dcdd170",
								name: "Вход",
								type: "BUY",
								value: "100%",
								position: 1,
								createdAt: "2024-12-27T14:46:35.431Z",
								updatedAt: "2024-12-27T14:46:35.431Z",
								description: null,
								groupOperator: "AND"
							},
							refConditionsGroup: null
						}
					],
					description: "",
					refMilestone: {
						id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
						name: "Сигнал",
						type: "SIGNAL",
						value: null,
						position: 0,
						createdAt: "2024-12-24T20:28:10.864Z",
						updatedAt: "2024-12-24T20:28:10.864Z",
						description: null,
						groupOperator: "AND"
					},
					groupOperator: "OR",
					refConditionsGroup: null
				}
			]
		}
	],
	description: null,
	checkedMilestones: [
		{
			id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
			name: "Сигнал",
			type: "SIGNAL",
			value: null,
			position: 0,
			createdAt: "2024-12-24T20:28:10.864Z",
			updatedAt: "2024-12-24T20:28:10.864Z",
			description: null,
			refMilestone: null,
			groupOperator: "AND",
			conditionsGroups: [],
			checkedTransaction: {
				date: "2024-12-27T21:29:24.442Z",
				pool: {
					id: "10e22d20-9340-4c82-96f8-eb3b70005299",
					lpMint: "CqxuzKJYyQ4xN2TdmzYdwgxjZH6wtqKoLbQFLj8nbpKj",
					address: "6McCc34NkkAoUpSC3EzKyCGdctDEpsb2V394ZxrnvNMm",
					lpVault: "11111111111111111111111111111111",
					version: 4,
					baseMint: "So11111111111111111111111111111111111111112",
					marketId: "2JtdcbW3cyu7N31CgeetcP2gqheNNssLUKcT4yr1P9at",
					authority: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
					baseVault: "79VbS4yBFZyCbUv6iAdQGuYNcvTty2P8QHnG4a1rEghC",
					createdAt: "2024-12-27T21:29:24.442Z",
					programId: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
					quoteMint: "BceKahvKQJWCxDV39arY9aMP9Zgc8oNNjXH1NdBCpump",
					updatedAt: "2024-12-27T21:29:24.442Z",
					lpDecimals: 9,
					marketAsks: "afuZnX8ty4babyHd3eyp8UAi1H24txcwmMLSm77hBZB",
					marketBids: "afuZnX8ty4babyHd3eyp8UAi1H24txcwmMLSm77hBZB",
					openOrders: "8CkAiYGfNr189EoYzLbkJXEhHErz5jwr3np23KRwKaEi",
					quoteVault: "m3vf6EbnPwAdCJ1XeQ5t1wNNwxMQ6oMhKNp1WsuAWjt",
					baseDecimals: 9,
					targetOrders: "afuZnX8ty4babyHd3eyp8UAi1H24txcwmMLSm77hBZB",
					marketVersion: 3,
					quoteDecimals: 6,
					withdrawQueue: "11111111111111111111111111111111",
					marketAuthority: "FRkV7f5tpxsex4x1jrj3sozWfq1RTtQFRHXfycJ5EiEz",
					marketBaseVault: "3XKFzC85bh3VtgAWqiTEbbyQZ79mNXKgiwx8B4eouWYm",
					marketProgramId: "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX",
					marketEventQueue: "11111111111111111111111111111111",
					marketQuoteVault: "m3vf6EbnPwAdCJ1XeQ5t1wNNwxMQ6oMhKNp1WsuAWjt",
					lookupTableAccount: "11111111111111111111111111111111"
				},
				price: "1.462637126",
				amount: 1000,
				author: "3bQZfQTSGdbYAWXUrkQojfHBibTN3u7NCV3kyjhKJzjk",
				signature: "2GUatMjEQtSNy6s1ytx5TYYasVzgKHtEk5ZRQUAyCcwSMvfuxaufNmYg45AndV3Qdbbev28b3cfBWgxNzeaCBVa3",
				instructionType: 1
			},
			delayedTransaction: {
				date: "2024-12-27T21:29:24.442Z",
				pool: {
					id: "10e22d20-9340-4c82-96f8-eb3b70005299",
					lpMint: "CqxuzKJYyQ4xN2TdmzYdwgxjZH6wtqKoLbQFLj8nbpKj",
					address: "6McCc34NkkAoUpSC3EzKyCGdctDEpsb2V394ZxrnvNMm",
					lpVault: "11111111111111111111111111111111",
					version: 4,
					baseMint: "So11111111111111111111111111111111111111112",
					marketId: "2JtdcbW3cyu7N31CgeetcP2gqheNNssLUKcT4yr1P9at",
					authority: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
					baseVault: "79VbS4yBFZyCbUv6iAdQGuYNcvTty2P8QHnG4a1rEghC",
					createdAt: "2024-12-27T21:29:24.442Z",
					programId: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
					quoteMint: "BceKahvKQJWCxDV39arY9aMP9Zgc8oNNjXH1NdBCpump",
					updatedAt: "2024-12-27T21:29:24.442Z",
					lpDecimals: 9,
					marketAsks: "afuZnX8ty4babyHd3eyp8UAi1H24txcwmMLSm77hBZB",
					marketBids: "afuZnX8ty4babyHd3eyp8UAi1H24txcwmMLSm77hBZB",
					openOrders: "8CkAiYGfNr189EoYzLbkJXEhHErz5jwr3np23KRwKaEi",
					quoteVault: "m3vf6EbnPwAdCJ1XeQ5t1wNNwxMQ6oMhKNp1WsuAWjt",
					baseDecimals: 9,
					targetOrders: "afuZnX8ty4babyHd3eyp8UAi1H24txcwmMLSm77hBZB",
					marketVersion: 3,
					quoteDecimals: 6,
					withdrawQueue: "11111111111111111111111111111111",
					marketAuthority: "FRkV7f5tpxsex4x1jrj3sozWfq1RTtQFRHXfycJ5EiEz",
					marketBaseVault: "3XKFzC85bh3VtgAWqiTEbbyQZ79mNXKgiwx8B4eouWYm",
					marketProgramId: "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX",
					marketEventQueue: "11111111111111111111111111111111",
					marketQuoteVault: "m3vf6EbnPwAdCJ1XeQ5t1wNNwxMQ6oMhKNp1WsuAWjt",
					lookupTableAccount: "11111111111111111111111111111111"
				},
				price: "1.462637126",
				amount: 1000,
				author: "3bQZfQTSGdbYAWXUrkQojfHBibTN3u7NCV3kyjhKJzjk",
				signature: "2GUatMjEQtSNy6s1ytx5TYYasVzgKHtEk5ZRQUAyCcwSMvfuxaufNmYg45AndV3Qdbbev28b3cfBWgxNzeaCBVa3",
				instructionType: 1
			}
		}
	]
};
