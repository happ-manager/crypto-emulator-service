import { BadRequestException, Injectable } from "@nestjs/common";
import type { CustomScalar } from "@nestjs/graphql";
import { Scalar } from "@nestjs/graphql";
import type { Dayjs } from "dayjs";
import type { ValueNode } from "graphql";
import { Kind } from "graphql";

import { DateService } from "../services/date.service";

@Scalar("IDate")
@Injectable()
export class DateScalar implements CustomScalar<string, Dayjs> {
	constructor(private readonly dateService: DateService) {}

	description = "DateTime custom scalar for Dayjs with DateService";

	serialize(value: Dayjs | string): string {
		const date = this.dateService.date(value);
		return date.isValid() ? date.toISOString() : null;
	}

	parseValue(value: string): Dayjs {
		const parsedDate = this.dateService.date(value);
		if (!parsedDate.isValid()) {
			throw new BadRequestException("Invalid date format");
		}
		return parsedDate;
	}

	parseLiteral(ast: ValueNode): Dayjs {
		if (ast.kind === Kind.STRING) {
			const parsedDate = this.dateService.date(ast.value);
			if (!parsedDate.isValid()) {
				throw new BadRequestException("Invalid date format in AST");
			}
			return parsedDate;
		}
		throw new BadRequestException("Invalid date literal type");
	}
}
