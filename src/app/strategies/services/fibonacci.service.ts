import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import Big from "big.js";
import * as dayjs from "dayjs";

import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import { consoleFormat } from "../../shared/utils/format-object.util";

// let higherLow = initTransaction.price;
// let higherHigh = initTransaction.price;
// let minPrice = higherLow;
//
// for (const transaction of restTransactions) {
// 	if (transaction.price.gt(higherHigh)) {
// 		higherHigh = transaction.price;
// 		minPrice = transaction.price;
// 		continue;
// 	}
//
// 	if (transaction.price.lt(minPrice)) {
// 		minPrice = transaction.price;
// 	}
//
// 	const fib236 = fibLevel(higherLow, higherHigh, 0.236);
//
// 	if (minPrice.lte(fib236)) {
// 		structurePoints.push({ higherLow, higherHigh });
//
// 		if (higherHigh.lte(higherLow)) {
// 			continue;
// 		}
//
// 		const fib786price = fibLevel(higherLow, higherHigh, 0.786);
//
// 		newEntryPoints.push(fib786price);
// 		newExitPoints.push({
// 			stop: fibLevel(higherLow, Big(fib786price), 0.5),
// 			take: fibLevel(Big(fib786price), higherHigh, 0.5)
// 		});
//
// 		higherLow = minPrice;
// 		higherHigh = higherLow;
// 		minPrice = higherLow;
// 	}
//
// 	consoleFormat({ higherLow, higherHigh });
// }

interface IStructurePoint {
	higherLow: Big; // HL
	higherHigh: Big; // HH
}

interface IEntry {
	fromHL: IBaseTransaction;
	toHH: IBaseTransaction;
	fib786price: number;
}

export function fibLevel(x: Big, y: Big, ratio: number): number {
	const firstNumber = x.toNumber();
	const secondNumber = y.toNumber();

	return secondNumber - (secondNumber - firstNumber) * ratio;
}

interface IExitPoint {
	take: number;
	stop: number;
}

@Injectable()
export class FibonacciService implements OnModuleInit {
	isItWave = [0.75, 0.82, 0.81, 0.86, 0.84];

	onModuleInit(): any {
		setTimeout(async () => {
			const transactions: IBaseTransaction[] = [];

			const startDate = Date.now();

			let entryPoints = [];
			let exitPoints = [];

			for (const [index, price] of this.isItWave.entries()) {
				transactions.push({ date: dayjs(startDate), price: Big(price), author: "" });

				const result: any = this.checkFibonacciStartegy(transactions, entryPoints, exitPoints);

				if (!result) {
					continue;
				}

				if (result?.newEntryPoints.length > 0) {
					entryPoints = result?.newEntryPoints;
					console.log("Можно заходить");
					consoleFormat(entryPoints);
				}

				if (result?.newExitPoints?.length > 0) {
					exitPoints = result?.newExitPoints;
					console.log("Можно выходить");
					consoleFormat(exitPoints);
				} else {
					console.log(result);
				}

				//
				// consoleFormat(result?.newEntryPoints);
				// consoleFormat(result?.newExitPoints);
			}

			// this.defineStructure(transactions);
		}, 100);
	}

	checkFibonacciStartegy(transactions: IBaseTransaction[], entryPoints?: number[], exitPoints?: IExitPoint[]) {
		const [initTransaction, ...restTransactions] = transactions;
		const currentTransaction = transactions.at(-1);
		const price = currentTransaction.price.toNumber();
		const structurePoints: IStructurePoint[] = [];
		const newEntryPoints: number[] = [];
		const newExitPoints: IExitPoint[] = [];

		if (currentTransaction.price.lt(initTransaction.price)) {
			return "EXIT STRATEGY";
		}

		for (const exitPoint of exitPoints || []) {
			if (price <= exitPoint.stop || price >= exitPoint.take) {
				return "EXIT";
			}
		}

		for (const entryPoint of entryPoints || []) {
			if (price <= entryPoint) {
				return "ENTER";
			}
		}

		const higherLow = initTransaction.price;

		for (const [index, transaction] of restTransactions.entries()) {
			const previousTransaction = restTransactions[index - 1] || initTransaction;

			if (transaction.price.gt(previousTransaction.price)) {
				// Пока так
			}

			if (transaction.price.lt(previousTransaction.price)) {
				const potentialY = previousTransaction.price;

				const fib236 = fibLevel(higherLow, potentialY, 0.236);

				if (transaction.price.lte(fib236)) {
					// Коррекция
				} else {
				}
			}
		}

		return { newEntryPoints, newExitPoints };
	}

	defineStructure(tokenData: IBaseTransaction[]) {
		// Условно считаем, что стартуем с первого элемента как начальный HL
		// и первый поиск HH тоже начинаем оттуда.
		// Можно добавить проверки, если надо.

		// Если в коде уже присутствовали подобные переменные – адаптируйте.
		const startPrice = tokenData[0].price;

		// Минимум (HL) и максимум (HH) для текущей волны
		let currentHL: IBaseTransaction = { ...tokenData[0] }; // x0
		let currentHH: IBaseTransaction = { ...tokenData[0] }; // y0

		// Массив со всеми зафиксированными волнами (x, y)
		const structurePoints: IStructurePoint[] = [];

		// Для контроля «валидности» HH через пересечение 0.236
		//   - Когда мы выносим очередной HH в “structurePoints”?
		//   - Когда цена уходит ниже fibLevel(x, y, 0.236)
		//     либо когда появляется новый high?
		//
		// currentWaveMinPrice — запоминаем минимальное значение
		// цены после того, как мы получили новый HH, но ещё не подтвердили его.
		// Если этот минимум уходит за 0.236 – HH считается валидным.
		let currentWaveMinPrice = currentHH.price;

		// Храним потенциальные уровни входа:
		// [ { fromHL: x1, toHH: y1, fib786price: number }, ... ]
		//
		// Тут будем складывать уровни, по которым будем открывать позицию,
		// если цена вернётся к fibLevel( x1, y1, 0.786 ).
		let potentialEntries: IEntry[] = [];

		// Функция для добавления нового «потенциального» уровня входа на 0.786
		function addPotentialEntry(x: IBaseTransaction, y: IBaseTransaction) {
			// Убеждаемся, что y.price > x.price
			if (y.price <= x.price) {
				return;
			}
			// const fib786price = this.fibLevel(x.price, y.price, 0.786);
			const fib786price = y.price.toNumber() - (y.price.toNumber() - x.price.toNumber()) * 0.786;
			potentialEntries.push({
				fromHL: x,
				toHH: y,
				fib786price
			});
		}

		// Функция, которая «подтверждает» завершение волны (x->y),
		// То есть добавляет её в structurePoints
		// И формирует уровень для входа от 0.786
		function confirmWave(x: IBaseTransaction, y: IBaseTransaction) {
			structurePoints.push({ higherHigh: x.price, higherLow: y.price });
			// Добавляем 0.786 для (x, y)
			addPotentialEntry(x, y);
		}

		// Проходимся по всем данным
		for (let i = 1; i < tokenData.length; i++) {
			const currentData = tokenData[i];

			// 1) Проверка: если цена вдруг стала меньше стартовой,
			//    то структура “искажена” (isIncorrectStructure = true),
			//    в примере просто выходим из цикла.
			if (currentData.price < startPrice) {
				console.log(`Структура нарушена — цена(${currentData.price}) < startPrice(${startPrice})`);
				break;
			}

			// 2) Ищем новый High
			//    Если текущая цена > currentHH.price, значит это новый High
			//    (продолжаем растущую волну).
			if (currentData.price > currentHH.price) {
				currentHH = { ...currentData };
				// Сбрасываем минимальную цену после обновления High,
				// так как у нас новое HH, и ещё не проверяли 0.236
				currentWaveMinPrice = currentData.price;
			} else {
				// Если текущая цена не выше, чем currentHH,
				// проверяем, ушла ли цена ниже уровня 0.236
				// относительно текущих x(HL) и y(HH).

				if (currentData.price < currentWaveMinPrice) {
					currentWaveMinPrice = currentData.price;
				}
				const fib236 = fibLevel(currentHL.price, currentHH.price, 0.236);

				// Если минимум после HH опустился ниже fib236,
				// значит текущий HH «подтверждается» (волна формируется).
				// -> Записываем волновую структуру X->Y
				// -> После этого ищем новый X, который должен быть
				//    минимальным значением после пробития 0.236.
				if (currentWaveMinPrice.lte(fib236)) {
					// 1) Подтверждаем волну (X->Y)
					confirmWave(currentHL, currentHH);

					// 2) Устанавливаем новый HL:
					//    По условию: "это минимальное значение до куда опускалась цена
					//    после пересечения 0.236"
					//    То есть currentWaveMinPrice является кандидатом на x1.

					// currentWaveMinPrice - 0.5
					currentHL = {
						date: currentData.date,
						price: currentWaveMinPrice,
						author: ""
					};

					// 3) Текущий HH ещё не знаем — это может быть
					//    либо тот же currentHH, либо дальше появится новый.
					//    Но раз мы «закрыли волну x->y», то давайте считаем,
					//    что пока currentHH = currentHL (обнулить).
					currentHH = { ...currentHL };

					// 4) Сбрасываем currentWaveMinPrice в HL.price,
					//    т.к. мы начинаем новый цикл отслеживания HH.
					currentWaveMinPrice = currentHL.price;
				}
			}

			// 3) Проверяем, не дошла ли цена до уровня 0.786
			//    для каких-то из потенциальных сделок. Если дошла и “пробила”,
			//    условно считаем, что сделка активировалась,
			//    или если она прошла ещё ниже — можно её “убрать”.
			//
			//    Либо если цена «ушла выше» старого HH, а сделка на 0.786
			//    не была выполнена, значит, ту зону можно пересмотреть
			//    (в классике – она уже неактуальна).
			//    Тут на ваше усмотрение логику.

			// Пример: если цена пробила уровень 0.786 (т.е. < fib786price) –
			// мы убираем эту потенциальную точку входа.
			// Если лишь слегка коснулась (price ~ fib786price),
			// можно сказать, что «активировалась сделка», и т.д.
			potentialEntries = potentialEntries.filter((entry) => {
				const { fib786price, toHH } = entry;

				// Если цена ушла ниже 0.786 (сильно провалилась),
				// можем «отменить» сделку
				if (currentData.price.lt(fib786price)) {
					console.log(
						`Цена(${currentData.price}) пробила 0.786(${fib786price}). Убираем зону для HL(${entry.fromHL.price})-HH(${toHH.price})`
					);
					return false; // убираем из массива potentialEntries
				}

				// Если цена обновила toHH (стала выше, чем old HH),
				// значит волна y0 устарела, и зона входа «не сработала».
				// Можем либо удалить, либо оставить – решается логикой ТС.
				if (currentData.price > toHH.price) {
					console.log(
						`Цена(${currentData.price}) выше предыдущего HH(${toHH.price}). Зона HL(${entry.fromHL.price})-HH(${toHH.price}) неактуальна. Убираем.`
					);
					return false;
				}

				// Если ничего из вышеуказанного не произошло, оставляем зону в списке
				return true;
			});
		}

		// Если остались незафиксированные волны (к примеру,
		// последние x->y так и не «подтвердились» через 0.236),
		// можно по желанию их дописать. Но это уже детали реализации.

		if (structurePoints.length <= 0 || potentialEntries.length <= 0) {
			return;
		}

		// Посмотрим, что получилось
		console.log("=== Итоговая структура (X->Y) ===");
		for (const [idx, sp] of structurePoints.entries()) {
			console.log(`Волна #${idx + 1}: HL=${sp.higherLow} (date=${sp}) -> HH=${sp.higherHigh} (date=$)`);
		}

		console.log("\n=== Потенциальные уровни входа (на конец цикла) ===");
		for (const [idx, entry] of potentialEntries.entries()) {
			console.log(
				`Entry #${idx + 1}: HL(${entry.fromHL.price}) -> HH(${entry.toHH.price}) => fib(0.786)=${entry.fib786price}`
			);
		}

		console.log("--------------------------\n\n");
	}
}
