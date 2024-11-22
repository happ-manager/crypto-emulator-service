import { Injectable } from "@nestjs/common";
import { In, IsNull, Not } from "typeorm";

import type { ICandle } from "../../candles/interfaces/candle.interface";
import { CandlesService } from "../../candles/services/candles.service";
import { findCandle } from "../../candles/utils/find-candle.util";
import { LoggerService } from "../../libs/logger";
import { getPercentChange } from "../../shared/utils/get-percent-change.util";
import { getPercentOf } from "../../shared/utils/get-percent-of.util";
import { sleep } from "../../shared/utils/sleep.util";
import type { ISignal } from "../../signals/interfaces/signal.interface";
import { SignalsService } from "../../signals/services/signals.service";
import { ActionTypeEnum } from "../../strategies/enums/action-type.enum";
import { CandleFieldEnum } from "../../strategies/enums/candle-field.enum";
import { OperatorEnum } from "../../strategies/enums/operator.enum";
import { RelatedToEnum } from "../../strategies/enums/related-to.enum";
import type { ICondition } from "../../strategies/interfaces/condition.interface";
import type { IConditionsGroup } from "../../strategies/interfaces/conditions-group.interface";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import type { IStrategy } from "../../strategies/interfaces/strategy.interface";
import { StrategiesService } from "../../strategies/services/strategies.service";
import { checkGroupOperator } from "../utils/check-group-operator.util";
import { checkOperator } from "../utils/check-operator.util";

const PRICE_FIELDS = new Set([CandleFieldEnum.LOW, CandleFieldEnum.HIGH]);

function getConditionValue(condition: ICondition) {
	return condition.value * (condition.operator === OperatorEnum.MORE ? 1 : -1);
}

@Injectable()
export class EmulatorService {
	constructor(
		private readonly _signalsService: SignalsService,
		private readonly _strategiesService: StrategiesService,
		private readonly _loggerService: LoggerService,
		private readonly _candlesService: CandlesService
	) {}

	async emulate(signals: ISignal[], sources: string[], strategies: IStrategy[], investment = 100) {
		const signalsWhere = signals.length > 0 ? { id: In(signals.map((signal) => signal.id)) } : { source: In(sources) };

		const findedSignals = await this._signalsService.getSignals({
			where: { ...signalsWhere, token: { dexToolsPairId: Not(IsNull()) } },
			take: 1000,
			relations: ["token"]
		});
		const findedStrategies = await this._strategiesService.getStrategies({
			where: {
				id: In(strategies.map((strategy) => strategy.id))
			},
			take: 1000,
			relations: ["milestones", "milestones.conditionsGroups", "milestones.conditionsGroups.conditions"]
		});

		const results = [];

		for (const [index, signal] of findedSignals.data.entries()) {
			await sleep(100);
			this._loggerService.log(`Fetch signal #${index + 1} of ${findedSignals.data.length}`);

			const { data } = await this._candlesService.getCandles({
				where: { poolAddress: signal.tokenAddress }
			});

			const candles = data.filter((candle) => candle.openPrice.gt(0));
			const signalCandle = findCandle(candles, signal.signaledAt);
			const strategiesResults = {};

			for (const strategy of findedStrategies.data) {
				const sortedMilestones = strategy.milestones.sort((a, b) => a.position - b.position);
				const enterMilesone = sortedMilestones.find((milestone) => milestone.actionType === ActionTypeEnum.ENTER);
				const exitMilestones = sortedMilestones.filter((milestone) => milestone.actionType === ActionTypeEnum.EXIT);

				let tokenBalance = 0;
				let enterCandle: ICandle = signalCandle;

				strategiesResults[strategy.name] = { enterPrice: 0, exitPrice: 0, milestones: {} };

				if (enterMilesone) {
					const checkedMilestone = this.checkMilestone(candles, enterMilesone, signalCandle, enterCandle);

					if (!checkedMilestone) {
						continue;
					}

					const enterTokens = getPercentOf(investment, enterMilesone.value);

					enterCandle = checkedMilestone.candle;
					tokenBalance += enterTokens;

					strategiesResults[strategy.name].enterPrice = tokenBalance;
					strategiesResults[strategy.name].milestones[enterMilesone.name] = {
						candle: enterCandle,
						enterPrice: tokenBalance
					};
				}

				const candlesAfterEnter = candles.filter((candle) => candle.openDate.isSameOrAfter(enterCandle.openDate));

				for (const milestone of exitMilestones) {
					const checkedMilestone = this.checkMilestone(candlesAfterEnter, milestone, signalCandle, enterCandle);

					if (!checkedMilestone) {
						continue;
					}

					const priceCondition: ICondition = checkedMilestone.milestone.conditionsGroups
						.reduce((pre, cur) => [...pre, ...cur.conditions], [])
						.find((condition: ICondition) => PRICE_FIELDS.has(condition.field));

					const exitCandle = checkedMilestone.candle;
					const exitTokens = getPercentOf(tokenBalance, milestone.value);
					const priceDiff = priceCondition
						? getConditionValue(priceCondition)
						: enterCandle.openPrice.percentDiff(exitCandle.maxPrice).toNumber();
					const exitTokenPrice = getPercentChange(1, priceDiff);
					const exitPrice = exitTokens * exitTokenPrice;

					tokenBalance -= exitTokens;

					strategiesResults[strategy.name].exitPrice += exitPrice;
					strategiesResults[strategy.name].milestones[milestone.name] = { candle: exitCandle, exitPrice, priceDiff };
				}
			}

			results.push({
				signal,
				signalCandle,
				strategies: strategiesResults
			});
		}

		return results;
	}

	checkMilestone(candles: ICandle[], milestone: IMilestone, signalCandle: ICandle, enterCandle: ICandle) {
		for (const candle of candles) {
			const conditionsGroups = milestone.conditionsGroups.map((group) =>
				this.checkConditionsGroup(group, candle, signalCandle, enterCandle)
			);

			const checkedConditionsGroups = checkGroupOperator(conditionsGroups, milestone.groupOperator);

			if (checkedConditionsGroups.length === 0) {
				continue;
			}

			return { candle, milestone: { ...milestone, conditionsGroups: checkedConditionsGroups } };
		}
	}

	checkConditionsGroup(group: IConditionsGroup, candle: ICandle, signalCandle: ICandle, enterCandle: ICandle) {
		const conditions = group.conditions.map((condition) =>
			this.checkCondition(condition, candle, signalCandle, enterCandle)
		);

		const checkedConditions = checkGroupOperator(conditions, group.groupOperator);

		return checkedConditions.length > 0 ? { ...group, conditions: checkedConditions } : null;
	}

	checkCondition(condition: ICondition, candle: ICandle, signalCandle: ICandle, enterCandle: ICandle) {
		const releatedCandle = condition.relatedTo === RelatedToEnum.SIGNAL ? signalCandle : enterCandle;

		const candleValue = {
			[CandleFieldEnum.FIRST_TIMESTAMP]: candle.openDate.unix() - releatedCandle.openDate.unix(),
			[CandleFieldEnum.LAST_TIMESTAMP]: candle.closeDate.unix() - releatedCandle.closeDate.unix(),
			[CandleFieldEnum.HIGH]: releatedCandle.openPrice.percentDiff(candle.maxPrice).toNumber(),
			[CandleFieldEnum.LOW]: releatedCandle.openPrice.percentDiff(candle.minPrice).toNumber()
		}[condition.field];

		const isCondition = checkOperator(candleValue, condition.value, condition.operator);

		return isCondition ? condition : null;
	}
}
