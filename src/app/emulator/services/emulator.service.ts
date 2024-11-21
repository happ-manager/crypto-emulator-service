import { Injectable } from "@nestjs/common";
import { In, IsNull, Not } from "typeorm";

import { DexToolsService } from "../../libs/dex-tools";
import type { IDexToolCandle } from "../../libs/dex-tools/interfaces/dex-tools-candle.interface";
import { DexToolsUtilsService } from "../../libs/dex-tools/services/dex-tools-utils.service";
import { LoggerService } from "../../libs/logger";
import { getPercentChange } from "../../shared/utils/get-percent-change.util";
import { getPercentDiff } from "../../shared/utils/get-percent-diff.util";
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
		private readonly _dexToolsService: DexToolsService,
		private readonly _dexToolsUtilsService: DexToolsUtilsService,
		private readonly _loggerService: LoggerService
	) {}

	async onModuleInit() {
		return;
		const body: any = {
			signals: [{ id: "97905c2c-d256-434a-ae60-187a3ea96aab" }],
			strategies: [{ id: "d727441b-fbbf-42ff-a52f-2528147ec6c5" }],
			sources: []
		};

		setTimeout(async () => {
			const result = await this.emulate(body.signals, body.sources, body.strategies);
		}, 0);
	}

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
			this._loggerService.log(`Fetch page #${index + 1} of ${findedSignals.data.length}`);
			const { dexToolsPairId, chain } = signal.token;
			const pair = await this._dexToolsService.getPair(dexToolsPairId, chain);

			const period = this._dexToolsUtilsService.getPeriod(pair.creationTime);
			const adjustedDate = this._dexToolsUtilsService.getAdjustedDate(period, signal.signaledAt);
			const candles = await this._dexToolsService.getCandles(dexToolsPairId, chain, adjustedDate, period);
			const signalCandle = this._dexToolsUtilsService.getCandle(candles, signal.signaledAt);

			const strategiesResults = {};

			for (const strategy of findedStrategies.data) {
				const sortedMilestones = strategy.milestones.sort((a, b) => a.position - b.position);
				const enterMilesone = sortedMilestones.find((milestone) => milestone.actionType === ActionTypeEnum.ENTER);
				const exitMilestones = sortedMilestones.filter((milestone) => milestone.actionType === ActionTypeEnum.EXIT);

				let tokenBalance = 0;
				let enterCandle: IDexToolCandle = signalCandle;

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

				const candlesAfterEnter = candles.filter((candle) =>
					candle.firstTimestamp.isSameOrAfter(enterCandle.firstTimestamp)
				);

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
						: getPercentDiff(enterCandle.open, exitCandle.high);
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

	checkMilestone(
		candles: IDexToolCandle[],
		milestone: IMilestone,
		signalCandle: IDexToolCandle,
		enterCandle: IDexToolCandle
	) {
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

	checkConditionsGroup(
		group: IConditionsGroup,
		candle: IDexToolCandle,
		signalCandle: IDexToolCandle,
		enterCandle: IDexToolCandle
	) {
		const conditions = group.conditions.map((condition) =>
			this.checkCondition(condition, candle, signalCandle, enterCandle)
		);

		const checkedConditions = checkGroupOperator(conditions, group.groupOperator);

		return checkedConditions.length > 0 ? { ...group, conditions: checkedConditions } : null;
	}

	checkCondition(
		condition: ICondition,
		candle: IDexToolCandle,
		signalCandle: IDexToolCandle,
		enterCandle: IDexToolCandle
	) {
		const releatedCandle = condition.relatedTo === RelatedToEnum.SIGNAL ? signalCandle : enterCandle;

		const candleValue = {
			[CandleFieldEnum.FIRST_TIMESTAMP]: candle.firstTimestamp.unix() - releatedCandle.firstTimestamp.unix(),
			[CandleFieldEnum.LAST_TIMESTAMP]: candle.lastTimestamp.unix() - releatedCandle.lastTimestamp.unix(),
			[CandleFieldEnum.HIGH]: getPercentDiff(releatedCandle.open, candle.high),
			[CandleFieldEnum.LOW]: getPercentDiff(releatedCandle.open, candle.low)
		}[condition.field];

		const isCondition = checkOperator(candleValue, condition.value, condition.operator);

		return isCondition ? condition : null;
	}
}
