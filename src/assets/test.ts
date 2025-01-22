export const remote = [
	{
		id: "52db8f48-0019-4ff9-8a6c-fa22690abc3e",
		name: "Сигнал",
		type: "SIGNAL",
		groupOperator: "AND",
		value: null,
		position: 0,
		__typename: "MilestoneEntity",
		refMilestone: null,
		conditionsGroups: [],
		checkedTransaction: {
			id: "826ef327-9a2d-402b-8222-3dd86afe3b45",
			createdAt: "2025-01-13T11:39:50.002Z",
			updatedAt: "2025-01-13T11:39:50.002Z",
			poolAddress: "FWyxRVursqPcKcGVarNJpgYneThm6yjn4hKaTmLvmkmJ",
			date: "2025-01-13T11:39:46.990Z",
			price: "0.0000675113123333635",
			nextPrice: "0.0000675113123333635",
			signature: "3oqzc4jZaUvSH38CaZtKNzgCKLhSTTth6eX6okqXuTWWna1ftf9dMhi3HP7T6P1gRwKcs4GnCgrhdWdZVeGssVLy",
			author: "39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg"
		},
		delayedTransaction: {
			id: "81bc1ca6-0dab-4796-a9b5-9788dc938c84",
			createdAt: "2025-01-13T11:39:50.002Z",
			updatedAt: "2025-01-13T11:39:50.002Z",
			poolAddress: "FWyxRVursqPcKcGVarNJpgYneThm6yjn4hKaTmLvmkmJ",
			date: "2025-01-13T11:39:47.283Z",
			price: "0.00008904340378173885",
			nextPrice: "0.00011692673527150522",
			signature: "3kZHudRcgpmi498Tj3PBHMXKwHmegckLJVTCsPP1iaukvUFskuWcXW9QHwe3asd7Cs2Mh11dV7MNHNiQbHWSwvLi",
			author: "3NhHuo8tspCsaZe751Uhdtx4PzBbowJ29jg6RGjF6rr6"
		}
	},
	{
		id: "d91d6e14-52b8-419e-b67e-70e7abb6a532",
		name: "Покупка",
		type: "BUY",
		groupOperator: "AND",
		value: "100%",
		position: 1,
		__typename: "MilestoneEntity",
		refMilestone: {
			id: "52db8f48-0019-4ff9-8a6c-fa22690abc3e",
			name: "Сигнал",
			__typename: "MilestoneEntity"
		},
		conditionsGroups: [
			{
				id: "5198ba83-40a6-4347-90bc-566259df3fbc",
				groupOperator: "AND",
				__typename: "ConditionsGroupEntity",
				refMilestone: {
					id: "52db8f48-0019-4ff9-8a6c-fa22690abc3e",
					name: "Сигнал",
					__typename: "MilestoneEntity"
				},
				refConditionsGroup: null,
				conditions: [
					{
						id: "ecebda56-5c1f-4897-9897-15369241f7f9",
						value: "0",
						operator: "MORE_EQUAL",
						field: "DATE_DIFF",
						__typename: "ConditionEntity",
						refMilestone: {
							id: "52db8f48-0019-4ff9-8a6c-fa22690abc3e",
							name: "Сигнал",
							__typename: "MilestoneEntity"
						},
						refConditionsGroup: null
					}
				]
			}
		],
		checkedTransaction: {
			id: "81bc1ca6-0dab-4796-a9b5-9788dc938c84",
			createdAt: "2025-01-13T11:39:50.002Z",
			updatedAt: "2025-01-13T11:39:50.002Z",
			poolAddress: "FWyxRVursqPcKcGVarNJpgYneThm6yjn4hKaTmLvmkmJ",
			date: "2025-01-13T11:39:47.283Z",
			price: "0.00008904340378173885",
			nextPrice: "0.00011692673527150522",
			signature: "3kZHudRcgpmi498Tj3PBHMXKwHmegckLJVTCsPP1iaukvUFskuWcXW9QHwe3asd7Cs2Mh11dV7MNHNiQbHWSwvLi",
			author: "3NhHuo8tspCsaZe751Uhdtx4PzBbowJ29jg6RGjF6rr6"
		},
		delayedTransaction: {
			id: "05300545-6686-4804-8721-3f14f29ba386",
			createdAt: "2025-01-13T11:39:50.002Z",
			updatedAt: "2025-01-13T11:39:50.002Z",
			poolAddress: "FWyxRVursqPcKcGVarNJpgYneThm6yjn4hKaTmLvmkmJ",
			date: "2025-01-13T11:39:47.629Z",
			price: "0.0001204025507901129",
			nextPrice: "0.00012010160092046386",
			signature: "24z4xJd3eYo3mXNamX8S46t4Yy1H6WCssq57KR284iawWXEkWPzCNjiUpn4tE8STgNmxuhm62raeETexMUArEi4e",
			author: "CZY9M9BywshFAFjPw7uLgXw9yGtNL26YypLCJdewiHo"
		}
	},
	{
		id: "33a44ed7-b42a-4f74-8968-48365fa34163",
		name: "Продажа",
		type: "SELL",
		groupOperator: "AND",
		value: "100%",
		position: 2,
		__typename: "MilestoneEntity",
		refMilestone: {
			id: "d91d6e14-52b8-419e-b67e-70e7abb6a532",
			name: "Покупка",
			__typename: "MilestoneEntity"
		},
		conditionsGroups: [
			{
				id: "c7c6e8ea-2ca2-4ed8-96e1-a58cddd6bb8e",
				groupOperator: "AND",
				__typename: "ConditionsGroupEntity",
				refMilestone: {
					id: "d91d6e14-52b8-419e-b67e-70e7abb6a532",
					name: "Покупка",
					__typename: "MilestoneEntity"
				},
				refConditionsGroup: null,
				conditions: [
					{
						id: "a675b220-575a-40aa-a20a-d9f8664ed62a",
						value: "30",
						operator: "MORE_EQUAL",
						field: "DATE_DIFF",
						__typename: "ConditionEntity",
						refMilestone: {
							id: "d91d6e14-52b8-419e-b67e-70e7abb6a532",
							name: "Покупка",
							__typename: "MilestoneEntity"
						},
						refConditionsGroup: null
					}
				]
			}
		],
		checkedTransaction: {
			id: "39482186-d457-4a94-8eeb-51d072767c19",
			createdAt: "2025-01-13T11:39:50.002Z",
			updatedAt: "2025-01-13T11:39:50.002Z",
			poolAddress: "FWyxRVursqPcKcGVarNJpgYneThm6yjn4hKaTmLvmkmJ",
			date: "2025-01-13T11:39:47.925Z",
			price: "0.00011095067891417287",
			nextPrice: "0.00010299233812076342",
			signature: "43RPcbo6MKT4juThMUy3E4FpeK3e4ZpYFFrL8YpCeeNWeaDZRroZeBfxWfbw13mqjXv3fCfCumuzjPBuKbUzHkof",
			author: "3NhHuo8tspCsaZe751Uhdtx4PzBbowJ29jg6RGjF6rr6"
		},
		delayedTransaction: {
			id: "170e59f3-b610-4a04-8bc5-434848eb7a63",
			createdAt: "2025-01-13T11:39:50.002Z",
			updatedAt: "2025-01-13T11:39:50.002Z",
			poolAddress: "FWyxRVursqPcKcGVarNJpgYneThm6yjn4hKaTmLvmkmJ",
			date: "2025-01-13T11:39:47.965Z",
			price: "0.00010325051768384046",
			nextPrice: "0.00010299244348656531",
			signature: "YmdS2HmGC9W5adcdJc2raq4UUkrCQwfxKJYihGjz1VgQK1YcWK4rKB3i4ANnQcT9LQzADtGHHH1DZinuxY1C6Zx",
			author: "66ZC9U8y1uYaAxt4WFYVW11YZeZohvi8ev6wBHsAxykh"
		}
	}
];

export const andrey = [
	{
		id: "52db8f48-0019-4ff9-8a6c-fa22690abc3e",
		name: "Сигнал",
		type: "SIGNAL",
		groupOperator: "AND",
		value: null,
		position: 0,
		__typename: "MilestoneEntity",
		refMilestone: null,
		conditionsGroups: [],
		checkedTransaction: {
			id: "2e9cf395-627c-405a-b53e-8bafc39e22e8",
			createdAt: "2025-01-13T09:50:00.009Z",
			updatedAt: "2025-01-13T09:50:00.009Z",
			poolAddress: "FWyxRVursqPcKcGVarNJpgYneThm6yjn4hKaTmLvmkmJ",
			date: "2025-01-13T09:49:59.805Z",
			price: "0.00023869404713496177",
			nextPrice: "0.0002392903410451293",
			signature: "236u7oStw4kiGz5x4cck4tZLKezB16oo6Ue9hkg2WMhc8mykjAfrqAWZ2VAqQoHzxefCSwYjaUkUiBTvAh68XeEi",
			author: "62j9ELFPMMsEbPKii78FLtJeEKhXPEAUqwRox4ZQbDcQ"
		},
		delayedTransaction: {
			id: "2e9cf395-627c-405a-b53e-8bafc39e22e8",
			createdAt: "2025-01-13T09:50:00.009Z",
			updatedAt: "2025-01-13T09:50:00.009Z",
			poolAddress: "FWyxRVursqPcKcGVarNJpgYneThm6yjn4hKaTmLvmkmJ",
			date: "2025-01-13T09:49:59.805Z",
			price: "0.00023869404713496177",
			nextPrice: "0.0002392903410451293",
			signature: "236u7oStw4kiGz5x4cck4tZLKezB16oo6Ue9hkg2WMhc8mykjAfrqAWZ2VAqQoHzxefCSwYjaUkUiBTvAh68XeEi",
			author: "62j9ELFPMMsEbPKii78FLtJeEKhXPEAUqwRox4ZQbDcQ"
		}
	},
	{
		id: "d91d6e14-52b8-419e-b67e-70e7abb6a532",
		name: "Покупка",
		type: "BUY",
		groupOperator: "AND",
		value: "100%",
		position: 1,
		__typename: "MilestoneEntity",
		refMilestone: {
			id: "52db8f48-0019-4ff9-8a6c-fa22690abc3e",
			name: "Сигнал",
			__typename: "MilestoneEntity"
		},
		conditionsGroups: [
			{
				id: "5198ba83-40a6-4347-90bc-566259df3fbc",
				groupOperator: "AND",
				__typename: "ConditionsGroupEntity",
				refMilestone: {
					id: "52db8f48-0019-4ff9-8a6c-fa22690abc3e",
					name: "Сигнал",
					__typename: "MilestoneEntity"
				},
				refConditionsGroup: null,
				conditions: [
					{
						id: "ecebda56-5c1f-4897-9897-15369241f7f9",
						value: "0",
						operator: "MORE_EQUAL",
						field: "DATE_DIFF",
						__typename: "ConditionEntity",
						refMilestone: {
							id: "52db8f48-0019-4ff9-8a6c-fa22690abc3e",
							name: "Сигнал",
							__typename: "MilestoneEntity"
						},
						refConditionsGroup: null
					}
				]
			}
		],
		checkedTransaction: {
			id: "8fc97149-f682-459e-a904-9c2547eeb717",
			createdAt: "2025-01-13T09:50:00.009Z",
			updatedAt: "2025-01-13T09:50:00.009Z",
			poolAddress: "FWyxRVursqPcKcGVarNJpgYneThm6yjn4hKaTmLvmkmJ",
			date: "2025-01-13T09:49:59.805Z",
			price: "0.0002398919853453686",
			nextPrice: "0.0002392936607784185",
			signature: "2FVsn8gc5nRFjYtfQcVzykj6xXt4RCoZVNczabu534nswxXXGPN2uA7f5PXVC2NJbZFqKbpeY1djvHcsWbsx3Vcq",
			author: "Hc4uGv4Y7GoQUJG5PKUAwRpYdioBtc1GAVG5NcwrU6xr"
		},
		delayedTransaction: {
			id: "8fc97149-f682-459e-a904-9c2547eeb717",
			createdAt: "2025-01-13T09:50:00.009Z",
			updatedAt: "2025-01-13T09:50:00.009Z",
			poolAddress: "FWyxRVursqPcKcGVarNJpgYneThm6yjn4hKaTmLvmkmJ",
			date: "2025-01-13T09:49:59.805Z",
			price: "0.0002398919853453686",
			nextPrice: "0.0002392936607784185",
			signature: "2FVsn8gc5nRFjYtfQcVzykj6xXt4RCoZVNczabu534nswxXXGPN2uA7f5PXVC2NJbZFqKbpeY1djvHcsWbsx3Vcq",
			author: "Hc4uGv4Y7GoQUJG5PKUAwRpYdioBtc1GAVG5NcwrU6xr"
		}
	}
];
