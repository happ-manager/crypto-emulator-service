import { ApiPropertyOptional } from "@nestjs/swagger";

export class GenerateSettingsDto {
	@ApiPropertyOptional({ description: "Макс. кол-во воркеров", example: 100 })
	maxWorkers: number;

	@ApiPropertyOptional({ description: "Время начало", example: 0 })
	hourRangeStart: number;

	@ApiPropertyOptional({ description: "Время конец", example: 24 })
	hourRangeEnd: number;

	@ApiPropertyOptional({ description: "Шаг времени", example: 8 })
	hourRangeStep: number;

	@ApiPropertyOptional({ description: "Инвестиция", example: 100 })
	investment?: number;

	@ApiPropertyOptional({ description: "Задержка", example: 1000 })
	delay?: number;

	@ApiPropertyOptional({ description: "Сколько сигналов пропускаем", example: 0 })
	signalsSkip?: number;

	@ApiPropertyOptional({ description: "Сколько сигналов берем", example: 5 })
	signalsTake?: number;

	@ApiPropertyOptional({ description: "Начальное значение процента покупки", example: -5 })
	buyPercentStart?: number;

	@ApiPropertyOptional({ description: "Конечное значение процента покупки", example: -75 })
	buyPercentEnd?: number;

	@ApiPropertyOptional({ description: "Шаг изменения процента покупки", example: -5 })
	buyPercentStep?: number;

	@ApiPropertyOptional({ description: "Начальное значение высокой цены продажи", example: 5 })
	sellHighStart?: number;

	@ApiPropertyOptional({ description: "Конечное значение высокой цены продажи", example: 75 })
	sellHighEnd?: number;

	@ApiPropertyOptional({ description: "Шаг изменения процента для высокой цены продажи", example: 5 })
	sellHighStep?: number;

	@ApiPropertyOptional({ description: "Начальное значение низкой цены продажи", example: 5 })
	sellLowStart?: number;

	@ApiPropertyOptional({ description: "Конечное значение низкой цены продажи", example: 75 })
	sellLowEnd?: number;

	@ApiPropertyOptional({ description: "Шаг изменения процента для низкой цены продажи", example: 5 })
	sellLowStep?: number;

	@ApiPropertyOptional({ description: "Начальное значение минимального времени", example: 1000 })
	minTimeStart?: number;

	@ApiPropertyOptional({ description: "Конечное значение минимального времени", example: 5000 })
	minTimeEnd?: number;

	@ApiPropertyOptional({ description: "Минимальный временной шаг", example: 1000 })
	minTimeStep?: number;

	@ApiPropertyOptional({ description: "Начальное значение максимального времени", example: 100_000 })
	maxTimeStart?: number;

	@ApiPropertyOptional({ description: "Конечное значение максимального времени", example: 150_000 })
	maxTimeEnd?: number;

	@ApiPropertyOptional({ description: "Максимальный временной шаг", example: 10_000 })
	maxTimeStep?: number;
}
