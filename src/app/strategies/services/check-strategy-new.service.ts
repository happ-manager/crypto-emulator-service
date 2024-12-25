import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import Big from "big.js";
import * as Day from "dayjs";

import { findTransaction } from "../../candles/utils/find-transaction.util";
import { LoggerService } from "../../libs/logger";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import type { ISignal } from "../../signals/interfaces/signal.interface";
import { ConditionFieldEnum } from "../enums/condition-field.enum";
import { MilestoneTypeEnum } from "../enums/milestone-type.enum";
import type { ICheckedTransactions } from "../interfaces/checked.interface";
import type { IMilestone } from "../interfaces/milestone.interface";
import type { IStrategy } from "../interfaces/strategy.interface";
import { getOperatorValue } from "../utils/get-operator-value.util";

const DISPLAY_FORMAT = "HH:mm:ss";

@Injectable()
export class CheckStrategyNewService implements OnModuleInit {
	constructor(private readonly _loggerService: LoggerService) {}

	onModuleInit() {
		setTimeout(() => {
			const format = "DD.MM.YYYY HH:mm:ss";
			const strategy = {
				id: "d847ecea-7055-4557-a666-3ce08cc3f3ba",
				createdAt: "2024-12-24T20:22:53.645Z",
				updatedAt: "2024-12-24T20:22:53.645Z",
				name: "easy",
				description: null,
				milestones: [
					{
						id: "bbcb4935-80a3-4ed4-aae4-ffff2dcdd170",
						createdAt: "2024-12-24T21:37:56.773Z",
						updatedAt: "2024-12-24T21:37:56.773Z",
						name: "Вход",
						description: null,
						groupOperator: "AND",
						type: "BUY",
						value: "100%",
						position: 1,
						refMilestone: {
							id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
							createdAt: "2024-12-24T20:28:10.864Z",
							updatedAt: "2024-12-24T20:28:10.864Z",
							name: "Сигнал",
							description: null,
							groupOperator: "AND",
							type: "SIGNAL",
							value: null,
							position: 2
						},
						conditionsGroups: [
							{
								id: "e4633b91-a036-4ee5-8cde-311aa34f7196",
								createdAt: "2024-12-24T21:37:57.181Z",
								updatedAt: "2024-12-24T21:37:57.181Z",
								name: "Вход на +30%",
								description: "",
								groupOperator: "AND",
								duration: 3,
								refMilestone: {
									id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
									createdAt: "2024-12-24T20:28:10.864Z",
									updatedAt: "2024-12-24T20:28:10.864Z",
									name: "Сигнал",
									description: null,
									groupOperator: "AND",
									type: "SIGNAL",
									value: null,
									position: 2
								},
								refConditionsGroup: null,
								conditions: [
									{
										id: "9a89846b-a564-4fdc-bed5-75ac9a4f024a",
										createdAt: "2024-12-24T20:28:10.946Z",
										updatedAt: "2024-12-24T20:28:10.946Z",
										field: "PRICE",
										operator: "MORE_EQUAL",
										value: "30%",
										refMilestone: {
											id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
											createdAt: "2024-12-24T20:28:10.864Z",
											updatedAt: "2024-12-24T20:28:10.864Z",
											name: "Сигнал",
											description: null,
											groupOperator: "AND",
											type: "SIGNAL",
											value: null,
											position: 2
										},
										refConditionsGroup: null
									},
									{
										id: "eeff6f30-7414-4f70-987c-01d2554fe6f6",
										createdAt: "2024-12-24T21:37:57.756Z",
										updatedAt: "2024-12-24T21:37:57.756Z",
										field: "DATE",
										operator: "LESS_EQUAL",
										value: "4",
										refMilestone: {
											id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
											createdAt: "2024-12-24T20:28:10.864Z",
											updatedAt: "2024-12-24T20:28:10.864Z",
											name: "Сигнал",
											description: null,
											groupOperator: "AND",
											type: "SIGNAL",
											value: null,
											position: 2
										},
										refConditionsGroup: null
									}
								]
							}
						]
					},
					{
						id: "98058a38-adcc-4d7e-86d7-e25bb49300fc",
						createdAt: "2024-12-24T21:34:50.330Z",
						updatedAt: "2024-12-24T21:34:50.330Z",
						name: "Выход",
						description: null,
						groupOperator: "OR",
						type: "SELL",
						value: "100%",
						position: 2,
						refMilestone: {
							id: "bbcb4935-80a3-4ed4-aae4-ffff2dcdd170",
							createdAt: "2024-12-24T21:37:56.773Z",
							updatedAt: "2024-12-24T21:37:56.773Z",
							name: "Вход",
							description: null,
							groupOperator: "AND",
							type: "BUY",
							value: "100%",
							position: 0
						},
						conditionsGroups: [
							{
								id: "9100e7fd-ed41-45db-aa15-bde0a8208877",
								createdAt: "2024-12-24T21:34:50.376Z",
								updatedAt: "2024-12-24T21:34:50.376Z",
								name: "Выход на +45% или -1%",
								description: "",
								groupOperator: "OR",
								duration: 0,
								refMilestone: {
									id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
									createdAt: "2024-12-24T20:28:10.864Z",
									updatedAt: "2024-12-24T20:28:10.864Z",
									name: "Сигнал",
									description: null,
									groupOperator: "AND",
									type: "SIGNAL",
									value: null,
									position: 2
								},
								refConditionsGroup: null,
								conditions: [
									{
										id: "71065d95-1b4f-49d6-9950-efcb8f6986cf",
										createdAt: "2024-12-24T20:28:10.946Z",
										updatedAt: "2024-12-24T20:28:10.946Z",
										field: "PRICE",
										operator: "MORE_EQUAL",
										value: "45%",
										refMilestone: {
											id: "bbcb4935-80a3-4ed4-aae4-ffff2dcdd170",
											createdAt: "2024-12-24T21:37:56.773Z",
											updatedAt: "2024-12-24T21:37:56.773Z",
											name: "Вход",
											description: null,
											groupOperator: "AND",
											type: "BUY",
											value: "100%",
											position: 0
										},
										refConditionsGroup: null
									},
									{
										id: "24908762-6e32-4de6-8e7e-4d07668d34d2",
										createdAt: "2024-12-25T10:00:16.162Z",
										updatedAt: "2024-12-25T10:00:16.162Z",
										field: "PRICE",
										operator: "LESS_EQUAL",
										value: "-1",
										refMilestone: {
											id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
											createdAt: "2024-12-24T20:28:10.864Z",
											updatedAt: "2024-12-24T20:28:10.864Z",
											name: "Сигнал",
											description: null,
											groupOperator: "AND",
											type: "SIGNAL",
											value: null,
											position: 2
										},
										refConditionsGroup: null
									}
								]
							}
						]
					},
					{
						id: "ea19142b-ce0f-4e64-b094-11e98de3dd55",
						createdAt: "2024-12-24T20:28:10.864Z",
						updatedAt: "2024-12-24T20:28:10.864Z",
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
			const transactions: IBaseTransaction[] = [
				{ date: Day("25.12.2024 11:00:00", format), price: new Big(10), author: "" },
				{ date: Day("25.12.2024 11:00:01", format), price: new Big(11), author: "" },
				{ date: Day("25.12.2024 11:00:02", format), price: new Big(11), author: "" },
				{ date: Day("25.12.2024 11:00:03", format), price: new Big(15), author: "" },
				{ date: Day("25.12.2024 11:00:04", format), price: new Big(16), author: "" },
				{ date: Day("25.12.2024 11:00:05", format), price: new Big(20), author: "" },
				{ date: Day("25.12.2024 11:00:06", format), price: new Big(22), author: "" }
				// { date: Day("25.12.2024 11:00:07", format), price: new Big(23.5), author: "" }
				// { date: Day("25.12.2024 11:00:08", format), price: new Big(9), author: "" }
			];
			const signal = {
				signaledAt: transactions[0].date
			} as any as ISignal;

			// console.log("30% от 10", new Big(10).percentOf(30).toNumber());

			this.test(strategy, transactions, signal);
		}, 1000);
	}

	test(strategy: IStrategy, transactions: IBaseTransaction[], signal: ISignal) {
		const checkedTransactions: ICheckedTransactions = {};
		const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

		if (!signalMilestone) {
			this._loggerService.log("У стратегии должен быть сигнал");
			return;
		}

		const signalTransaction = findTransaction(transactions, signal.signaledAt);

		if (!signalTransaction) {
			this._loggerService.log("Не получаеся найти транзакцию сигнала");
			return;
		}

		checkedTransactions[signalMilestone.id] = signalTransaction;

		const sortedMilestones = strategy.milestones.sort((a, b) => a.position - b.position);

		for (const milestone of sortedMilestones) {
			const checkedMilestone = this.getCheckedMilestone(milestone, transactions, checkedTransactions);

			if (!checkedMilestone) {
				continue;
			}

			console.log(checkedMilestone.name, checkedMilestone.checkedTransaction.date.format(DISPLAY_FORMAT));

			checkedTransactions[checkedMilestone.id] = checkedMilestone.checkedTransaction;
		}
	}

	getCheckedMilestone(
		milestone: IMilestone,
		transactions: IBaseTransaction[],
		checkedTransactions: ICheckedTransactions
	) {
		if (checkedTransactions[milestone.id]) {
			return { ...milestone, checkedTransaction: checkedTransactions[milestone.id] };
		}

		const refId = milestone.refMilestone?.id;

		if (!refId) {
			this._loggerService.error("У группы должна быть ссылка", "getCheckedMilestone");
			return;
		}

		const refTransaction = checkedTransactions[refId];

		if (!refTransaction) {
			return;
		}

		let index = 0;

		for (const transaction of transactions) {
			if (transaction.date.isSameOrBefore(refTransaction.date)) {
				continue;
			}

			for (const conditionsGroup of milestone.conditionsGroups) {
				for (const condition of conditionsGroup.conditions) {
					index++;

					const refId = condition.refMilestone?.id || condition.refConditionsGroup?.id;

					if (!refId) {
						this._loggerService.error("Для условия нужная транзакция", "getCheckedConditon");
						return;
					}

					const refTransaction = checkedTransactions[refId];

					if (!refTransaction) {
						return;
					}

					const isPercent = condition.value.includes("%");
					const conditioValue = Number.parseInt(condition.value);

					if (typeof conditioValue !== "number") {
						this._loggerService.error("Неправильный формат значения", "getCheckedConditon");
						return;
					}

					// Нам нужна только безпрерывна последовательность подходящих транзакций. Если между успешными транзакциями была неподходящяя - они будут в разных массивах
					const group: IBaseTransaction[][] = [[]];
					let groupIndex = 0;
					let checkedTransaction: IBaseTransaction;
					let checkedGroup: IBaseTransaction[] = [];

					let transactionValue: number;

					switch (condition.field) {
						case ConditionFieldEnum.DATE: {
							transactionValue = transaction.date.unix() - refTransaction.date.unix();
							break;
						}
						case ConditionFieldEnum.PRICE: {
							transactionValue = isPercent
								? transaction.price.percentDiff(refTransaction.price).toNumber()
								: transaction.price.minus(refTransaction.price).toNumber();

							break;
						}
						case ConditionFieldEnum.AUTHOR: {
							transactionValue = transaction.author as any as number; // TODO: Check types

							break;
						}
						// No default
					}

					const isChecked = getOperatorValue(transactionValue, conditioValue, condition.operator);

					const groupTransactions = group[groupIndex];

					if (!isChecked) {
						if (groupTransactions.length > 0) {
							group[++groupIndex] = [];
						}
						continue;
					}

					groupTransactions.push(transaction);
					const [firstTransaction] = groupTransactions;
					const duration = transaction.date.unix() - firstTransaction.date.unix();

					console.log(groupTransactions.length);

					if (duration >= conditionsGroup.duration) {
						checkedTransaction = transaction;
						checkedGroup = groupTransactions;
						break;
					}
				}
			}
		}

		console.log(index);
	}
}
